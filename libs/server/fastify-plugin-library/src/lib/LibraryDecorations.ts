import { LibraryOptions } from './LibraryOptions'
import { LiveLibrary } from './LiveLibrary'

export interface LibraryDecorations {
  readonly options: LibraryOptions
  readonly live: LiveLibrary
}
