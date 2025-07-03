import { spawn } from 'node:child_process'
import { Observable } from 'rxjs'

import { HLSStreamError } from './HLSStreamError'
import { HLS_STREAM_DEFAULTS, HLSStreamOptions } from './HLSStreamOptions'
import { HLSStreamProgress, parseHLSStreamProgress } from './HLSStreamProgress'

/**
 * Creates an observable that generates HLS playlist and segment files from a
 * given input file in real-time using `ffmpeg`. The generated files will be
 * placed in the specified output directory, and the observable will emit
 * {@link HLSStreamProgress} objects that report on the progress of the
 * streaming process.
 *
 * The returned observable will not create the underlying `ffmpeg` process until
 * subscribed, and each subscription will create a new `ffmpeg` process with the
 * same configuration as specified by the given input file, output directory,
 * and options ({@link HLSStreamOptions}). This is useful for "replay" and
 * "playlist" functionality, where a series of these observables can be
 * constructed and arranged before running them, but care must be exercised not
 * to subscribe to the same observable multiple times at once, as `ffmpeg` will
 * gladly try to overwrite the same output files at the same time.
 *
 * @param {string} inputFile
 * The input file to stream. Expected to be a media file with at least one
 * audio stream. If this is a relative path, it will be resolved relative to the
 * current working directory
 *
 * @param {string} workingDirectory
 * Optional directory to run `ffmpeg` in and output the resulting HLS files.
 * Defaults to the current working directory of the parent process
 *
 * @param {HLSStreamOptions} [options]
 * Optional HLS stream options. {@link HLS_STREAM_DEFAULTS} will be used to fill
 * in any missing options with default values.
 *
 * @returns
 * A cold [rxjs](https://rxjs.dev) Observable which emits
 * {@link HLSStreamProgress} events as parsed from `ffmpeg`'s output. Because
 * the observable is cold, it will not start the underlying `ffmpeg` process
 * until it is subscribed to. Its unsubscribe process checks if the underlying
 * process is still running, and if so, it sends a `SIGKILL` signal to the
 * process to terminate it. It will complete when the underlying process exits
 * with a `0` code, and errors with an {@link HLSStreamError} if the process
 * fails to start, exits with a non-zero code, or fails to parse a progress
 * update from the process output
 *
 * @see {@link https://ffmpeg.org/ffmpeg-formats.html#hls-2 | The official FFMPEG docs}
 *      to learn more about HLS streaming with `ffmpeg`.
 */
