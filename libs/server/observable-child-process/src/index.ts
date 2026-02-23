export { type CommandOrThunk } from './CommandOrThunk'
export { exec } from './exec'
export { ExecError, type ExecErrorOptions } from './ExecError'
export { ExecOptions } from './ExecOptions'
export { spawn } from './spawn'
export { SpawnError, type SpawnErrorOptions } from './SpawnError'
export { SpawnOptions } from './SpawnOptions'

import exec from './exec'
import ExecError from './ExecError'
import ExecOptions from './ExecOptions'
import spawn from './spawn'
import SpawnError from './SpawnError'
import SpawnOptions from './SpawnOptions'
export default {
  exec,
  ExecError,
  ExecOptions,
  spawn,
  SpawnError,
  SpawnOptions,
} as const
