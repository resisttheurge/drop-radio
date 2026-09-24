import S, { ObjectSchema } from 'fluent-json-schema'
import { BehaviorSubject } from 'rxjs'

import { LibraryStatus } from "./LibraryStatus"
import { LibraryContent } from './LibraryContent'

export type LiveLibrary = BehaviorSubject<LiveLibrarySnapshot>

export interface LiveLibrarySnapshot {
  status: LibraryStatus
  content?: LibraryContent
  errorLog: Array<[number, unknown]>
}

export const schema: ObjectSchema<LiveLibrarySnapshot> = S.object()
  .id('https://schema.dropradio.info/library')
  .title('drop radio live library')
  .prop('status', S.string().enum(Object.values(LibraryStatus)))
  .prop('errorLog', S.array())
  .required(['status', 'errorLog'])