export function hlsStream(
  inputFile: string,
  workingDirectory?: string,
  options?: HLSStreamOptions
): Observable<HLSStreamProgress> {
  const args = toHLSStreamArgs(options)
  return new Observable<HLSStreamProgress>((subscriber) => {
    // keep track of whether the ffmpeg process has closed so we can avoid
    // calling ffmpeg.kill() after the PID may have been re-assigned
    let processClosed = false

    // buffer for stderr output to capture errors in case the process closes
    // with a non-zero exit code
    let stderrBuffer = Buffer.from('')

    // spawn a child process to run ffmpeg with the computed arguments
    const ffmpeg = spawn(
      'ffmpeg',
      [
        '-hide_banner', // hide stdout banner to avoid cluttering the output
        '-nostats', // hide stderr stat output to avoid cluttering error messages
        ...['-progress', 'pipe:1'], // send progress updates to stdout to be read
        '-re', // read input in "real-time" to keep stream files "live"
        ...args.seekTime, // seek to the specified time before starting the stream
        ...['-i', inputFile], // input file to stream
        ...args.maps, // map audio streams to output (multiplex for variable quality streams)
        ...args.sampleRates, // set sample rate for each output audio stream
        ...args.bitrates, // set bitrate for each output audio stream
        ...['-f', 'hls'], // specify HLS format as the output
        ...args.segmentDuration, // set length of each segment in seconds
        ...args.segmentCount, // set maximum number of segments to keep "live"
        ...[
          '-hls_flags', // flags to control HLS behavior
          // 'discont_start' - start with a discontinuity in the first segment
          // 'delete_segments' - "rotate" segments by deleting old ones
          // 'temp_file' - create temporary files before writing to the output
          // 'append_list' - add new segments to existing playlist files
          'discont_start+delete_segments+temp_file+append_list',
        ],
        ...['-hls_allow_cache', '0'], // disable caching of segments
        ...args.varStreamMap, // identify and name output streams
        ...['-strftime', '1'], // allow timestamps in segment file names
        ...args.masterPlaylistName, // set the master playlist file name
        ...args.segmentFileName, // set the segment file name pattern
        args.playlistName, // set the variable quality playlist file name pattern
      ],
      { cwd: workingDirectory } // set working directory to control output location
    )

    // append stderr data to the buffer
    ffmpeg.stderr.on('data', (data: Buffer) => {
      stderrBuffer = Buffer.concat([stderrBuffer, data])
    })

    // listen for stdout data to parse progress updates
    // and emit them to the subscriber as HLSStreamProgress objects
    ffmpeg.stdout.on('data', (data: Buffer) => {
      try {
        subscriber.next(parseHLSStreamProgress(data.toString()))
      } catch (error) {
        subscriber.error(
          new HLSStreamError('Failed to parse ffmpeg output', {
            cause: error,
          })
        )
      }
    })

    // listen for node:child_process error events
    // Spawn failed, process can't be killed and others
    // see https://nodejs.org/api/child_process.html#event-error
    ffmpeg.on('error', (error) => {
      // if the process errors, it is completed and cannot be killed
      processClosed = true
      subscriber.error(
        new HLSStreamError('ffmpeg child process failed', { cause: error })
      )
    })

    ffmpeg.on('close', (code, signal) => {
      // if the process closes, it is completed and cannot be killed
      processClosed = true
      if (code !== null) {
        switch (code) {
          case 0: // code of 0 is a success
            subscriber.complete()
            break
          default: // any other code is a failure
            subscriber.error(
              new HLSStreamError(`ffmpeg exited with code ${code}`, {
                cause: stderrBuffer.toString(),
              })
            )
        }
      } else {
        // code is null only if the process was terminated by a signal
        subscriber.error(
          new HLSStreamError(
            `ffmpeg process was terminated by signal ${signal}`,
            { cause: signal }
          )
        )
      }
    })

    // return an unsubscribe function that kills the ffmpeg process if it is
    // still running when the subscriber unsubscribes
    return function unsubscribe() {
      if (!processClosed) {
        ffmpeg.kill()
      }
    }
  })
}

/**
 * Convenience interface that represents the configurable options for HLS
 * streaming translated to partial `ffmpeg` argument lists. Not part of the
 * public API
 *
 * @see {@link https://ffmpeg.org/ffmpeg.html#Stream-specifiers-1} for
 *      information on stream specifiers (e.g `a:0`) used in many of the
 *      arguments here
 * @
 * @see {@link https://ffmpeg.org/ffmpeg-formats.html#Options-26} for
 *      information on HLS-specific arguments
 */
export interface HLSStreamArgs {
  /**
   * The time to seek to before starting the stream, in fractional seconds.
   */
  seekTime: ['-ss', string]

  /**
   * The list of audio stream mappings to include in the output.
   * Each pair of entries should be `'-map', '0:a'` to produce a new stream
   * as a copy of the first audio stream in the input file.
   */
  maps: string[]

  /**
   * The list of sample rates for each audio stream in the output.
   * Each pair of entries should be `'-ar:a:<index>', '<sampleRate>'`
   * where `<index>` is the index of the output audio stream and `<sampleRate>`
   * is the sample rate in Hz (e.g. `44100` or `44.1k`).
   *
   * @see {@link https://ffmpeg.org/ffmpeg.html#Audio-Options}
   */
  sampleRates: string[]

  /**
   * The list of bitrates for each audio stream in the output.
   * each pair of entries should be `'-b:a:<index>', '<bitrate>'`
   * where `<index>` is the index of the output audio stream and `<bitrate>`
   * is the bitrate in bits per second (e.g. `128k` or `1.53M`).
   *
   * @see
   */
  bitrates: string[]

  /**
   * The duration of each segment in seconds.
   */
  segmentDuration: ['-hls_time', string]

  /**
   * The maximum number of segments to keep in the playlist.
   */
  segmentCount: ['-hls_list_size', string]

