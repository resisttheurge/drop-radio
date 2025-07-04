import { spawn } from 'node:child_process'
import { FFProbeError } from './FFProbeError'
import { FFProbeResult } from './FFProbeResult'

/**
 * Analyzes a file url using ffprobe and returns file format information
 *
 * @param input The file url to probe
 * @returns
 * A promise that resolves with an {@link FFProbeResult} containing format
 * information, or rejects with an {@link FFProbeError} if `ffprobe` fails to
 * execute or exits with a non-zero code, or if the output cannot be parsed as
 * JSON
 *
 * @example
 * ```ts
 * import { ffprobeFormat } from '@drop-radio/ffmpeg'
 * //                   or: from '@drop-radio/ffmpeg/ffprobe'
 *
 * const info = await ffprobeFormat('/path/to/file.wav')
 *
 * expect(info).toEqual({
 *   format: {
 *     filename: 'file.wav',
 *     nb_streams: 1,
 *     nb_programs: 0,
 *     nb_stream_groups: 0,
 *     format_name: 'wav',
 *     format_long_name: 'WAV / WAVE (Waveform Audio)',
 *     duration: '169.156646',
 *     size: '32478120',
 *     bit_rate: '1536002',
 *     probe_score: 99,
 *   },
 * })
 * ```
 */
export function ffprobeFormat(
  input: string
): Promise<FFProbeResult & { format: NonNullable<FFProbeResult['format']> }> {
  return new Promise((resolve, reject) => {
    // create buffers to store stdout and stderr data to be used when the
    // promise is resolved or rejected
    let stdoutBuffer = Buffer.from('')
    let stderrBuffer = Buffer.from('')

    // spawn a child process to run ffprobe
    const probe = spawn('ffprobe', [
      '-hide_banner', // hide version and configuration information
      '-show_format', // include format data
      ...['-of', 'json=c=1'], // format output as JSON in compact mode
      input,
    ])

    // append data to the stdout buffer
    probe.stdout.on('data', (data: Buffer) => {
      stdoutBuffer = Buffer.concat([stdoutBuffer, data])
    })

    // append data to the stderr buffer
    probe.stderr.on('data', (data: Buffer) => {
      stderrBuffer = Buffer.concat([stderrBuffer, data])
    })

    // listen for node:child_process error events
    // Spawn failed, process can't be killed and others
    // see https://nodejs.org/api/child_process.html#event-error
    probe.on('error', (error) => {
      reject(new FFProbeError('ffprobe child process failed', { cause: error }))
    })

    // handle all other results on close events, which happen after the
    // stdout and stderr streams have been closed
    // see https://nodejs.org/api/child_process.html#event-close
    probe.on('close', (code, signal) => {
      if (code !== null) {
        // code is not null only if the process exited
        switch (code) {
          case 0: // code of 0 is a success
            try {
              resolve(
                JSON.parse(stdoutBuffer.toString()) as FFProbeResult & {
                  format: NonNullable<FFProbeResult['format']>
                }
              )
            } catch (error) {
              reject(
                new FFProbeError('Failed to parse ffprobe output as JSON', {
                  cause: error,
                })
              )
            }
            break
          default: // any other code is a failure
            reject(
              new FFProbeError(`ffprobe exited with code ${code}`, {
                cause: stderrBuffer.toString(),
              })
            )
        }
      } else {
        // code is null only if the process was terminated by a signal
        reject(
          new FFProbeError(
            `ffprobe process was terminated by signal ${signal}`,
            { cause: signal }
          )
        )
      }
    })
  })
}
