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
 */
export interface HLSStreamOptions {
  /**
   * A list of formats to be used for the HLS stream. Each format
   * corresponds to an individual output stream with the specified name,
   * bitrate, and sample rate.
   *
   * @see {@link HLSSTreamFormat}
   */
  readonly formats?: HLSStreamFormat[]

  /**
   * The time in fractional seconds to seek to in the input file when starting
   * the stream.
   */
  readonly seekTime?: string

  /**
   * The duration of each stream segment in seconds. This times the
   * {@link segmentCount} is the "buffer size" of the HLS stream
   */
  readonly segmentDuration?: number

  /**
   * The number of segments to keep in the HLS stream playlist. This times the
   * {@link segmentDuration} is the "buffer size" of the HLS stream.
   */
  readonly segmentCount?: number

  /**
   * The name of the master playlist file. There should be no path prefix or
   * file extension added
   */
  readonly masterPlaylistName?: string

  /**
   * A static suffix to append to each segment file name.
   */
  readonly segmentFileNameSuffix?: string

  /**
   * The name of the individual stream playlist file. There should be no path
   * prefix or file extension added.
   */
  readonly playlistName?: string
}

export const defaults: Required<HLSStreamOptions> = {
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
