import { it } from '@fast-check/jest'

import defaultExport, { CommandOrThunk, resolve } from './CommandOrThunk'

import {
  arbCommandArray,
  arbCommandOrThunk,
  arbCommandString,
  arbThunk,
} from './CommandOrThunk.arb'

describe('the CommandOrThunk module', () => {
  it('should export the resolve function', () => {
    expect(resolve).toBeDefined()
    expect(typeof resolve).toBe('function')
  })

  describe('the resolve function', () => {
    // Scenarios:
    const givenValidCommandString = it.prop([arbCommandString()])
    const givenValidCommandArray = it.prop([arbCommandArray()])
    const givenValidThunk = it.prop([arbThunk()])

    // Properties:
    givenValidCommandString(
      'should return the command string split by whitespace',
      (command) => {
        const result = resolve(command)
        expect(result).toEqual(command.split(/\s+/g))
        expect(
          result.some(
            (part) =>
              part.includes(' ') ||
              part.includes('\n') ||
              part.includes('\t') ||
              part.includes('\r')
          )
        ).not.toBeTruthy()
      }
    )

    givenValidCommandArray(
      'should return the same array it was given',
      (command) => {
        expect(resolve(command)).toEqual(command)
      }
    )

    givenValidThunk(
      'should resolve the thunk and then resolve its return value',
      (thunk) => {
        expect(resolve(thunk)).toEqual(resolve(thunk()))
      }
    )
  })

  it('should export the CommandOrThunk namespace', () => {
    expect(CommandOrThunk).toBeDefined()
    expect(typeof CommandOrThunk).toBe('object')
  })

  describe('the CommandOrThunk namespace', () => {
    const givenValidCommandOrThunk = it.prop([arbCommandOrThunk()])
    givenValidCommandOrThunk(
      'should include the resolve function',
      (commandOrThunk) => {
        expect(typeof CommandOrThunk.resolve).toBe('function')
        expect(CommandOrThunk.resolve(commandOrThunk)).toEqual(
          resolve(commandOrThunk)
        )
      }
    )
  })

  it('should export the CommandOrThunk namespace as default', () => {
    expect(defaultExport).toBe(CommandOrThunk)
  })
})
