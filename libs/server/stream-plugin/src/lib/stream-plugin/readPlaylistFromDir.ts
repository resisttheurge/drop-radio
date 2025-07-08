import fs from 'node:fs/promises'
import path from 'node:path'

import { ffprobeFormat } from '@drop-radio/ffmpeg'

import { Playlist } from './Playlist'
import { PlaylistEntry } from './Playlist'

export async function readPlaylistFromDirectory(
  directory: string
): Promise<Playlist> {
  const files = await fs.readdir(directory, { withFileTypes: true })
  const entries = await Promise.all(
    files
      .filter((file) => file.isFile() && file.name.endsWith('.wav'))
      .map(async (file) => {
        const filepath = path.resolve(directory, file.name)
        const { format } = await ffprobeFormat(filepath)
        return {
          title: file.name.replace(/\.wav$/, ''),
          filename: file.name,
          duration: Number.parseInt(format.duration.replace('.', '')),
          filepath,
        } as PlaylistEntry
      })
  )
  return new Playlist(entries)
}
