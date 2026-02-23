import {
  Arbitrary,
  boolean,
  constant,
  dictionary,
  nat,
  record,
  string,
} from 'fast-check'

import { mock } from 'ts-jest-mocker'

import ExecOptions from './ExecOptions'
import arbSignal from './__test__/Signals.arb'

type ArbitraryConstraints<T> = {
  [K in keyof T]?: Arbitrary<T[K]>
}

export function arbExecOptions<T = string>(
  constraints?: ArbitraryConstraints<ExecOptions<T>>
): Arbitrary<ExecOptions<T>>
export function arbExecOptions({
  cwd = string(),
  env = dictionary(string(), string()),
  gid = nat(),
  killSignal = arbSignal(),
  mapResult = constant(({ stdout }) => stdout),
  maxBuffer = nat(),
  shell = boolean(),
  signal = constant(mock<AbortSignal>()),
  timeout = nat(),
  uid = nat(),
  windowsHide = boolean(),
  windowsVerbatimArguments = boolean(),
}: ArbitraryConstraints<ExecOptions> = {}): Arbitrary<ExecOptions> {
  return record<ExecOptions>(
    {
      cwd,
      env,
      gid,
      killSignal,
      mapResult,
      maxBuffer,
      shell,
      signal,
      timeout,
      uid,
      windowsHide,
      windowsVerbatimArguments,
    },
    { requiredKeys: [] }
  )
}

export default arbExecOptions
