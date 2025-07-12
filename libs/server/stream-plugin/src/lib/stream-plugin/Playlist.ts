import invariant from 'tiny-invariant'

export interface PlaylistEntry {
  readonly title: string
  readonly filename: string
  readonly filepath: string
  readonly duration: number
}

export interface SeekResult {
  readonly index: number
  readonly loop: number
  readonly entryOffset: number
  readonly playlistOffset: number
}

export class Playlist {
  public readonly length: number
  public readonly duration: number

  private readonly startTimes: number[] = []
  private readonly endTimes: number[] = []

  constructor(public readonly entries: PlaylistEntry[]) {
    this.length = entries.length
    this.duration = 0
    if (entries.length > 0) {
      for (const entry of entries) {
        this.startTimes.push(this.duration)
        this.duration += entry.duration
        this.endTimes.push(this.duration)
      }
    }
  }

  seek(time: number): SeekResult {
    invariant(this.length, 'Playlist must have entries to seek')
    invariant(time >= 0, 'Seek time must be non-negative')
    const playlistOffset = time % this.duration
    const loop = Math.floor(time / this.duration)
    let [l, r] = [0, this.length - 1]
    while (l < r) {
      const shiftedRange = this.endTimes[r] - this.startTimes[l]
      const shiftedTime = playlistOffset - this.startTimes[l]
      const scaledTime = shiftedTime / shiftedRange
      const m = Math.floor(scaledTime * (r - l)) + l
      if (
        this.startTimes[m] <= playlistOffset &&
        this.endTimes[m] > playlistOffset
      ) {
        return {
          loop,
          playlistOffset,
          index: m,
          entryOffset: playlistOffset - this.startTimes[m],
        }
      } else if (this.startTimes[m] > playlistOffset) {
        r = m - 1
      } else {
        l = m + 1
      }
    }
    return {
      loop,
      playlistOffset,
      index: r,
      entryOffset: playlistOffset - this.startTimes[r],
    }
  }
}
