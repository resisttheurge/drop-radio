import S from 'fluent-json-schema'

/**
 * Represents the format information in the result of an `ffprobe`
 * command when called with the `-show_format` option.
 *
 */
export interface FFProbeFormat {
  /**
   * The file name
   */
  readonly filename: string

  /**
   * The number of streams (audio and video) in the file
   */
  readonly nb_streams: number

  /**
   * The number of programs in the file
   */
  readonly nb_programs: number

  /**
   * The number of stream groups in the file
   */
  readonly nb_stream_groups: number

  /**
   * The format name of the file
   *
   * for example, "wav", "mp4", or "mkv"
   */
  readonly format_name: string

  /**
   * The long format name of the file
   *
   * for example, "WAV / WAVE (Waveform Audio)"
   */
  readonly format_long_name: string

  /**
   * The duration of the file's media.
   *
   * By default, it is formatted as `S+.mmmmmm`, where `S+` expresses the
   * number of seconds, and `mmmmmm` the fractional seconds
   *
   * When `ffprobe` is called with the `-sexagesimal` or `-pretty`
   * options, it will be formatted as `HH:MM:SS.mmmmmm`, where HH
   * expresses the number of hours, MM the number of minutes for a
   * maximum of 2 digits, SS the number of seconds for a maximum of
   * 2 digits, and mmmmmm the number of microseconds of the duration
   *
   */
  readonly duration: string

  /**
   * The size of the file.
   *
   * By default, it is an integer that represents the number of bytes
   *
   * When `ffprobe` is called with either `-prefix -byte_bindary_prefix
   * -unit` or `-pretty`, it will be formatted with a binary prefix and
   * unit, for example `1.5 Mibyte` instead of `1572864`
   */
  readonly size: string

  /**
   * The bit rate of the file.
   *
   * By default, it is an integer that represents the number of bits
   * per second
   *
   * When `ffprobe` is called with either `-prefix -unit` or `-pretty`,
   * it will be formatted with an SI prefix and unit, for example
   * `1.5 Mbit/s` instead of `15000000`
   */
  readonly bit_rate: string

  /**
   * Undocumented field that seems to indicate how likely the file is to
   * be the format it claims to be in its extension.
   */
  readonly probe_score: number
}

export const schema = S.object<FFProbeFormat>()
  .id('https://schema.dropradio.info/ffprobe#format')
  .title('ffprobe format data')
  .prop('filename', S.string())
  .prop('nb_streams', S.number())
  .prop('nb_programs', S.number())
  .prop('nb_stream_groups', S.number())
  .prop('format_name', S.string())
  .prop('format_long_name', S.string())
  .prop('duration', S.string())
  .prop('size', S.string())
  .prop('bit_rate', S.string())
  .prop('probe_score', S.number())
  .additionalProperties(false)
  .required([
    'filename',
    'nb_streams',
    'nb_programs',
    'nb_stream_groups',
    'format_name',
    'format_long_name',
    'duration',
    'size',
    'bit_rate',
    'probe_score',
  ])

export const FFProbeFormat = {
  schema,
}
