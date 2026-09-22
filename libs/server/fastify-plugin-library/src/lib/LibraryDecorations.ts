import { Observable } from 'rxjs'

import { LibraryContent } from './LibraryContent'
import { LibraryOptions } from './LibraryOptions'
import { LibraryStatus } from './LibraryStatus'

export interface LibraryDecorations {
  readonly options: LibraryOptions
  readonly status: Observable<LibraryStatus>
  readonly error: Observable<Error | undefined>
  readonly files: Observable<LibraryContent | undefined>
}
