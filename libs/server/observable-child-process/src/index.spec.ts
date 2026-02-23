import libExec from './exec'
import libExecError from './ExecError'
import libExecOptions from './ExecOptions'
import * as namedExports from './index'
import libSpawn from './spawn'
import libSpawnError from './SpawnError'
import libSpawnOptions from './SpawnOptions'

describe('the observable-child-process index module', () => {
  const {
    exec,
    ExecError,
    ExecOptions,
    spawn,
    SpawnError,
    SpawnOptions,
    default: defaultExport,
    ...unexpectedExports
  } = namedExports

  it('should export the exec function from the exec module', () => {
    expect(exec).toBeDefined()
    expect(typeof exec).toBe('function')
    expect(exec).toBe(libExec)
  })

  it('should export the ExecError class from the ExecError module', () => {
    expect(ExecError).toBeDefined()
    expect(typeof ExecError).toBe('function')
    expect(ExecError).toBe(libExecError)
  })

  it('should export the ExecOptions object from the ExecOptions module', () => {
    expect(ExecOptions).toBeDefined()
    expect(typeof ExecOptions).toBe('object')
    expect(ExecOptions).toBe(libExecOptions)
  })

  it('should export the spawn function from the spawn module', () => {
    expect(spawn).toBeDefined()
    expect(typeof spawn).toBe('function')
    expect(spawn).toBe(libSpawn)
  })

  it('should export the SpawnError class from the SpawnError module', () => {
    expect(SpawnError).toBeDefined()
    expect(typeof SpawnError).toBe('function')
    expect(SpawnError).toBe(libSpawnError)
  })

  it('should export the SpawnOptions object from the SpawnOptions module', () => {
    expect(SpawnOptions).toBeDefined()
    expect(typeof SpawnOptions).toBe('object')
    expect(SpawnOptions).toBe(libSpawnOptions)
  })

  it('should not have any unexpected named exports', () => {
    expect(unexpectedExports).toEqual({})
  })

  it('should export all named exports in a single object as its default export', () => {
    expect(defaultExport).toEqual({
      exec,
      ExecError,
      ExecOptions,
      spawn,
      SpawnError,
      SpawnOptions,
    })
  })
})
