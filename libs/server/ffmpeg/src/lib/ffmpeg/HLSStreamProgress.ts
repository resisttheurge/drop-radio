/**
 * Represents the output of ffmpeg with the `-progress` option
 */
export interface HLSStreamProgress {
  /**
   * The bitrate of the stream, in bits per second (e.g., `128k` or `1.53M`).
   * For HLS streams with multiple formats, will be `'N/A'`
   */
  readonly bitrate: string | 'N/A'

  /**
   * The total size of output in bytes. For HLS streams with multiple formats,
   * will be `'N/A'`
   */
  readonly total_size: string | 'N/A'

  /**
   * The time in microseconds that has been output so far
   */
  readonly out_time_us: string | 'N/A'

  /**
   * The time in microseconds that has been output so far
   *
   * @deprecated this field has been moved to {@link out_time_us} and will be
   *             removed in a future version of ffmpeg
   * @see {@link https://trac.ffmpeg.org/ticket/7345} and
   *      {@link https://git.ffmpeg.org/gitweb/ffmpeg.git/commit/26dc76324564fc572689509c2efb7f1cb8f41a45}
   */
  readonly out_time_ms: string | 'N/A'

  /**
   * The time in the format `HH:MM:SS.mmmmmm` that has been output so far
   */
  readonly out_time: string | 'N/A'

  /**
   * The speed that stream files are being generated in multiples of "real time"
   * (e.g., `1x` for real time, `2.34x` for over twice as fast, `0.01x` for very
   * slow)
   */
  readonly speed: string | 'N/A'

  /**
   * A string representing whether this progress report is the end or just a
   * continuation of the stream, i.e., `'continue'` or `'end'`.
   */
  readonly progress: 'continue' | 'end'
}

export function parseHLSStreamProgress(data: string): HLSStreamProgress {
  let bitrate = 'N/A'
  let total_size = 'N/A'
  let out_time_us = 'N/A'
  let out_time_ms = 'N/A'
  let out_time = 'N/A'
  let speed = '0.0x'
  let progress: 'continue' | 'end' = 'continue'

  data.split('\n').forEach((line) => {
    const splitPoint = line.indexOf('=')
    if (splitPoint !== -1) {
      const key = line.slice(0, splitPoint)
      const value = line.slice(splitPoint + 1)
      switch (key) {
        case 'bitrate':
          bitrate = value
          break
        case 'total_size':
          total_size = value
          break
        case 'out_time_us':
          out_time_us = value
          break
        case 'out_time_ms':
          out_time_ms = value
          break
        case 'out_time':
          out_time = value
          break
        case 'speed':
          speed = value
          break
        case 'progress':
          progress = value as 'continue' | 'end'
          break
      }
    }
  })

  return {
    bitrate,
    total_size,
    out_time_us,
    out_time_ms,
    out_time,
    speed,
    progress,
  }
}
