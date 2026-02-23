/**
 * Optional details about the context of a {@link SpawnError}.
 */
export interface SpawnErrorOptions extends ErrorOptions {
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
  code?: number
  /**
   * The signal that terminated the child process.
   */
  signal?: NodeJS.Signals
  /**
   * The stderr output of the child process.
   */
  stderr?: Buffer
}

/**
 * Error representing a failure in spawning or running a child process.
 * Includes static factory methods for common error scenarios.
 */
export class SpawnError extends Error {
  // #region spawnErrorProperties
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
  public readonly code?: number
  /**
   * The signal that terminated the child process.
   */
  public readonly signal?: NodeJS.Signals
  /**
   * The (optional) stderr output of the child process.
   */
  public readonly stderr?: Buffer
  // #endregion spawnErrorProperties

  /**
   * Creates a SpawnError indicating that the child process failed to start.
   * @param cmd - The command that was attempted to be executed.
   * @param args - The arguments passed to the command.
   * @param cause - The error that occurred while trying to start the process.
   * @returns A SpawnError instance with a custom message
   * {@includeCode SpawnError.ts#failedWithErrorMsg}
   */
  static failedWithError(cmd: string, args: string[], cause: Error): SpawnError {
    return new SpawnError(
      // #region failedWithErrorMsg
      `child process (${cmd}) failed with error: ${cause.message}`,
      // #endregion failedWithErrorMsg
      {
        cmd,
        args,
        cause,
      }
    )
  }

  /**
   * Creates a SpawnError indicating that the child process exited with a non-zero code.
   * @param cmd - The command that was attempted to be executed.
   * @param args - The arguments passed to the command.
   * @param code - The exit code of the child process.
   * @param stderr - The (optional) stderr output of the child process.
   * @returns A SpawnError instance with a custom message
   * {@includeCode SpawnError.ts#exitedWithNonzeroCodeMsg}
   */
  static exitedWithNonzeroCode(
    cmd: string,
    args: string[],
    code: number,
    stderr?: Buffer
  ): SpawnError {
    return new SpawnError(
      // #region exitedWithNonzeroCodeMsg
      `child process (${cmd}) exited with code ${code}`,
      // #endregion exitedWithNonzeroCodeMsg
      {
        cmd,
        args,
        code,
        stderr,
        cause: stderr ?? code,
      }
    )
  }

  /**
   * Creates a SpawnError indicating that the child process was terminated by a signal.
   * @param cmd - The command that was attempted to be executed.
   * @param args - The arguments passed to the command.
   * @param signal - The signal that terminated the child process.
   * @param stderr - The (optional) stderr output of the child process.
   * @returns A SpawnError instance with a custom message
   * {@includeCode SpawnError.ts#terminatedBySignalMsg}
   */
  static terminatedBySignal(
    cmd: string,
    args: string[],
    signal: NodeJS.Signals,
    stderr?: Buffer
  ): SpawnError {
    return new SpawnError(
      // #region terminatedBySignalMsg
      `child process (${cmd}) was terminated by signal ${signal}`,
      // #endregion terminatedBySignalMsg
      {
        cmd,
        args,
        signal,
        stderr,
        cause: stderr ?? signal,
      }
    )
  }

  /**
   * Creates a SpawnError instance.
   * @param message - a short human-readable description of the error
   * @param options - an optional object containing additional error details to set as properties
   * {@includeCode SpawnError.ts#spawnErrorProperties}
   */
  constructor(message: string, options?: SpawnErrorOptions) {
    super(message, options)
    this.name = 'SpawnError'
    this.cmd = options?.cmd
    this.args = options?.args
    this.code = options?.code
    this.signal = options?.signal
    this.stderr = options?.stderr
  }
}

export default SpawnError
