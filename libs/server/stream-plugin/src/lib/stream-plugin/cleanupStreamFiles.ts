import { glob, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function cleanupStreamFiles(cwd: string): Promise<void> {
  const deletions = []
  for await (const file of glob('**/*.{m3u8,ts,txt}', { cwd })) {
    deletions.push(rm(resolve(cwd, file)))
  }
  await Promise.all(deletions)
}
