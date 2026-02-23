/**
 * Utility type representing a terminal command to run
 *
 * @example
 * // A string containing the command and whitespace-separated arguments:
 * const cmdString: CommandOrThunk = 'ls -la'
 *
 * // An array of strings representing the command and its arguments:
 * const cmdArray: CommandOrThunk = ['rm', '-f', 'File with spaces.txt']
 *
 * // A thunk (function) that returns either of the other formats:
 * const cmdStringThunk: CommandOrThunk = () => `echo It's ${new Date().toLocaleString()}`
 * const cmdArrayThunk: CommandOrThunk = () => ['rm', '-f', chooseRandom(filesToDelete)]
 */
export type CommandOrThunk = string | string[] | (() => string | string[])

/**
 * Resolves a {@link CommandOrThunk} into an array of strings representing the command and its arguments
 *
 * If the input is a thunk (function), it will be invoked to get the actual command.
 * If the input is a string, it will be split on whitespace to form the array.
 * If the input is already an array, it will be returned as-is.
 *
 * @param command - The {@link CommandOrThunk} to resolve
 * @returns an array of strings representing the command and its arguments
 */
export function resolve(command: CommandOrThunk): string[] {
  if (typeof command === 'function') {
    command = command()
  }
  return Array.isArray(command) ? command : command.split(/\s+/g)
}

/**
 * Namespace for {@link CommandOrThunk} utilities
 */
export const CommandOrThunk = {
  resolve,
}

/**
 * Default export is the {@link CommandOrThunk} type and its utilities
 */
export default CommandOrThunk
