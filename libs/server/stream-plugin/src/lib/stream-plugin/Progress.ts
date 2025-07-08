import { Playlist } from './Playlist'

export interface Progress {
  readonly loop: number
  readonly index: number
  readonly entryOffset: number
  readonly playlistOffset: number
  readonly playlist: Playlist
}
