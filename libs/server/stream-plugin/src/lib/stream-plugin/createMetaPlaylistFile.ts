import fs from 'node:fs/promises'

export async function createMetaPlaylistFile(
  metaPlaylistFile: string,
  playlistFile: string
): Promise<void> {
  const content =
    'ffconcat version 1.0\n' +
    `file '${playlistFile}'\noption safe 0\n`.repeat(2) +
    `file '${metaPlaylistFile}'\noption safe 0\n`
  await fs.writeFile(metaPlaylistFile, content)
}
