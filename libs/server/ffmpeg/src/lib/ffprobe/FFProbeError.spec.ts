import { Arbitrary } from 'fast-check'
import { it, fc } from '@fast-check/jest'

import { FFProbeError } from './FFProbeError'

describe('FFProbeError', () => {
  it.prop([arbFFProbeError()])(
    'should create an instance with the correct name',
    async (error) => {
      expect(error.name).toBe('FFProbeError')
    }
  )

  it.prop([arbFFProbeError()])('should inherit from Error', async (error) => {
    expect(error instanceof Error).toBe(true)
  })

  it.prop([arbFFProbeErrorWithMessage()])(
    'should accept a custom message',
    async ([message, error]) => {
      expect(error.message).toBe(message)
    }
  )

  it.prop([arbFFProbeErrorWithOptions()])(
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

function arbFFProbeError({
  message = fc.string(),
  errorOptions = fc.option(arbErrorOptions()),
}: {
  message?: Arbitrary<string>
  errorOptions?: Arbitrary<ErrorOptions | undefined>
} = {}): Arbitrary<FFProbeError> {
  return fc
    .tuple(message, errorOptions)
    .map(([msg, options]) => new FFProbeError(msg, options))
}

function arbFFProbeErrorWithMessage(
  message: Arbitrary<string> = fc.string()
): Arbitrary<[string, FFProbeError]> {
  return message.chain((msg) =>
    fc.tuple(fc.constant(msg), arbFFProbeError({ message: fc.constant(msg) }))
  )
}

function arbFFProbeErrorWithOptions(
  errorOptions: Arbitrary<ErrorOptions> = arbErrorOptions()
): Arbitrary<[ErrorOptions, FFProbeError]> {
  return errorOptions.chain((options) =>
    fc.tuple(
      fc.constant(options),
      arbFFProbeError({ errorOptions: fc.constant(options) })
    )
  )
}
