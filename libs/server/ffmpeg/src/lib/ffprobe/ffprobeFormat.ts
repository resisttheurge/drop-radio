import { spawn } from 'node:child_process'
import { FFProbeError } from './FFProbeError'
import { FFProbeResult } from './FFProbeResult'

/**
 * Analyzes a file url using ffprobe and returns file format information
 *
 * @param input The file url to probe
 * @returns A promise that resolves with a ffprobe result containing
 *          format information
 */
export function ffprobeFormat(
  input: string
): Promise<FFProbeResult & { format: NonNullable<FFProbeResult['format']> }> {
  return new Promise((resolve, reject) => {
    // spawn a child process to run ffprobe and keep a reference to
    // read from stdout and stderr during event handling
    const probe = spawn('ffprobe', [
      '-hide_banner', // hide version and configuration information
      '-show_format', // include format data
      ...['-of', 'json=c=1'], // format output as JSON in compact mode
      input,
    ])

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
                JSON.parse(probe.stdout.toString()) as FFProbeResult & {
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
                cause: probe.stderr.toString(),
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
