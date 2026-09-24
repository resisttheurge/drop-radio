import { Observable } from 'rxjs'

import { RxProcessCloseError } from './RxProcessError'
import { RxProcessMsg } from './RxProcessMsg'

/**
 * Common {@link RxProcessOption} values for {@link fromProcess}. These are not fallback
 * values used by `fromProcess`, instead they represent sensible semantics for most
 * process runs, and are used as fallbacks by higher-level apis in this package.
 */
export const RX_PROCESS_OPTION_DEFAULTS: RxProcessOptions<
  { stdout: RxProcessMsg },
  { stderr: RxProcessMsg },
  never,
  never
> = {
  stdout: (stdout) => ({ stdout }),
  stderr: (stderr) => ({ stderr }),
  close: (code, signal) => {
    if (code !== null) {
      switch (code) {
        case 0:
          break
        default:
          throw new RxProcessCloseError(`process exited with code ${code}`, {
            code,
          })
      }
    } else if (signal !== null) {
      throw new RxProcessCloseError(`process exited with signal ${signal}`, {
        signal,
      })
    }
  },
}

/**
 * Configuration options for rx-process, passed as an argument to
 * {@link fromProcess}.
 */
export interface RxProcessOptions<
  out Out = never,
  out Err = never,
  out Catch = never,
  out Close = never
> {
  /**
   * Observable source of {@link RxProcessMsg}s. If provided, when an
   * {@link RxProcess} is subscribed to, it will in turn subscribe to this,
   * and forward any events it receives to the stdin pipe of the underlying
   * {@link ChildProcess}
   */
  input?: Observable<RxProcessMsg>

  /**
   * Optional filter and mapping function for stdout events. If omitted, the
   * {@link RxProcess} will not receive any stdout events from the underlying
   * {@link ChildProcess}.
   *
   * If present, and it returns any defined value for a given {@link RxProcessMsg},
   * the `RxProcess` will publish the result. In this way, it acts as a mapping
   * from `RxProcessMsg =>`{@link Out|`Out`}. If it returns `undefined` instead,
   * the `RxProcess` will not publish anything. In this way, it acts as a filter.
   *
   * If this function throws an error during its processing, it will be caught by
   * the `RxProcess`, which will notify its subscriber of the error and then terminate.
   *
   * @param data stdout event from the underlying `ChildProcess`
   * @returns some `Out` to publish, or `undefined`, if nothing should be published
   */
  stdout?: (data: RxProcessMsg) => Out | undefined

  /**
   * Optional filter and mapping function for stderr events. If omitted, the
   * {@link RxProcess} will not receive any stderr events from the underlying
   * {@link ChildProcess}.
   *
   * If present, and it returns any defined value for a given {@link RxProcessMsg},
   * the `RxProcess` will publish the result. In this way, it acts as a mapping
   * from `RxProcessMsg =>`{@link Err|`Err`}. If it returns `undefined` instead,
   * the `RxProcess` will not publish anything. In this way, it acts as a filter.
   *
   * If this function throws an error during its processing, it will be caught by
   * the `RxProcess`, which will notify its subscriber of the error and then terminate.
   *
   * @param data stderr event from the underlying `ChildProcess`
   * @returns some `Err` to publish, or `undefined`, if nothing should be published
   */
  stderr?: (data: RxProcessMsg) => Err | undefined

  /**
   * Optional "catch" function for {@link Error}s thrown by the underlying
   * {@link ChildProcess}. If omitted, any `Error` thrown by the underlying process
   * will be caught by the `RxProcess`, which will notify its subscriber of the error
   * and then terminate.
   *
   * If present, and it returns any defined value for a given `Error`,
   * the {@link RxProcess} will publish the result. In this way, it acts like
   * {@link Promise.catch}, in that a thrown error can be converted into an emitted
   * value {@link Catch}. If it returns `undefined` instead, the `RxProcess` will not
   * publish anything. In this way, errors can be handled by custom logic without
   * polluting the `RxProcess` event stream.
   *
   * If this function throws an error during its processing, it will be caught by
   * the `RxProcess`, which will notify its subscriber of the error and then terminate.
   *
   * Because no way for the caller to recover the underlying process from this function,
   * the `RxProcess` observable will complete after the first error it catches, regardless
   * of the logic in this function.
   *
   * @param data stdout event from the underlying `ChildProcess`
   * @returns some `Catch` to publish, or `undefined`, if nothing should be published
   */
  catch?: (error: Error) => Catch | undefined

  /**
   * Optional listener for `'close'` events emitted by the underlying {@link ChildProcess}.
   * If omitted, the {@link RxProcess} will complete silently on `'close'`, publishing
   * no values and throwing no error.
   *
   * If present, and it returns any defined value for given arguments, the `RxProcess` will
   * publish the result. If it returns `undefined` instead, the `RxProcess` will not publish
   * anything.
   *
   * Regardless of any of this, the `RxProcess` will always complete after the underlying
   * `ChildProcess` is closed.
   *
   * If this function throws an error during its processing, it will be caught by
   * the `RxProcess`, which will notify its subscriber of the error and then terminate.
   *
   * @param code the numeric exit code of the underlying `ChildProcess`, or `null`
   *             if it exited without a code
   * @param signal the {@link NodeJS.Signals|system signal} that terminated the underlying
   *               `ChildProcess`, or `null` if exited without a signal
   * @returns `undefined`, if the event should be ignored, or some {@link Close} to publish
   */
  close?: (
    code: number | null,
    signal: NodeJS.Signals | null
  ) => Close | undefined
}
