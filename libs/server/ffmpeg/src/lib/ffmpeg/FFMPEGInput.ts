export interface FFMPEGInputOptions {
  fmt?: string
}

export type FFMPEGInputOption<K extends keyof FFMPEGInputOptions = keyof FFMPEGInputOptions> =
  [K, FFMPEGInputOptions[K]]

export class FFMPEGInput {
  constructor(readonly source: string, readonly options: FFMPEGInputOptions = {}) {
  }
  
  toArgs(): string[]
}

export class FFMPEGInputBuilder {
  constructor(
    private _source: string,
    private _optList: Array<FFMPEGInputOptions | FFMPEGInputOption> = []
  ) {}

  source(src: string): this {
    this._source = src
    return this
  }

  option<K extends keyof FFMPEGInputOptions>(...opt: FFMPEGInputOption<K>): this {
    this._optList = this._optList.concat(opt)
    return this
  }

  options<Opts extends [...FFMPEGInputOption[]]>(...opts: Opts): this {
    this._optList = this._optList.concat(opts)
    return this
  }

  build(): FFMPEGInput {
    const options = this._optList.reduce(
      (rec: FFMPEGInputOptions, op) =>
        Object.assign(rec, Array.isArray(op) ? { [op[0]]: op[1] } : op),
      {}
    )
  }

}

export function input() {
  return new FFMPEGInputBuilder()
}