import { it } from '@fast-check/jest'
import { anything, array, integer, record, string } from 'fast-check'

import defaultExport, { ExecError } from './ExecError'

import arbSignal from './__test__/Signals.arb'

describe('the ExecError module', () => {
  it('should export the ExecError error class', () => {
    expect(ExecError).toBeDefined()
    expect(typeof ExecError).toBe('function')
    expect(new ExecError('test')).toBeInstanceOf(Error)
  })

  it('should export the ExecError class as its default export', () => {
    expect(defaultExport).toBe(ExecError)
  })

  describe('the ExecError class', () => {
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
            stdout: string(),
            stderr: string(),
          },
          { requiredKeys: [] }
        ),
      ])

      givenMessage('should create an instance of ExecError', (msg) => {
        const error = new ExecError(msg)
        expect(error).toBeInstanceOf(ExecError)
      })

      givenMessage('should set the name property to "ExecError"', (msg) => {
        const error = new ExecError(msg)
        expect(error.name).toBe('ExecError')
      })

      givenMessage('should set the message property', (msg) => {
        const error = new ExecError(msg)
        expect(error.message).toBe(msg)
      })

      givenMessageAndCause(
        'should set the cause property if provided',
        (msg, cause) => {
          const error = new ExecError(msg, { cause })
          expect(error.cause).toBe(cause)
        }
      )

      givenMessageAndCause(
        'should not set context properties if not provided',
        (msg, cause) => {
          const error = new ExecError(msg, { cause })
          expect(error.cmd).toBeUndefined()
          expect(error.args).toBeUndefined()
          expect(error.code).toBeUndefined()
          expect(error.signal).toBeUndefined()
          expect(error.stdout).toBeUndefined()
          expect(error.stderr).toBeUndefined()
        }
      )

      givenMessageCauseAndOptions(
        'should set context properties if provided',
        (msg, cause, options) => {
          const error = new ExecError(msg, { cause, ...options })
          expect(error.cause).toBe(cause)
          expect(error.cmd).toBe(options.cmd)
          expect(error.args).toBe(options.args)
          expect(error.code).toBe(options.code)
          expect(error.signal).toBe(options.signal)
          expect(error.stdout).toBe(options.stdout)
          expect(error.stderr).toBe(options.stderr)
        }
      )
    })

    describe('the failedWithError static error constructor', () => {
      const givenCmdAndCause = it.prop([
        string(),
        array(string()),
        record(
          {
            message: string(),
            cause: anything(),
            stdout: string(),
            stderr: string(),
          },
          { requiredKeys: ['message'] }
        ).map(({ message, ...rest }) => {
          const error = new Error(message, rest) as Error & {
            stdout?: string
            stderr?: string
          }
          error.stdout = rest.stdout
          error.stderr = rest.stderr
          return error
        }),
      ])

      givenCmdAndCause(
        'should create an ExecError with expected properties',
        (cmd, args, cause) => {
          const error = ExecError.failedWithError(
            cmd,
            args,
            cause,
            cause.stdout,
            cause.stderr
          )
          expect(error).toBeInstanceOf(ExecError)
          expect(error.cmd).toBe(cmd)
          expect(error.args).toBe(args)
          expect(error.cause).toBe(cause)
          expect(error.stdout).toBe(cause.stdout)
          expect(error.stderr).toBe(cause.stderr)

          expect(error.code).toBeUndefined()
          expect(error.signal).toBeUndefined()
        }
      )

      givenCmdAndCause(
        'should create an ExecError with a message with expected details',
        (cmd, args, cause) => {
          const error = ExecError.failedWithError(
            cmd,
            args,
            cause,
            cause.stdout,
            cause.stderr
          )
          expect(error.message).toContain(cmd)
          expect(error.message).toContain(cause.message)
          expect(error.message).toContain('failed with error')
        }
      )
    })

    describe('the exitedWithNonzeroCode static error constructor', () => {
      const givenCmdAndCause = it.prop([
        string(),
        array(string()),
        record(
          {
            message: string(),
            cause: anything(),
            code: integer({ min: 1 }),
            stdout: string(),
            stderr: string(),
          },
          { requiredKeys: ['message', 'code'] }
        ).map(({ message, ...rest }) => {
          const error = new Error(message, rest) as Error & {
            code: number
            stdout?: string
            stderr?: string
          }
          error.code = rest.code
          error.stdout = rest.stdout
          error.stderr = rest.stderr
          return error
        }),
      ])

      givenCmdAndCause(
        'should create an ExecError with expected properties',
        (cmd, args, cause) => {
          const error = ExecError.exitedWithNonzeroCode(
            cmd,
            args,
            cause.code,
            cause,
            cause.stdout,
            cause.stderr
          )
          expect(error).toBeInstanceOf(ExecError)
          expect(error.cmd).toBe(cmd)
          expect(error.args).toBe(args)
          expect(error.code).toBe(cause.code)
          expect(error.cause).toBe(cause)
          expect(error.stdout).toBe(cause.stdout)
          expect(error.stderr).toBe(cause.stderr)

          expect(error.signal).toBeUndefined()
        }
      )

      givenCmdAndCause(
        'should create an ExecError with a message with expected details',
        (cmd, args, cause) => {
          const error = ExecError.exitedWithNonzeroCode(
            cmd,
            args,
            cause.code,
            cause,
            cause.stdout,
            cause.stderr
          )
          expect(error.message).toContain(cmd)
          expect(error.message).toContain(cause.code.toString())
          expect(error.message).toContain('exited with code')
        }
      )
    })

    describe('the terminatedBySignal static error constructor', () => {
      const givenCmdAndCause = it.prop([
        string(),
        array(string()),
        record(
          {
            message: string(),
            cause: anything(),
            signal: arbSignal(),
            stdout: string(),
            stderr: string(),
          },
          { requiredKeys: ['message', 'signal'] }
        ).map(({ message, ...rest }) => {
          const error = new Error(message, rest) as Error & {
            signal: NodeJS.Signals
            stdout?: string
            stderr?: string
          }
          error.signal = rest.signal
          error.stdout = rest.stdout
          error.stderr = rest.stderr
          return error
        }),
      ])

      givenCmdAndCause(
        'should create an ExecError with expected properties',
        (cmd, args, cause) => {
          const error = ExecError.terminatedBySignal(
            cmd,
            args,
            cause.signal,
            cause,
            cause.stdout,
            cause.stderr
          )
          expect(error).toBeInstanceOf(ExecError)
          expect(error.cmd).toBe(cmd)
          expect(error.args).toBe(args)
          expect(error.signal).toBe(cause.signal)
          expect(error.cause).toBe(cause)
          expect(error.stdout).toBe(cause.stdout)
          expect(error.stderr).toBe(cause.stderr)

          expect(error.code).toBeUndefined()
        }
      )

      givenCmdAndCause(
        'should create an ExecError with a message with expected details',
        (cmd, args, cause) => {
          const error = ExecError.terminatedBySignal(
            cmd,
            args,
            cause.signal,
            cause,
            cause.stdout,
            cause.stderr
          )
          expect(error.message).toContain(cmd)
          expect(error.message).toContain(cause.signal.toString())
          expect(error.message).toContain('terminated by signal')
        }
      )
    })
  })
})
