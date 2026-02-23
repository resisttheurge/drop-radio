import { fc, it } from '@fast-check/jest'

import rotateBuffer from './rotateBuffer'

import arbBuffer from './__test__/Buffer.arb'

describe('the rotateBuffer function', () => {
  // Scenarios:

  const givenValidBuffersAndIdealMaxBytes = it.prop([
    arbBuffer(),
    arbBuffer(),
    fc.nat(),
  ])

  const givenValidBuffersAndNegativeMaxBytes = it.prop([
    arbBuffer(),
    arbBuffer(),
    fc.integer({ max: -1 }),
  ])

  const givenValidBuffersAndDoubleMaxBytes = it.prop([
    arbBuffer(),
    arbBuffer(),
    fc.double({ noNaN: true }),
  ])

  const givenValidBuffersAndNaNMaxBytes = it.prop([
    arbBuffer(),
    arbBuffer(),
    fc
      .oneof(
        fc.boolean(),
        fc.string(),
        fc.array(fc.anything(), { size: 'xsmall' }),
        fc.object({ size: 'xsmall' }),
        fc.constantFrom(null, undefined, NaN)
      )
      .filter((x) => typeof x !== 'number' || isNaN(x)),
  ])

  // Properties:

  givenValidBuffersAndIdealMaxBytes(
    'should return a buffer with length <= maxBytes',
    (oldData, newData, maxBytes) => {
      const result = rotateBuffer(oldData, newData, maxBytes)
      expect(result.length).toBeLessThanOrEqual(maxBytes)
    }
  )

  givenValidBuffersAndIdealMaxBytes(
    'should always start with the oldest data',
    (oldData, newData, maxBytes) => {
      const result = rotateBuffer(oldData, newData, maxBytes)
      const latestDataSize = Math.min(newData.length, Math.floor(maxBytes))
      expect(result.subarray(result.length - latestDataSize)).toEqual(
        newData.subarray(newData.length - latestDataSize)
      )
    }
  )

  givenValidBuffersAndIdealMaxBytes(
    'should always end with the most recent data',
    (oldData, newData, maxBytes) => {
      const result = rotateBuffer(oldData, newData, maxBytes)
      const latestDataSize = Math.min(newData.length, Math.floor(maxBytes))
      expect(result.subarray(result.length - latestDataSize)).toEqual(
        newData.subarray(newData.length - latestDataSize)
      )
    }
  )

  givenValidBuffersAndNegativeMaxBytes(
    'should treat negative maxBytes as zero',
    (oldData, newData, maxBytes) => {
      const result = rotateBuffer(oldData, newData, maxBytes)
      expect(result).toEqual(rotateBuffer(oldData, newData, 0))
    }
  )

  givenValidBuffersAndDoubleMaxBytes(
    'should normalize non-integer maxBytes with Math.floor',
    (oldData, newData, maxBytes) => {
      const result = rotateBuffer(oldData, newData, maxBytes)
      expect(result).toEqual(
        rotateBuffer(oldData, newData, Math.floor(maxBytes))
      )
    }
  )

  givenValidBuffersAndNaNMaxBytes(
    'should throw if maxBytes is not a number',
    (oldData, newData, maxBytes) => {
      expect(() => rotateBuffer(oldData, newData, maxBytes as number)).toThrow()
    }
  )
})
