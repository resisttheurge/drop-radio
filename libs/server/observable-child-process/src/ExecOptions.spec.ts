import { it } from '@fast-check/jest'
import { record, string } from 'fast-check'

import defaultExport, { EXEC_OPTION_DEFAULTS, ExecOptions } from './ExecOptions'

describe('the ExecOptions module', () => {
  it('should export the EXEC_OPTION_DEFAULTS constant', () => {
    expect(EXEC_OPTION_DEFAULTS).toBeDefined()
  })

  it('should export the ExecOptions namespace', () => {
    expect(ExecOptions).toBeDefined()
  })

  it('should export the ExecOptions namespace by default', () => {
    expect(defaultExport).toBe(ExecOptions)
  })

  describe('the ExecOptions namespace', () => {
    it('should include defaults equal to EXEC_OPTION_DEFAULTS', () => {
      expect(ExecOptions.defaults).toBeDefined()
      expect(ExecOptions.defaults).toBe(EXEC_OPTION_DEFAULTS)
    })
  })

  describe('the EXEC_OPTION_DEFAULTS constant', () => {
    const actualDefaults = EXEC_OPTION_DEFAULTS as ExecOptions

    it.prop([record({ stdout: string(), stderr: string() })])(
      'should set the default mapResult to a function that extracts stdout from the input',
      (input) => {
        expect(actualDefaults.mapResult).toBeDefined()
        expect(typeof actualDefaults.mapResult).toBe('function')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(actualDefaults.mapResult!(input)).toBe(input.stdout)
      }
    )

    it('should not set any other defaults', () => {
      // ExecFileOptions
      expect(actualDefaults.maxBuffer).toBeUndefined()
      expect(actualDefaults.killSignal).toBeUndefined()
      expect(actualDefaults.windowsVerbatimArguments).toBeUndefined()
      expect(actualDefaults.shell).toBeUndefined()
      expect(actualDefaults.signal).toBeUndefined()

      // CommonOptions
      expect(actualDefaults.windowsHide).toBeUndefined()
      expect(actualDefaults.timeout).toBeUndefined()

      // ProcessEnvOptions
      expect(actualDefaults.uid).toBeUndefined()
      expect(actualDefaults.gid).toBeUndefined()
      expect(actualDefaults.cwd).toBeUndefined()
      expect(actualDefaults.env).toBeUndefined()

      // Abortable
      expect(actualDefaults.signal).toBeUndefined()
    })
  })
})
