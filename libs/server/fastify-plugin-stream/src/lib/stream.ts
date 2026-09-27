import { FFMPEGProgress, parseFFMPEGProgress } from '@drop-radio/ffmpeg'
import { RxProcess, spawnrx } from '@drop-radio/rx-process'

export function stream(
  destination: string,
  source: string,
  stats_period: number = 0.5
): RxProcess<FFMPEGProgress> {
  return spawnrx(
      'ffmpeg',
      [
        ...[
          // global options
          '-hide_banner',
          '-nostats',
          '-progress',
          'pipe:1',
          '-stats_period',
          stats_period.toString()
        ],
        ...[
          // input args
          '-re',
          '-i',
          source,
        ],
        ...[
          // output args
          '-vcodec',
          'libx264',
          '-vprofile',
          'baseline',
          '-acodec',
          'aac',
          '-ar',
          '44100',
          '-ac',
          '1',
          '-f',
          'flv',
          destination,
        ],
      ],
      { stdout: parseFFMPEGProgress }
    )
}
