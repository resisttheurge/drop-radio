import { map, OperatorFunction } from 'rxjs'

import { HLSStreamProgress } from '@drop-radio/ffmpeg'

import { Playlist } from './Playlist'
import { Progress } from './Progress'

export function convertPlaylistProgress(
  playlist: Playlist,
  offset = 0
): OperatorFunction<HLSStreamProgress, Progress> {
  return map(({ out_time_us }: HLSStreamProgress) => {
    const playhead = offset + Number.parseInt(out_time_us)
    return {
      playlist,
      ...playlist.seek(playhead),
    } as Progress
  })
}
