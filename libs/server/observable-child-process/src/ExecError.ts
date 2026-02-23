/**
 * Optional details about the context of a {@link ExecError}.
 */
export interface ExecErrorOptions extends ErrorOptions {
  /**
   * The command that was attempted to be executed.
   */
  cmd?: string
  /**
   * The arguments passed to the command.
   */
  args?: string[]
  /**
   * The exit code of the child process.
   */
  code?: number | string
  /**
   * The signal that terminated the child process.
   */
  signal?: NodeJS.Signals
  /**
   * The stdout output of the child process.
   */
  stdout?: string
  /**
   * The stderr output of the child process.
   */
  stderr?: string
}

/**
 * Error representing a failure in spawning or running a child process.
 * Includes static factory methods for common error scenarios.
 */
export class ExecError extends Error {
  // #region execErrorProperties
  /**
   * The command that was attempted to be executed.
   */
  public readonly cmd?: string
  /**
   * The arguments passed to the command.
   */
  public readonly args?: string[]
  /**
   * The exit code of the child process.
   */
  public readonly code?: number | string
  /**
   * The signal that terminated the child process.
   */
  public readonly signal?: NodeJS.Signals
  /**
   * The (optional) stdout output of the child process.
   */
  public readonly stdout?: string
  /**
   * The (optional) stderr output of the child process.
   */
  public readonly stderr?: string
  // #endregion execErrorProperties

  /**
   * Creates a ExecError indicating that the child process failed to run to completion.
   *
   * @param cmd - The command that was attempted to be executed.
   * @param args - The arguments passed to the command.
   * @param cause - The error that occurred while running the process.
   * @returns A ExecError instance with a custom message
   * {@includeCode ExecError.ts#failedWithErrorMsg}
   */
  static failedWithError(
    cmd: string,
    args: string[],
    cause: Error,
    stdout?: string,
    stderr?: string
  ): ExecError {
    return new ExecError(
      // #region failedWithErrorMsg
      `child process (${cmd}) failed with error: ${cause.message}`,
      // #endregion failedWithErrorMsg
      {
        cmd,
        args,
        cause,
        stdout,
        stderr,
      }
    )
  }

  /**
   * Creates a ExecError indicating that the child process exited with a non-zero code.
   * @param cmd - The command that was attempted to be executed.
   * @param args - The arguments passed to the command.
   * @param code - The exit code of the child process.
   * @param cause - The underlying error that occurred.
   * @param stdout - The (optional) stdout output of the child process.
   * @param stderr - The (optional) stderr output of the child process.
   * @returns A ExecError instance with a custom message
   * {@includeCode ExecError.ts#exitedWithNonzeroCodeMsg}
   */
  static exitedWithNonzeroCode(
    cmd: string,
    args: string[],
    code: number | string,
    cause: Error,
    stdout?: string,
    stderr?: string
  ): ExecError {
    return new ExecError(
      // #region exitedWithNonzeroCodeMsg
      `child process (${cmd}) exited with code ${code}`,
      // #endregion exitedWithNonzeroCodeMsg
      {
        cmd,
        args,
        code,
        cause,
        stdout,
        stderr,
      }
    )
  }

  /**
   * Creates a ExecError indicating that the child process was terminated by a signal.
   * @param cmd - The command that was attempted to be executed.
   * @param args - The arguments passed to the command.
   * @param signal - The signal that terminated the child process.
   * @param cause - The underlying error that occurred.
   * @param stdout - The (optional) stdout output of the child process.
   * @param stderr - The (optional) stderr output of the child process.
   * @returns A ExecError instance with a custom message
   * {@includeCode ExecError.ts#terminatedBySignalMsg}
   */
  static terminatedBySignal(
    cmd: string,
    args: string[],
    signal: NodeJS.Signals,
    cause: Error,
    stdout?: string,
    stderr?: string
  ): ExecError {
    return new ExecError(
      // #region terminatedBySignalMsg
      `child process (${cmd}) was terminated by signal ${signal}`,
      // #endregion terminatedBySignalMsg
      {
        cmd,
        args,
        signal,
        cause,
        stdout,
        stderr,
      }
    )
  }

  /**
   * Creates a ExecError instance.
   * @param message - a short human-readable description of the error
   * @param options - an optional object containing additional error details to set as properties
   * {@includeCode ExecError.ts#execErrorProperties}
   */
  constructor(message: string, options?: ExecErrorOptions) {
    super(message, options)
    this.name = 'ExecError'
    this.cmd = options?.cmd
    this.args = options?.args
    this.code = options?.code
    this.signal = options?.signal
    this.stdout = options?.stdout
    this.stderr = options?.stderr
  }
}

export default ExecError
