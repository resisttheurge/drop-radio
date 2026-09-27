/**
 * Base options for {@link RxProcessError}s
 */
export type RxProcessErrorOptions = ErrorOptions

/**
 * Base class for runtime errors during reactive process execution
 */
export class RxProcessError extends Error implements RxProcessErrorOptions {
  /**
   * Construct an {@link RxProcessError} with optional message and
   * {@link RxProcessErrorOptions}
   *
   * @param message an optional message to include with the error
   * @param options an optional set of error options
   */
  constructor(message?: string, options?: RxProcessErrorOptions) {
    super(message, options)
  }
}

export interface RxProcessCloseErrorOptions extends RxProcessErrorOptions {
  readonly code?: number
  readonly signal?: NodeJS.Signals
}

export class RxProcessCloseError
  extends RxProcessError
  implements RxProcessCloseErrorOptions
{
  readonly code?: number
  readonly signal?: NodeJS.Signals
  /**
   * Construct an {@link RxProcessCloseError} with optional message and
   * {@link RxProcessCloseErrorOptions}
   *
   * @param message an optional message to include with the error
   * @param options an optional set of error options, including captured {@link code} and
   *                {@link signal} values
   */
  constructor(msg?: string, opt?: RxProcessCloseErrorOptions) {
    super(msg, opt)
    this.code = opt?.code
    this.signal = opt?.signal
  }
}

export interface RxProcessXformErrorOptions<Args extends [...unknown[]], out T>
  extends RxProcessErrorOptions {
  readonly xform?: (...args: Args) => T | undefined
  readonly args?: Args
  readonly next?: T
}

export class RxProcessXformError<Args extends [...unknown[]], out T>
  extends RxProcessError
  implements RxProcessXformErrorOptions<Args, T>
{
  readonly xform?: (...args: Args) => T | undefined
  readonly args?: Args
  readonly next?: T

  /**
   * Construct an {@link RxProcessXformError} with optional message and
   * {@link RxProcessXformErrorOptions}
   *
   * @param message an optional message to include with the error
   * @param options an optional set of additional properties, including captured {@link xform},
   *                {@link args}, and {@link next} state from the source `RxProcess`
   */
  constructor(msg?: string, opt?: RxProcessXformErrorOptions<Args, T>) {
    super(msg, opt)
  }
}
