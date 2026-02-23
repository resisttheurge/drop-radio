import {
  Arbitrary,
  array,
  ArrayConstraints,
  func,
  oneof,
  string,
  tuple,
} from 'fast-check'
import CommandOrThunk from './CommandOrThunk'

export function arbCommandOrThunk(): Arbitrary<CommandOrThunk> {
  return oneof(arbCommand(), arbThunk())
}

export function arbThunk(): Arbitrary<() => string | string[]> {
  return func(arbCommand())
}

export function arbCommandString(): Arbitrary<string> {
  return array(string({ minLength: 1 }), { minLength: 1 }).map((parts) =>
    parts.join(' ')
  )
}

export interface CommandArrayConstraints extends ArrayConstraints {
  cmd?: Arbitrary<string>
  arg?: Arbitrary<string>
}

export function arbCommandArray({
  cmd = arbCommandString(),
  arg = arbCommandString(),
  ...arrayConstraints
}: CommandArrayConstraints = {}): Arbitrary<string[]> {
  return tuple(cmd, array(arg, arrayConstraints)).map(([c, a]) => [c, ...a])
}

export interface CommandConstraints {
  string?: Arbitrary<string>
  array?: Arbitrary<string[]>
}

export function arbCommand({
  string = arbCommandString(),
  array = arbCommandArray(),
}: CommandConstraints = {}): Arbitrary<string | string[]> {
  return oneof(string, array)
}

export default arbCommandOrThunk