  /**
   * The variable stream map that defines the output streams.
   * The value should be a string of the form
   * `'a:<n>,name:<n_name> a:<n+1>,name:<n+1_name> ...'`
   * where `<n>` is the index of the output audio stream and `<n_name>` is
   * the name of the output stream.
   *
   * For example, `'a:0,name:low a:1,name:medium a:2,name:high'`
   * would define three audio streams with names "low", "medium", and "high"
   * to be included as individual quality streams in the HLS output. These names
   * can be referenced in the {@link segmentFileName} and {@link playlistName}
   * arguments.
   */
  varStreamMap: ['-var_stream_map', string]

  /**
   * The name of the master playlist file to create. This playlist references
   * the individual quality streams and is used by the client to select the
   * appropriate stream based on network conditions.
   *
   * The value should be a string of the form `<name>.m3u8`
   */
  masterPlaylistName: ['-master_pl_name', string]

  /**
   * The name of the segment files to create. Supports some special formatting
   * options to include the stream name, timestamp, and segment number in the
   * final file name:
   *
   * - `%v` - the variable stream name as defined in {@link varStreamMap}. Can
   *          only be referenced once in the file name.
   * - `%Y%m%d%s` - The timestamp this file was created, in years, months,
   *                days, and seconds
   * - `%d` - The segment number. Optionally allows a minimum number of digits
   *          to be specified, e.g. `000%d` would pad the result with leading
   *          zeros to a minimum of 3 digits.
   */
  segmentFileName: ['-hls_segment_filename', string]

  /**
   * The name of the playlist file to create for each variable quality stream.
   * Supports some special formatting options to include the stream name
   * in the final file name:
   *
   *  - `%v` - the variable stream name as defined in {@link varStreamMap}. Can
   *           only be referenced once in the file name.
   *
   * If the value for the {@link segmentFileName} places segment files in a child
   * directory, this name should also include the same child directory to ensure
   * that the playlist file can find the segment files it references.
   */
  playlistName: string
}

/**
 * Converts HLS stream options to ffmpeg arguments.
 *
 * @param {HLSStreamOptions} options HLS stream options.
 * @returns {HLSStreamArgs}  An object containing the ffmpeg arguments for HLS streaming.
 *
 * @see {@link HLS_STREAM_DEFAULTS} for the default values used if not specified in the
 *      `options` parameter.
 * @see {@link HLSStreamOptions} for the options that can be specified.
 * @see {@link HLSStreamArgs} for the resulting ffmpeg arguments.
 */
export function toHLSStreamArgs({
  formats = HLS_STREAM_DEFAULTS.formats,
  seekTime = HLS_STREAM_DEFAULTS.seekTime,
  segmentDuration = HLS_STREAM_DEFAULTS.segmentDuration,
  segmentCount = HLS_STREAM_DEFAULTS.segmentCount,
  masterPlaylistName = HLS_STREAM_DEFAULTS.masterPlaylistName,
  segmentFileNameSuffix = HLS_STREAM_DEFAULTS.segmentFileNameSuffix,
  playlistName = HLS_STREAM_DEFAULTS.playlistName,
}: HLSStreamOptions = {}): HLSStreamArgs {
  const result: HLSStreamArgs = {
    seekTime: ['-ss', seekTime],
    maps: [],
    sampleRates: [],
    bitrates: [],
    segmentDuration: ['-hls_time', segmentDuration.toString()],
    segmentCount: ['-hls_list_size', segmentCount.toString()],
    varStreamMap: ['-var_stream_map', ''],
    masterPlaylistName: ['-master_pl_name', `${masterPlaylistName}.m3u8`],
    segmentFileName: [
      '-hls_segment_filename',
      `%v/%Y%m%d_%s${segmentFileNameSuffix}.ts`,
    ],
    playlistName: `%v/${playlistName}.m3u8`,
  }

  const varStreamMapList: string[] = []

  formats.forEach((format, index) => {
    result.maps.push('-map', '0:a')
    result.sampleRates.push(`-ar:a:${index}`, format.sampleRate)
    result.bitrates.push(`-b:a:${index}`, format.bitrate)
    varStreamMapList.push(`a:${index},name:${format.name}`)
  })

  result.varStreamMap = ['-var_stream_map', varStreamMapList.join(' ')]

  return result
}
