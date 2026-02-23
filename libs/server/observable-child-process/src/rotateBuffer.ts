import invariant from 'tiny-invariant'

/**
 * Concatenates two buffers, preserving a maximum size. If the combined size exceeds `maxBytes`,
 * the oldest data is discarded to keep the buffer within the limit.
 *
 * @param oldData - old data buffer
 * @param newData - new data buffer to append
 * @param maxBytes - maximum size of the resulting buffer
 * @returns a new buffer containing the concatenated data, rotated to fit within `maxBytes`
 * @throws if `maxBytes` is `NaN`
 * @internal
 */
export function rotateBuffer(
  oldData: Buffer,
  newData: Buffer,
  maxBytes: number
): Buffer {
  invariant(
    typeof maxBytes === 'number' && !isNaN(maxBytes),
    'maxBytes must be a number'
  )
  const intMaxBytes = Math.floor(maxBytes)
  if (oldData.length + newData.length <= intMaxBytes) {
    return Buffer.concat([oldData, newData])
  } else if (newData.length >= intMaxBytes) {
    return newData.subarray(newData.length - intMaxBytes)
  } else {
    const offset = oldData.length - (intMaxBytes - newData.length)
    return Buffer.concat([oldData.subarray(offset), newData])
  }
}

export default rotateBuffer
