import child_process from 'node:child_process'

import fc from 'fast-check'

import * as namedExports from './exec'

jest.mock('node:child_process')

describe('the exec module', () => {
  const { exec, default: defaultExport, ...unexpectedExports } = namedExports
  it('should export the exec function', () => {
    expect(exec).toBeDefined()
    expect(typeof exec).toBe('function')
  })

  it('should export the exec function as its default export', () => {
    expect(defaultExport).toBe(exec)
  })

  it('should not have any unexpected named exports', () => {
    expect(unexpectedExports).toEqual({})
  })

  describe('the exec function', () => {
    // Test state
    let execFileSpy: jest.SpyInstance<
      ReturnType<typeof child_process.execFile>,
      Parameters<typeof child_process.execFile>
    >

    // Per-test setup
    function setup() {
      execFileSpy = jest.mocked(child_process).execFile.mockImplementation()
    }

    // Per-test teardown
    function teardown() {
      jest.clearAllMocks()
    }

    // Configure jest and fast-check
    beforeEach(setup)
    afterEach(teardown)
    fc.configureGlobal({ beforeEach: setup, afterEach: teardown })
  })
})
