import Stream from 'node:stream'

import {
  Arbitrary,
  array,
  boolean,
  constant,
  constantFrom,
  dictionary,
  nat,
  oneof,
  record,
  string,
} from 'fast-check'
import { mock } from 'ts-jest-mocker'

import SpawnOptions from './SpawnOptions'

import arbSignal from './__test__/Signals.arb'

type ArbitraryConstraints<T> = {
  [K in keyof T]?: Arbitrary<T[K]>
}

export function arbSpawnOptions<T = string | Buffer>(
  constraints?: ArbitraryConstraints<SpawnOptions<T>>
): Arbitrary<SpawnOptions<T>>
export function arbSpawnOptions({
  argv0 = string(),
  cwd = string(),
  env = dictionary(string(), string()),
  errorTrace = boolean(),
  gid = nat(),
  killSignal = arbSignal(),
  mapStderr = constant((x) => x),
  mapStdout = constant((x) => x),
  maxBuffer = nat(),
  shell = boolean(),
  serialization = constantFrom('json', 'advanced'),
  signal = constant(mock<AbortSignal>()),
  stdio = oneof(
    constantFrom('overlapped', 'pipe', 'ignore', 'inherit'),
    array(
      oneof(
        constantFrom('overlapped', 'pipe', 'ignore', 'inherit'),
        constant('ipc'),
        constant(mock<Stream>()),
        nat(),
        constantFrom(null, undefined)
      )
    )
  ),
  timeout = nat(),
  uid = nat(),
  windowsHide = boolean(),
  windowsVerbatimArguments = boolean(),
}: ArbitraryConstraints<SpawnOptions> = {}): Arbitrary<SpawnOptions> {
  return record<SpawnOptions>(
    {
      argv0,
      cwd,
      env,
      errorTrace,
      gid,
      killSignal,
      mapStderr,
      mapStdout,
      maxBuffer,
      shell,
      serialization,
      signal,
      stdio,
      timeout,
      uid,
      windowsHide,
      windowsVerbatimArguments,
    },
    { requiredKeys: [] }
  )
}

export default arbSpawnOptions
