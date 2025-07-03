This library exposes portions of the `ffmpeg` and `ffprobe` commandline tool interfaces to be used in operations on the backend.

## Would you like to use it?

This module is intended only for internal use within the `drop-radio` server codebase. If you are working on a module with the `scope:server` [tag](https://nx.dev/features/enforce-module-boundaries#tags), you may import the library and its functions:

```ts
import { ffprobeFormat, hlsStream } from '@drop-radio/ffmpeg'

const inputFile = 'path/to/media/file.wav'
const workingDir = 'stream/output/directory'

const {
  format: { filename, duration },
} = ffprobeFormat(inputFile)

const duration_us = Number.parseInt(duration.replace('.', ''))

const sub = hlsStream(inputFile, workingDir).subscribe({
  next({ out_time_us }) {
    const percent = ((100 * out_time_us) / duration_us).toFixed(2)
    console.log(`streaming ${filename} ... ${percent}% complete`)
  },
  error(err) {
    console.error(err)
    sub.unsubscribe()
  },
  complete() {
    console.log('done'!)
  },
})
```
