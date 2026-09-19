import { RxProcess, spawnrx, SpawnRxOptions } from '@drop-radio/rx-process'

import { Builder } from './Builder'
import { FFMPEGInput, FFMPEGInputBuilder } from './FFMPEGInput'
import { FFMPEGOutput, FFMPEGOutputBuilder } from './FFMPEGOutput'

export interface GlobalOptions
  extends Record<string | number | symbol, unknown> {
  stats?: boolean
}

function globalArgs(opts: GlobalOptions): string[] {
  return []
}

export type GlobalOption<K extends keyof GlobalOptions = keyof GlobalOptions> =
  [K, GlobalOptions[K]]

export class FFMPEGBuilder implements Builder<RxProcess> {
  constructor(
    private _optList: Array<GlobalOptions | GlobalOption> = [],
    private _inpList: Array<FFMPEGInput | FFMPEGInputBuilder> = [],
    private _outList: Array<FFMPEGOutput | FFMPEGOutputBuilder> = []
  ) {}

  option<K extends keyof GlobalOptions>(...opt: GlobalOption<K>): this {
    this._optList = this._optList.concat(opt)
    return this
  }

  options<Opts extends [...GlobalOption[]]>(...opts: Opts): this {
    this._optList = this._optList.concat(opts)
    return this
  }

  input(inp: FFMPEGInput | FFMPEGInputBuilder | ((b: FFMPEGInputBuilder) => void)): this {
    if (inp instanceof Function) {
      const builder = new FFMPEGInputBuilder()
      inp(builder)
      this._inpList = this._inpList.concat(builder)
    } else {
      this._inpList = this._inpList.concat(inp)
    }
    return this
  }

  inputs(...inps: FFMPEGInput[]): this {
    this._inpList = this._inpList.concat(inps)
    return this
  }

  output(out: FFMPEGOutput | FFMPEGOutputBuilder | ((b: FFMPEGOutputBuilder) => void)): this {
    if (out instanceof Function) {
      const builder = new FFMPEGOutputBuilder()
      out(builder)
      this._inpList = this._inpList.concat(builder)
    } else {
      this._inpList = this._inpList.concat(out)
    }
    return this
  }

  outputs(...outs: FFMPEGOutput[]): this {
    this._outList = this._outList.concat(outs)
    return this
  }

  clone() {
    return new FFMPEGBuilder(this._optList, this._inpList, this._outList)
  }

  build<Out = never, Err = never, Catch = never, Close = never>(
    opt: SpawnRxOptions<Out, Err, Catch, Close> = {}
  ): RxProcess<Out, Err, Catch, Close> {
    
    const options = this._optList.reduce(
      (rec: GlobalOptions, op) =>
        Object.assign(rec, Array.isArray(op) ? { [op[0]]: op[1] } : op),
      {}
    )

    const inputArgs = this._inpList.flatMap((i) =>
      i instanceof FFMPEGInputBuilder ? i.build().toArgs() : i.toArgs()
    )

    const outputArgs = this._outList.flatMap((o) =>
      o instanceof FFMPEGOutputBuilder ? o.build().toArgs() : o.toArgs()
    )

    const args = [...globalArgs(options), ...inputArgs, ...outputArgs]

    return spawnrx('ffmpeg', args, opt)
  }
}
