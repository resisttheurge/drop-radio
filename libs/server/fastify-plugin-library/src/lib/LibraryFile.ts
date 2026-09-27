import { FFProbeResult } from '@drop-radio/ffmpeg'
import S from 'fluent-json-schema'

export interface LibraryFile {
  path: string
  name: string
  ext: string
  probe?: FFProbeResult
}

export const schema = S.object<LibraryFile>()
  .id('https://schema.dropradio.info/library#file')
  .title('drop radio live library file data')
  .prop('path', S.string())
  .prop('name', S.string())
  .prop('ext', S.string())
  .prop('probe', FFProbeResult.schema)
  .required(['path', 'name', 'ext'])
  .additionalProperties(false)

export const LibraryFile = {
  schema,
}
