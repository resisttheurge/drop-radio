import { RxProcess, spawnrx, SpawnRxOptions } from '@drop-radio/rx-process'

import { FFMPEGInput, FFMPEGInputBuilder } from './FFMPEGInput'
import { FFMPEGOutput, FFMPEGOutputBuilder } from './FFMPEGOutput'
import { FFMPEGOption, FFMPEGOptions, getFFMPEGArgs } from './FFMPEGOptions'
export class FFMPEGBuilder {
  constructor(
    private _optList: Array<FFMPEGOptions | FFMPEGOption> = [],
    private _inpList: Array<FFMPEGInput | FFMPEGInputBuilder> = [],
    private _outList: Array<FFMPEGOutput | FFMPEGOutputBuilder> = []
  ) {}

  option<K extends keyof FFMPEGOptions>(...opt: FFMPEGOption<K>): this {
    this._optList = this._optList.concat(opt)
    return this
  }

  options<Opts extends [...FFMPEGOption[]]>(...opts: Opts): this {
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
      this._outList = this._outList.concat(builder)
    } else {
      this._outList = this._outList.concat(out)
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
      (rec: FFMPEGOptions, op) =>
        Object.assign(rec, Array.isArray(op) ? { [op[0]]: op[1] } : op),
      {}
    )

    const inputArgs = this._inpList.flatMap((i) =>
      i instanceof FFMPEGInputBuilder ? i.build().toArgs() : i.toArgs()
    )

    const outputArgs = this._outList.flatMap((o) =>
      o instanceof FFMPEGOutputBuilder ? o.build().toArgs() : o.toArgs()
    )

    const args = [...getFFMPEGArgs(options), ...inputArgs, ...outputArgs]

    return spawnrx('ffmpeg', args, opt)
  }
}

export function ffmpeg() {
  return new FFMPEGBuilder()
}