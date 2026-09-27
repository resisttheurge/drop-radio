import S from 'fluent-json-schema'
import { FFProbeFormat } from './FFProbeFormat'

/**
 * Represents the result of an `ffprobe` command.
 */
export interface FFProbeResult {
  /**
   * Format information of the probed file
   * @see {@link FFProbeFormat}
   */
  readonly format?: FFProbeFormat
}

export const schema = S.object<FFProbeResult>()
  .id('https://schema.dropradio.info/ffprobe#result')
  .title('ffprobe result data')
  .prop('format', FFProbeFormat.schema)
  .additionalProperties(false)

export const FFProbeResult = {
  schema,
}
