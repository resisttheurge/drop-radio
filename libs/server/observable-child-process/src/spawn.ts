import child_process, { CommonSpawnOptions } from 'node:child_process'

import { Observable } from 'rxjs'
import invariant from 'tiny-invariant'

import CommandOrThunk from './CommandOrThunk'
import rotateBuffer from './rotateBuffer'
import SpawnError from './SpawnError'
import SpawnOptions from './SpawnOptions'

/**
 * Creates an {@link Observable} that {@link child_process.spawn | spawn}s a child process to run the specified command.
 *
 * The observable, once subscribed, emits data events from the child process's stdout as {@link Buffer}s,
 * and completes when the process exits successfully. If the process fails to launch, exits with a non-zero
 * code or is terminated by a signal, the observable emits an error. If the observable is unsubscribed before
 * the process completes, the child process is killed.
 *
 * @param command - The {@link CommandOrThunk} to run in a child process.
 * @returns An observable that executes the given command on subscribe and emits stdout data events as {@link Buffer}s.
 */
export function spawn(command: CommandOrThunk): Observable<Buffer>
/**
 * Creates an {@link Observable} that {@link nodeSpawn | spawn}s a child process to run the specified command.
 *
 * The observable, once subscribed, emits data events from the child process's stdout transformed by `options.mapStdout`,
 * as well as data events from stderr transformed by `options.mapStderr` if provided, and completes when the process exits
 * successfully. If the process fails to launch, exits with a non-zero code or is terminated by a signal, the observable
 * emits an error. If the observable is unsubscribed before the process completes, the child process is killed.
 *
 * The {@link options} parameter allows configuring the behavior of the observable and the underlying child process.
 * This includes all options from {@link CommonSpawnOptions}, as well as:
 * - `errorTrace`: Whether to capture stderr output and include it in error messages. Defaults to false.
 * - `maxBuffer`: Maximum stderr buffer size in bytes. Defaults to 1024 * 1024. If the buffer were to exceed this
 *  limit, it will be rotated to contain the most recent data. This option is only relevant if `errorTrace` is true.
 * - `mapStdout`: Function to transform stdout data before emitting it. Defaults to the identity function (emits raw {@link Buffer}).
 * - `mapStderr`: Function to transform stderr data before emitting it. If omitted, stderr data is not emitted by the observable.
 *
 * @typeParam T - The type of data emitted by the observable, defined by `options.mapStdout`.
 * @param command - The {@link CommandOrThunk} to run in a child process.
 * @param options - {@link SpawnOptions} to configure the behavior of the observable and the underlying child process.
 * @returns An observable that executes the given command on subscribe and emits .
 */
export function spawn<T>(
  command: CommandOrThunk,
  options?: SpawnOptions<T>
): Observable<T>
export function spawn(
  command: CommandOrThunk,
  {
    errorTrace = SpawnOptions.defaults.errorTrace,
    maxBuffer = SpawnOptions.defaults.maxBuffer,
    mapStdout = SpawnOptions.defaults.mapStdout,
    mapStderr,
    ...options
  }: SpawnOptions = {}
): Observable<string | Buffer> {
  return new Observable<string | Buffer>((subscriber) => {
    const [cmd, ...args] = CommandOrThunk.resolve(command)
    const child = child_process.spawn(cmd, args, options as CommonSpawnOptions)

    let processClosed = false
    let errorBuffer: Buffer = Buffer.from('')

    if (child.stdout) {
      child.stdout.on('data', (data: string | Buffer) =>
        subscriber.next(mapStdout(data))
      )
    }

    if (child.stderr) {
      if (errorTrace) {
        child.stderr.on('data', (data: string | Buffer) => {
          errorBuffer = rotateBuffer(
            errorBuffer,
            typeof data === 'string' ? Buffer.from(data) : data,
            maxBuffer
          )
        })
      }
      if (mapStderr !== undefined) {
        child.stderr.on('data', (data: string | Buffer) =>
          subscriber.next(mapStderr(data))
        )
      }
    }

    // listen for node:child_process error events
    // Spawn failed, process can't be killed and others
    // see https://nodejs.org/api/child_process.html#event-error
    child.on('error', (error) => {
      // if the process errors, it is completed and cannot be killed
      processClosed = true
      subscriber.error(SpawnError.failedWithError(cmd, args, error))
    })

    child.on('close', (code, signal) => {
      // if the process closes, it is completed and cannot be killed
      processClosed = true
      if (code !== null) {
        switch (code) {
          case 0: // code of 0 is a success
            subscriber.complete()
            break
          default: // any other code is a failure
            subscriber.error(
              SpawnError.exitedWithNonzeroCode(
                cmd,
                args,
                code,
                errorTrace ? errorBuffer : undefined
              )
            )
        }
      } else {
        invariant(signal !== null, 'Expected signal to be non-null')
        // code is null only if the process was terminated by a signal
        subscriber.error(
          SpawnError.terminatedBySignal(
            cmd,
            args,
            signal,
            errorTrace ? errorBuffer : undefined
          )
        )
      }
    })

    // return an unsubscribe function that kills the ffmpeg process if it is
    // still running when the subscriber unsubscribes
    return function unsubscribe() {
      if (!processClosed) {
        child.kill(options.killSignal)
      }
    }
  })
}

export default spawn
