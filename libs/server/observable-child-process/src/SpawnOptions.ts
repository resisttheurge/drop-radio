import { CommonSpawnOptions } from 'node:child_process'

/**
 * Options for spawn. Extends {@link CommonSpawnOptions} from `node:child_process`
 * and is passed through to the underlying child_process.spawn call managed by the observable.
 *
 * @typeParam T - The type of data returned by {@link SpawnOptions.mapStdout | mapStdout}
 * and {@link SpawnOptions.mapStderr | mapStderr }, which will be emitted by the observable.
 */
export interface SpawnOptions<T = string | Buffer> extends CommonSpawnOptions {
  /**
   * Whether to capture stderr output and include it in error messages.
   * Defaults to false.
   */
  readonly errorTrace?: boolean

  /**
   * Maximum stderr buffer size in bytes. Defaults to 1024 * 1024.
   * If the buffer were to exceed this limit, it will be rotated to contain the most recent data.
   * This option is only relevant if `errorTrace` is true.
   *
   * Note: This does not limit the amount of data that can be emitted on stdout,
   * which is handled by the consumer of the observable.
   */
  readonly maxBuffer?: number

  /**
   * Optional function to transform stdout data before emitting it.
   * Defaults to the identity function (emits raw {@link Buffer}).
   * @param data - the data event emitted by the child process's stdout stream
   * @returns the transformed data to emit
   */
  readonly mapStdout?: (data: string | Buffer) => T

  /**
   * Optional function to transform stderr data before emitting it.
   * If omitted, stderr data is not emitted by the observable
   * @param data - the data event emitted by the child process's stderr stream
   * @returns the transformed data to emit
   */
  readonly mapStderr?: (data: string | Buffer) => T
}
/**
 * Default {@link SpawnOptions}.
 *
 * {@includeCode SpawnOptions.ts#SPAWN_OPTION_DEFAULTS}
 */
// #region SPAWN_OPTION_DEFAULTS
export const SPAWN_OPTION_DEFAULTS = {
  errorTrace: false,
  maxBuffer: 1024 * 1024,
  mapStdout: (x: string | Buffer) => x,
} as const
// #endregion SPAWN_OPTION_DEFAULTS

export const SpawnOptions = {
  defaults: SPAWN_OPTION_DEFAULTS,
} as const

export default SpawnOptions
