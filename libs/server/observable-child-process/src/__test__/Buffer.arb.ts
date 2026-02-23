import {
  Arbitrary,
  array,
  int16Array,
  int32Array,
  int8Array,
  integer,
  oneof,
  string,
  uint16Array,
  uint32Array,
  uint8Array,
  uint8ClampedArray,
} from 'fast-check'

export function arbBuffer(): Arbitrary<Buffer> {
  return oneof(
    oneof(string(), uint8Array(), array(integer())).map(Buffer.from),
    oneof(
      int8Array(),
      int16Array(),
      int32Array(),
      uint8ClampedArray(),
      uint16Array(),
      uint32Array()
    ).map(Buffer.copyBytesFrom)
  )
}

export default arbBuffer
