import fs from 'node:fs/promises'

import { Playlist } from './Playlist'
import invariant from 'tiny-invariant'

export async function writePlaylistToFile(
  playlist: Playlist,
  filePath: string,
  seekTime?: number
): Promise<void> {
  let content = 'ffconcat version 1.0\n'
  const { index, entryOffset } = playlist.seek(seekTime ?? 0)
  for (let i = index; i < playlist.length; i++) {
    content += `file '${playlist.entries[i].filepath}'\n`
    if (i === index && entryOffset > 0) {
      content += `inpoint ${formatDuration(entryOffset)}\n`
      content += `duration ${formatDuration(
        playlist.entries[i].duration - entryOffset
      )}\n`
    } else {
      content += `duration ${formatDuration(playlist.entries[i].duration)}\n`
    }
  }
  await fs.writeFile(filePath, content)
}

export function formatDuration(duration: number): string {
  invariant(duration >= 0, 'Duration must be non-negative')
  invariant(Number.isInteger(duration), 'Duration must be an integer')
  const string = duration.toString().padStart(7, '0')
  return string.slice(0, -6) + '.' + string.slice(-6)
}
