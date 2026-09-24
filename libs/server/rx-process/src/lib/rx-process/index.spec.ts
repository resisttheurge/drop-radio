import { omit } from 'es-toolkit'
import { ObjectKeys } from 'es-toolkit/types'

import * as pkg from './index'

import * as fromProcess from './fromProcess'
import * as rxProcess from './RxProcess'
import * as rxProcessError from './RxProcessError'
import * as rxProcessMsg from './RxProcessMsg'
import * as rxProcessOptions from './RxProcessOptions'


type MergedKeys<SubModules extends [...unknown[]]> = SubModules extends [
  infer M,
  ...infer Ms
]
  ? ObjectKeys<M> | MergedKeys<Ms>
  : never
type ExpectedKeys = Array<MergedKeys<[typeof rxProcess, typeof rxProcessError]>>

const expected: ExpectedKeys = Object.keys({
  ...fromProcess,
  ...rxProcess,
  ...rxProcessError,
  ...rxProcessMsg,
  ...rxProcessOptions
}) as ExpectedKeys

describe('the lib/rx-process/index.ts module', () => {
  it('should re-export all members of fromProcess.ts', () => {
    expect(pkg).toMatchObject(fromProcess)
  })
  it('should re-export all members of RxProcess.ts', () => {
    expect(pkg).toMatchObject(rxProcess)
  })
  it('should re-export all members of RxProcessError.ts', () => {
    expect(pkg).toMatchObject(rxProcessError)
  })
  it('should re-export all members of RxProcessMsg.ts', () => {
    expect(pkg).toMatchObject(rxProcessMsg)
  })
  it('should re-export all members of RxProcessOptions.ts', () => {
    expect(pkg).toMatchObject(rxProcessOptions)
  })
  it('should export no unexpected members', () => {
    const extraneous = omit(pkg, expected)
    expect(extraneous).toEqual({})
  })
})
