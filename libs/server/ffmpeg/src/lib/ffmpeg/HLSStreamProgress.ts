/**
 * Represents the output of ffmpeg with the `-progress` option
 */
export interface HLSStreamProgress {
  readonly bitrate: string
  readonly total_size: string
  readonly out_time_us: string
  readonly out_time_ms: string
  readonly out_time: string
  readonly speed: string
  readonly progress: 'continue' | 'end'
}

export function parseHLSStreamProgress(data: string): HLSStreamProgress {
  let bitrate = 'N/A'
  let total_size = 'N/A'
  let out_time_us = '000000'
  let out_time_ms = '000000'
  let out_time = '00:00:00.000000'
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
