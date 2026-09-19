import { Observable } from 'rxjs'

import { spawnrx } from '@drop-radio/rx-process'

import { RTMPPublishError } from './RTMPPublishError'
import { RTMP_PUBLISH_DEFAULTS, RTMPPublishOptions } from './RTMPPublishOptions'
import { FFMPEGProgress, parseFFMPEGProgress } from '../../FFMPEGProgress'

/**
 * Creates an observable that generates HLS playlist and segment files from a
 * given input file in real-time using `ffmpeg`. The generated files will be
 * placed in the specified output directory, and the observable will emit
 * {@link FFMPEGProgress} objects that report on the progress of the
 * streaming process.
 *
 * The returned observable will not create the underlying `ffmpeg` process until
 * subscribed, and each subscription will create a new `ffmpeg` process with the
 * same configuration as specified by the given input file, output directory,
 * and options ({@link RTMPPublishOptions}). This is useful for "replay" and
 * "playlist" functionality, where a series of these observables can be
 * constructed and arranged before running them, but care must be exercised not
 * to subscribe to the same observable multiple times at once, as `ffmpeg` will
 * gladly try to overwrite the same output files at the same time. In many cases,
 * use of the {@link RTMPPublishOptions.concat} option is better suited for playlist
 * functionality, and {@link RTMPPublishOptions.loopCount} for replay / looping.
 *
 * **Note**: `ffmpeg` HLS streaming will always leave behind the last playlist
 * and segment files it created when the process exits. If the same playlist
 * file names and locations are used on a subsequent run, `ffmpeg` will append
 * to the existing playlist files, and preserve the tail of the old segments
 * until they are removed from the playlist, after which they will be deleted.
 * However, any existing segments files that are not referenced by the existing
 * playlist when the new `ffmpeg` process starts will be ignored, and require
 * manual deletion if they are no longer needed. There is always at least one
 * dangling segment file left behind by each `ffmpeg` process.
 *
 * @param {string} inputFile
 * The input file to stream. Expected to be a media file with at least one
 * audio stream, or, if `options.concat` is true, an
 * [`ffconcat` playlist file](https://ffmpeg.org/ffmpeg-formats.html#Syntax) to
 * play back multiple files in succession. If this is a relative path, it will
 * be resolved relative to the current working directory
 *
 * @param {string} workingDirectory
 * Optional directory to run `ffmpeg` in and output the resulting HLS files.
 * Defaults to the current working directory of the parent process
 *
 * @param {RTMPPublishOptions} [options]
 * Optional HLS stream options. {@link RTMP_PUBLISH_DEFAULTS} will be used to fill
 * in any missing options with default values.
 *
 * @returns
 * A cold [rxjs](https://rxjs.dev) Observable which emits
 * {@link FFMPEGProgress} events as parsed from `ffmpeg`'s output. Because
 * the observable is cold, it will not start the underlying `ffmpeg` process
 * until it is subscribed to. Its unsubscribe process checks if the underlying
 * process is still running, and if so, it sends a `SIGKILL` signal to the
 * process to terminate it. It will complete when the underlying process exits
 * with a `0` code, and errors with an {@link RTMPPublishError} if the process
 * fails to start, exits with a non-zero code, or fails to parse a progress
 * update from the process output
 *
 * @see {@link https://ffmpeg.org/ffmpeg-formats.html#hls-2 | The official FFMPEG docs}
 *      to learn more about HLS streaming with `ffmpeg`.
 */
export function rtmpPublish(
  inputFile: string,
  workingDirectory?: string,
  options?: RTMPPublishOptions
): Observable<FFMPEGProgress> {
  return new Observable<FFMPEGProgress>((subscriber) => {
    // keep track of whether the ffmpeg process has closed so we can avoid
    // calling ffmpeg.kill() after the PID may have been re-assigned
    let processClosed = false

    // spawn a child process to run ffmpeg with the computed arguments
    const ffmpeg = spawnrx(
      'ffmpeg',
      [

      ],
      { stdout: parseFFMPEGProgress, stderr: x => x } // set working directory to control output location
    )

    ffmpeg.pipe()

    // append stderr data to the buffer
    ffmpeg.stderr.on('data', (data: Buffer) => {
      stderrBuffer = Buffer.concat([stderrBuffer, data])
    })

    // listen for node:child_process error events
    // Spawn failed, process can't be killed and others
    // see https://nodejs.org/api/child_process.html#event-error
    ffmpeg.on('error', (error) => {
      // if the process errors, it is completed and cannot be killed
      processClosed = true
      subscriber.error(
        new RTMPPublishError('ffmpeg child process failed', { cause: error })
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
              new RTMPPublishError(`ffmpeg exited with code ${code}`, {
                cause: stderrBuffer.toString(),
              })
            )
        }
      } else {
        // code is null only if the process was terminated by a signal
        subscriber.error(
          new RTMPPublishError(
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

