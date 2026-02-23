import { ExecFileOptions } from 'node:child_process'

/**
 * Options for exec. Extends {@link ExecFileOptions} from `node:child_process`
 * and is passed through to the underlying execFile call.
 *
 * @typeParam T - The type of data returned by {@link ExecOptions.mapResult | mapResult} and
 * resolved by the promise returned by exec.
 */
export interface ExecOptions<T = string> extends ExecFileOptions {
  /**
   * Optional function to transform stdout and stderr data before resolving it.
   * Defaults to the identity function (emits raw {@link Buffer}).
   * @param result - the data event emitted by the child process's stdout stream
   * @returns the transformed data to emit
   */
  readonly mapResult?: (result: { stdout: string; stderr: string }) => T
}
/**
 * Default {@link ExecOptions}.
 *
 * {@includeCode ExecOptions.ts#EXEC_OPTION_DEFAULTS}
 */
// #region EXEC_OPTION_DEFAULTS
export const EXEC_OPTION_DEFAULTS = {
  mapResult: (result: { stdout: string; stderr: string }) => result.stdout,
} as const
// #endregion EXEC_OPTION_DEFAULTS

export const ExecOptions = {
  defaults: EXEC_OPTION_DEFAULTS,
} as const

export default ExecOptions
