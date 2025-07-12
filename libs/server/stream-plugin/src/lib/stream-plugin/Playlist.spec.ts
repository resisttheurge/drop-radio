import { it, fc } from '@fast-check/jest'

import { Playlist, PlaylistEntry } from './Playlist'

describe('Playlist', () => {
  it.prop([arbPlaylist()])(
    'should calculate total duration correctly',
    (playlist) => {
      const totalDuration = playlist.entries.reduce(
        (total, entry) => total + entry.duration,
        0
      )
      expect(playlist.duration).toBe(totalDuration)
    }
  )

  it.prop([arbPlaylist(), fc.integer()])(
    'should seek to the correct entry and offset',
    (playlist, time) => {
      if (playlist.length === 0) {
        expect(() => playlist.seek(time)).toThrow(
          'Playlist must have entries to seek'
        )
      } else if (time < 0) {
        expect(() => playlist.seek(time)).toThrow(
          'Seek time must be non-negative'
        )
      } else {
        const result = playlist.seek(time)

        const playlistOffset = time % playlist.duration
        let index = 0
        let startTime = 0
        // naive search for the entry to test against more complex seek logic
        while (index < playlist.entries.length && startTime <= playlistOffset) {
          const endTime = startTime + playlist.entries[index].duration
          if (playlistOffset >= startTime && playlistOffset < endTime) {
            break
          } else {
            index++
            startTime = endTime
          }
        }
        expect(result.loop).toBe(Math.floor(time / playlist.duration))
        expect(result.index).toBe(index)
        expect(result.entryOffset).toBe(playlistOffset - startTime)
        expect(result.playlistOffset).toBe(playlistOffset)
      }
    }
  )
})

function arbPlaylist({ playlistEntry = arbPlaylistEntry() } = {}) {
  return fc.array(playlistEntry).map((entries) => new Playlist(entries))
}

function arbPlaylistEntry({
  title = fc.string(),
  filename = fc.string(),
  filepath = fc.string(),
  duration = fc.integer({ min: 0 }),
} = {}) {
  return fc.record<PlaylistEntry>({
    title,
    filename,
    filepath,
    duration,
  })
}
