import { readFile } from "node:fs";

import { bindNodeCallback, filter, map, Observable } from "rxjs";

import { LibraryContent } from "./LibraryContent";
import { LibraryOptions } from "./LibraryOptions";
import Ajv from "ajv/dist/jtd";

const ajv = new Ajv()
const validate = ajv.compile<LibraryContent>(LibraryContent.schema.valueOf())
const parse = ajv.compileParser<LibraryContent>(LibraryContent.schema.valueOf())
const readFileRx = bindNodeCallback(readFile)

export function initLibrary(options: Required<LibraryOptions>) {
  return readFileRx(options.metadataFile).pipe(
    map((buffer) => parse(buffer.toString())),
    filter(content => validate(content))
  )
}