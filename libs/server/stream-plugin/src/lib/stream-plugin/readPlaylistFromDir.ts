import fs from 'node:fs/promises'
import { resolve } from 'node:path'

import { ffprobeFormat } from '@drop-radio/ffmpeg'

import { Playlist, PlaylistEntry } from './Playlist'

export async function readPlaylistFromDirectory(
  directory: string,
  fileExtension = 'wav'
): Promise<Playlist> {
  const entries = [] as PlaylistEntry[]
  const fileExtensionRegExp = new RegExp(`.${fileExtension}$`)
  for await (const file of fs.glob(`**/*.${fileExtension}`, {
    cwd: directory,
  })) {
    const path = resolve(directory, file)
    const { format } = await ffprobeFormat(path)
    entries.push({
      title: file.replace(fileExtensionRegExp, ''),
      filename: file,
      duration: Number.parseInt(format.duration.replace('.', '')),
      filepath: path,
    })
  }
  return new Playlist(entries)
}
