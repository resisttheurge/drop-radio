import { ExecFileOptions, execFile as nodeExecFile } from 'node:child_process'
import { Observable } from 'rxjs'

import CommandOrThunk from './CommandOrThunk'
import ExecError from './ExecError'
import ExecOptions from './ExecOptions'

/**
 * Executes a command in a child process and returns an observable which, when subscribed, emits
 *
 * @param command - The {@link CommandOrThunk} to run in a child process.
 */
export function exec(command: CommandOrThunk): Observable<string>
export function exec<T>(
  command: CommandOrThunk,
  options?: ExecOptions<T>
): Observable<T>
export function exec(
  command: CommandOrThunk,
  { mapResult = ExecOptions.defaults.mapResult, ...options }: ExecOptions = {}
): Observable<string> {
  const [cmd, ...args] = CommandOrThunk.resolve(command)
  return new Observable<string>((subscriber) => {
    let processClosed = false
    const process = nodeExecFile(
      cmd,
      args,
      options as ExecFileOptions,
      (error, stdout, stderr) => {
        processClosed = true
        if (error) {
          if (error.signal) {
            subscriber.error(
              ExecError.terminatedBySignal(
                cmd,
                args,
                error.signal,
                error,
                stdout,
                stderr
              )
            )
          } else if (error.code) {
            subscriber.error(
              ExecError.exitedWithNonzeroCode(
                cmd,
                args,
                error.code,
                error,
                stdout,
                stderr
              )
            )
          } else {
            subscriber.error(
              ExecError.failedWithError(cmd, args, error, stdout, stderr)
            )
          }
        } else {
          subscriber.next(mapResult({ stdout, stderr }))
        }
        subscriber.complete()
      }
    )
    return function unsubscribe() {
      if (!processClosed) {
        process.kill()
      }
    }
  })
}

export default exec
