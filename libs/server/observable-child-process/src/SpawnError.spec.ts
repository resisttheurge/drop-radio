import { it } from '@fast-check/jest'
import { anything, array, integer, option, record, string } from 'fast-check'

import * as namedExports from './SpawnError'

import arbBuffer from './__test__/Buffer.arb'
import arbSignal from './__test__/Signals.arb'

describe('the SpawnError module', () => {
  const {
    SpawnError,
    default: defaultExport,
    ...unexpectedExports
  } = namedExports
  it('should export the SpawnError error class', () => {
    expect(SpawnError).toBeDefined()
    expect(typeof SpawnError).toBe('function')
    expect(new SpawnError('test')).toBeInstanceOf(Error)
  })

  it('should export the SpawnError class as its default export', () => {
    expect(defaultExport).toBe(SpawnError)
  })

  it('should not have any unexpected named exports', () => {
    expect(unexpectedExports).toEqual({})
  })

  describe('the SpawnError class', () => {
    describe('the constructor', () => {
      const givenMessage = it.prop([string()])

      const givenMessageAndCause = it.prop([string(), anything()])

      const givenMessageCauseAndOptions = it.prop([
        string(),
        anything(),
        record(
          {
            cmd: string(),
            args: array(string()),
            code: integer(),
            signal: arbSignal(),
            stderr: arbBuffer(),
          },
          { requiredKeys: [] }
        ),
      ])

      givenMessage('should create an instance of SpawnError', (msg) => {
        const error = new SpawnError(msg)
        expect(error).toBeInstanceOf(SpawnError)
      })

      givenMessage('should set the name property to "SpawnError"', (msg) => {
        const error = new SpawnError(msg)
        expect(error.name).toBe('SpawnError')
      })

      givenMessage('should set the message property', (msg) => {
        const error = new SpawnError(msg)
        expect(error.message).toBe(msg)
      })

      givenMessageAndCause(
        'should set the cause property if provided',
        (msg, cause) => {
          const error = new SpawnError(msg, { cause })
          expect(error.cause).toBe(cause)
        }
      )

      givenMessageAndCause(
        'should not set context properties if not provided',
        (msg, cause) => {
          const error = new SpawnError(msg, { cause })
          expect(error.cmd).toBeUndefined()
          expect(error.args).toBeUndefined()
          expect(error.code).toBeUndefined()
          expect(error.signal).toBeUndefined()
          expect(error.stderr).toBeUndefined()
        }
      )

      givenMessageCauseAndOptions(
        'should set context properties if provided',
        (msg, cause, options) => {
          const error = new SpawnError(msg, { cause, ...options })
          expect(error.cause).toBe(cause)
          expect(error.cmd).toBe(options.cmd)
          expect(error.args).toBe(options.args)
          expect(error.code).toBe(options.code)
          expect(error.signal).toBe(options.signal)
          expect(error.stderr).toBe(options.stderr)
        }
      )
    })

    describe('the failedWithError static error constructor', () => {
      const givenCmdAndCause = it.prop([
        string(),
        array(string()),
        record({ message: string(), cause: anything() }).map(
          ({ message, ...rest }) => new Error(message, rest)
        ),
      ])

      givenCmdAndCause(
        'should create a SpawnError with the expected properties',
        (cmd, args, cause) => {
          const error = SpawnError.failedWithError(cmd, args, cause)
          expect(error).toBeInstanceOf(SpawnError)
          expect(error.cmd).toBe(cmd)
          expect(error.args).toBe(args)
          expect(error.cause).toBe(cause)
        }
      )

      givenCmdAndCause(
        'should create a SpawnError with a message with expected details',
        (cmd, args, cause) => {
          const error = SpawnError.failedWithError(cmd, args, cause)
          expect(error.message).toContain(cmd)
          expect(error.message).toContain(cause.message)
          expect(error.message).toContain('failed with error')
        }
      )
    })

    describe('the exitedWithNonzeroCode static error constructor', () => {
      const givenCmdArgsCodeAndStderr = it.prop([
        string(),
        array(string()),
        integer({ min: 1 }),
        option(arbBuffer(), { nil: undefined }),
      ])

      givenCmdArgsCodeAndStderr(
        'should create a SpawnError with the expected properties',
        (cmd, args, code, stderr) => {
          const error = SpawnError.exitedWithNonzeroCode(
            cmd,
            args,
            code,
            stderr
          )
          expect(error).toBeInstanceOf(SpawnError)
          expect(error.cmd).toBe(cmd)
          expect(error.args).toBe(args)
          expect(error.code).toBe(code)
          expect(error.stderr).toBe(stderr)
          expect(error.cause).toBe(stderr ?? code)
        }
      )

      givenCmdArgsCodeAndStderr(
        'should create a SpawnError with a message with expected details',
        (cmd, args, code, stderr) => {
          const error = SpawnError.exitedWithNonzeroCode(
            cmd,
            args,
            code,
            stderr
          )
          expect(error.message).toContain(cmd)
          expect(error.message).toContain(code.toString())
          expect(error.message).toContain('exited with code')
        }
      )
    })

    describe('the terminatedBySignal static error constructor', () => {
      const givenCmdArgsSignalAndStderr = it.prop([
        string(),
        array(string()),
        arbSignal(),
        option(arbBuffer(), { nil: undefined }),
      ])

      givenCmdArgsSignalAndStderr(
        'should create a SpawnError with the expected properties',
        (cmd, args, signal, stderr) => {
          const error = SpawnError.terminatedBySignal(cmd, args, signal, stderr)
          expect(error).toBeInstanceOf(SpawnError)
          expect(error.cmd).toBe(cmd)
          expect(error.args).toBe(args)
          expect(error.signal).toBe(signal)
          expect(error.stderr).toBe(stderr)
          expect(error.cause).toBe(stderr ?? signal)
        }
      )

      givenCmdArgsSignalAndStderr(
        'should create a SpawnError with a message with expected details',
        (cmd, args, signal, stderr) => {
          const error = SpawnError.terminatedBySignal(cmd, args, signal, stderr)
          expect(error.message).toContain(cmd)
          expect(error.message).toContain(signal)
          expect(error.message).toContain('terminated by signal')
        }
      )
    })
  })
})
