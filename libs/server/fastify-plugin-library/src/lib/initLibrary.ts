import { readFile } from "node:fs";
import path from 'node:path'

import { Observable } from "rxjs";

import { LibraryContent } from "./LibraryContent";
import { LibraryOptions } from "./LibraryOptions";

export function initLibrary(options: Required<LibraryOptions>): Observable<LibraryContent | undefined> {
  const [ manifest, checksum, metadata ] = ['library.manifest', 'library.manifest.checksum', 'library.metadata.json'].map(f => path.resolve(options.cacheDir, f))
  return new Observable((subscriber) => {
    
  })
}