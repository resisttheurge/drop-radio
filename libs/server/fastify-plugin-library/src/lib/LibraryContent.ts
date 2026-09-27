import S from "fluent-json-schema";

import { LibraryFile } from "./LibraryFile";

export type LibraryContent = Record<string, LibraryFile>

export const schema = S.object<LibraryContent>()
  .id('https://schema.dropradio.info/library#content')
  .title('drop radio live library content')
  .propertyNames(S.string().format('uri-reference'))
  .patternProperties({
    '^/?[^/]+(/[^/]+)*$': LibraryFile.schema
  })
  .additionalProperties(false)

export const LibraryContent = {
  schema
}