import { spawn } from 'node:child_process'
import { Observable } from 'rxjs'

import { HLSStreamError } from './HLSStreamError'
import { defaults, HLSStreamOptions } from './HLSStreamOptions'
import { HLSStreamProgress, parseHLSStreamProgress } from './HLSStreamProgress'

/**
 * Creates an observable that streams HLS segments using ffmpeg.
 * @param inputFile The input file to stream.
 * @param outputDirectory The directory to output the HLS segments.
 * @param options Optional HLS stream options.
 * @returns An observable that emits HLS stream progress updates.
 */
export function hlsStream(
  inputFile: string,
  outputDirectory: string,
  options?: HLSStreamOptions
): Observable<HLSStreamProgress> {
  const args = toHLSStreamArgs(options)
  return new Observable<HLSStreamProgress>((subscriber) => {
    let processClosed = false
    let stdErrBuffer = Buffer.from('')
    const ffmpeg = spawn(
      'ffmpeg',
      [
        '-hide_banner',
        '-nostats',
        ...['-progress', 'pipe:1'],
        '-re',
        ...args.seekTime,
        ...['-i', inputFile],
        ...args.maps,
        ...args.sampleRates,
        ...args.bitrates,
        ...['-f', 'hls'],
        ...args.segmentDuration,
        ...args.segmentCount,
        ...[
          '-hls_flags',
          'discont_start+delete_segments+temp_file+append_list',
        ],
        ...['-hls_allow_cache', '0'],
        ...args.varStreamMap,
        ...['-strftime', '1'],
        ...args.masterPlaylistName,
        ...args.segmentFileName,
        args.playlistName,
      ],
      { cwd: outputDirectory }
    )

    ffmpeg.stderr.on('data', (data: Buffer) => {
      stdErrBuffer = Buffer.concat([stdErrBuffer, data])
    })

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

    ffmpeg.on('error', (error) => {
      processClosed = true
      subscriber.error(
        new HLSStreamError('ffmpeg child process failed', { cause: error })
      )
    })

    ffmpeg.on('close', (code, signal) => {
      processClosed = true
      if (code !== null) {
        switch (code) {
          case 0: // code of 0 is a success
            subscriber.complete()
            break
          default: // any other code is a failure
            subscriber.error(
              new HLSStreamError(`ffmpeg exited with code ${code}`, {
                cause: stdErrBuffer.toString(),
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

    return function unsubscribe() {
      if (!processClosed) {
        ffmpeg.kill()
      }
    }
  })
}

export interface HLSStreamArgs {
  seekTime: ['-ss', string]
  maps: string[]
  sampleRates: string[]
  bitrates: string[]
  segmentDuration: ['-hls_time', string]
  segmentCount: ['-hls_list_size', string]
  varStreamMap: ['-var_stream_map', string]
  masterPlaylistName: ['-master_pl_name', string]
  segmentFileName: ['-hls_segment_filename', string]
  playlistName: string
}

/**
 * Converts HLS stream options to ffmpeg arguments.
 * @param options HLS stream options.
 * @returns
 */
export function toHLSStreamArgs({
  formats = defaults.formats,
  seekTime = defaults.seekTime,
  segmentDuration = defaults.segmentDuration,
  segmentCount = defaults.segmentCount,
  masterPlaylistName = defaults.masterPlaylistName,
  segmentFileNameSuffix = defaults.segmentFileNameSuffix,
  playlistName = defaults.playlistName,
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
