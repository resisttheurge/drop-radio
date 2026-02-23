import { it } from '@fast-check/jest'
import { oneof, string } from 'fast-check'

import * as namedExports from './SpawnOptions'

import arbBuffer from './__test__/Buffer.arb'

describe('the SpawnOptions module', () => {
  const {
    SPAWN_OPTION_DEFAULTS,
    SpawnOptions,
    default: defaultExport,
    ...unexpectedExports
  } = namedExports
  it('should export the SPAWN_OPTION_DEFAULTS constant', () => {
    expect(SPAWN_OPTION_DEFAULTS).toBeDefined()
  })

  it('should export the SpawnOptions namespace', () => {
    expect(SpawnOptions).toBeDefined()
  })

  it('should export the SpawnOptions namespace by default', () => {
    expect(defaultExport).toBe(SpawnOptions)
  })

  it('should not have any unexpected named exports', () => {
    expect(unexpectedExports).toEqual({})
  })

  describe('the SpawnOptions namespace', () => {
    it('should include defaults equal to SPAWN_OPTION_DEFAULTS', () => {
      expect(SpawnOptions.defaults).toBeDefined()
      expect(SpawnOptions.defaults).toBe(SPAWN_OPTION_DEFAULTS)
    })
  })

  describe('the SPAWN_OPTION_DEFAULTS constant', () => {
    const actualDefaults = SPAWN_OPTION_DEFAULTS as namedExports.SpawnOptions

    it('should disable error tracing by default', () => {
      expect(actualDefaults.errorTrace).toBe(false)
    })

    it('should set the default error trace buffer to 1 MB', () => {
      expect(actualDefaults.maxBuffer).toBe(1024 * 1024)
    })

    it.prop([oneof(string(), arbBuffer())])(
      'should set the default mapStdout to the identity function',
      (input) => {
        expect(actualDefaults.mapStdout).toBeDefined()
        expect(typeof actualDefaults.mapStdout).toBe('function')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(actualDefaults.mapStdout!(input)).toBe(input)
      }
    )

    it('should not set any other defaults', () => {
      // Remaining SpawnOptions
      expect(actualDefaults.mapStderr).toBeUndefined()

      // CommonSpawnOptions
      expect(actualDefaults.argv0).toBeUndefined()
      expect(actualDefaults.stdio).toBeUndefined()
      expect(actualDefaults.shell).toBeUndefined()
      expect(actualDefaults.windowsVerbatimArguments).toBeUndefined()

      // CommonOptions
      expect(actualDefaults.windowsHide).toBeUndefined()
      expect(actualDefaults.timeout).toBeUndefined()

      // ProcessEnvOptions
      expect(actualDefaults.uid).toBeUndefined()
      expect(actualDefaults.gid).toBeUndefined()
      expect(actualDefaults.cwd).toBeUndefined()
      expect(actualDefaults.env).toBeUndefined()

      // MessagingOptions
      expect(actualDefaults.serialization).toBeUndefined()
      expect(actualDefaults.killSignal).toBeUndefined()

      // Abortable
      expect(actualDefaults.signal).toBeUndefined()
    })
  })
})
