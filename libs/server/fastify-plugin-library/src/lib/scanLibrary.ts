import { glob } from 'node:fs/promises'
import { extname, dirname, basename } from 'node:path'

import { from, map, mergeMap, Observable, OperatorFunction, partition, scan } from 'rxjs'

import { LibraryContent } from './LibraryContent'
import { LibraryOptions } from './LibraryOptions'
import { ffprobeFormat } from '@drop-radio/ffmpeg'

export function scanLibrary(options: Required<LibraryOptions>, current: LibraryContent = {}): OperatorFunction<string, LibraryContent> {
  return (paths: Observable<string>) => {
    const [known, unknown] = partition(paths, path => Object.keys(current).includes(path))
    const oldFiles = known.pipe(map(fqn => current[fqn]))
    const newFiles = unknown.pipe(mergeMap(fqn => ffprobeFormat(fqn).then(result => [fqn, result])))
  }
}
