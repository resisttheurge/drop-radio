import { Arbitrary } from 'fast-check'
import { it, fc } from '@fast-check/jest'

import { HLSStreamError } from './HLSStreamError'

describe('HLSStreamError', () => {
  it.prop([arbHLSStreamError()])(
    'should create an instance with the correct name',
    async (error) => {
      expect(error.name).toBe('HLSStreamError')
    }
  )

  it.prop([arbHLSStreamError()])('should inherit from Error', async (error) => {
    expect(error instanceof Error).toBe(true)
  })

  it.prop([arbHLSStreamErrorWithMessage()])(
    'should accept a custom message',
    async ([message, error]) => {
      expect(error.message).toBe(message)
    }
  )

  it.prop([arbHLSStreamErrorWithOptions()])(
    'should accept options',
    async ([options, error]) => {
      expect(error.cause).toBe(options.cause)
    }
  )
})

function arbErrorOptions(
  cause: Arbitrary<unknown> = fc.anything()
): Arbitrary<ErrorOptions> {
  return fc.record({ cause })
}

function arbHLSStreamError({
  message = fc.string(),
  errorOptions = fc.option(arbErrorOptions()),
}: {
  message?: Arbitrary<string>
  errorOptions?: Arbitrary<ErrorOptions | undefined>
} = {}): Arbitrary<HLSStreamError> {
  return fc
    .tuple(message, errorOptions)
    .map(([msg, options]) => new HLSStreamError(msg, options))
}

function arbHLSStreamErrorWithMessage(
  message: Arbitrary<string> = fc.string()
): Arbitrary<[string, HLSStreamError]> {
  return message.chain((msg) =>
    fc.tuple(fc.constant(msg), arbHLSStreamError({ message: fc.constant(msg) }))
  )
}

function arbHLSStreamErrorWithOptions(
  errorOptions: Arbitrary<ErrorOptions> = arbErrorOptions()
): Arbitrary<[ErrorOptions, HLSStreamError]> {
  return errorOptions.chain((options) =>
    fc.tuple(
      fc.constant(options),
      arbHLSStreamError({ errorOptions: fc.constant(options) })
    )
  )
}
