import { omit  } from 'es-toolkit'
import { ObjectKeys } from 'es-toolkit/types'

import * as pkg from './index'
import * as rxProcess from './lib/rx-process/'
import * as spawnrx from './lib/spawnrx'

type MergedKeys<SubModules extends [...unknown[]]> = SubModules extends [infer M, ...infer Ms] ? ObjectKeys<M> | MergedKeys<Ms> : never
type ExpectedKeys = Array<MergedKeys<[typeof rxProcess, typeof spawnrx]>>

const expected: ExpectedKeys = Object.keys({...rxProcess, ...spawnrx}) as ExpectedKeys

describe('the @drop-radio/rx-process package', () => {
  it('should re-export all members of ./lib/rx-process/', () => {
    expect(pkg).toMatchObject(rxProcess)
  })
  it('should re-export all members of ./lib/spawnrx', () => {
    expect(pkg).toMatchObject(spawnrx)
  })
  it('should export no unexpected members', () => {
    const extraneous = omit(pkg, expected)
    expect(extraneous).toEqual({})
  })
})
