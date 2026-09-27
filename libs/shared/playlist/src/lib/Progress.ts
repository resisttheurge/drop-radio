import { Playlist } from './Playlist.js'

export interface Progress {
  readonly loop: number
  readonly index: number
  readonly entryOffset: number
  readonly playlistOffset: number
  readonly playlist: Playlist
}
