/**
 * Specifies format options for an individual HLS stream
 */
export interface HLSStreamFormat {
  /**
   * The name of the stream. Can be used in HLS stream segment and playlist
   * file names.
   */
  readonly name: string

  /**
   * The bitrate of the stream, in bits per second (e.g., `128k` or `1.53M`).
   */
  readonly bitrate: string

  /**
   * The sample rate of the stream, in Hertz (e.g., `44100` or `44.1k`).
   */
  readonly sampleRate: string
}

/**
 * Options for configuring HLS streaming.
 * @see {@link HLS_STREAM_DEFAULTS} for default options.
 */
export interface HLSStreamOptions {
  /**
   * An optional list of formats to be used for the HLS stream. Each format
   * corresponds to an individual output stream with the specified name,
   * bitrate, and sample rate.
   *
   * @see {@link HLSStreamFormat}
   */
  readonly formats?: HLSStreamFormat[]

  /**
   * An optional start time of the stream relative to the start of the input
   * file, in fractional seconds (e.g., `'10'`, or `'5.345'`). Note that
   * progress events emitted by the resulting Observable will have total time
   * properties that are relative to this seek time.
   */
  readonly seekTime?: string

  /**
   * An optional duration for each stream segment, in seconds. This times the
   * {@link segmentCount} is the "buffer size" of the HLS stream
   */
  readonly segmentDuration?: number

  /**
   * An optional number of segments tracked by the generated playlist files.
   * Older segment files (over a threshold) will be automatically removed.
   * This times the {@link segmentDuration} is the "buffer size" of the HLS
   * stream.
   */
  readonly segmentCount?: number

  /**
   * An optional name for the playlist file. This file will be at the root of
   * the output directory, and have the `.m3u8` file extension, so there should
   * be no path prefix or file extension included in this value.
   */
  readonly masterPlaylistName?: string

  /**
   * An optional suffix for generated segment file names. These files will be in
   * a sub-directory named after the `format` they belong to, they will be
   * prefixed by the current date and time in `YYYYMMDD_SSSssssss` format,
   * and they will have the `.ts` file extension, so there should be no file
   * extension included in this value.
   */
  readonly segmentFileNameSuffix?: string

  /**
   * An optional name for the playlist files generated for each variable-quality
   * stream. These files will be in a sub-directory named after the `format`
   * they belong to, and they will have the `.m3u8` file extension, so there
   * should be no path prefix or file extension added.
   */
  readonly playlistName?: string
}

/**
 * Default options ({@link HLSStreamOptions}) for HLS streaming.
 *
 * {@includeCode HLSStreamOptions.ts#HLS_STREAM_DEFAULTS}
 */
// #region HLS_STREAM_DEFAULTS
export const HLS_STREAM_DEFAULTS: Required<HLSStreamOptions> = {
  formats: [
    { name: '01_highest', bitrate: '1.528M', sampleRate: '96k' },
    { name: '02_high', bitrate: '640k', sampleRate: '48k' },
    { name: '03_medium', bitrate: '128k', sampleRate: '24k' },
    { name: '04_low', bitrate: '32k', sampleRate: '12k' },
    { name: '05_lowest', bitrate: '12k', sampleRate: '7350' },
  ],
  seekTime: '0',
  segmentDuration: 2,
  segmentCount: 4,
  masterPlaylistName: '00_stream',
  segmentFileNameSuffix: '',
  playlistName: 'stream',
}
// #endregion HLS_STREAM_DEFAULTS
