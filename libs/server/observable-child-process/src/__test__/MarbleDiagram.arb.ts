import {
  anything,
  Arbitrary,
  array,
  boolean,
  constant,
  constantFrom,
  infiniteStream,
  integer,
  oneof,
  record,
  string,
  tuple,
} from 'fast-check'

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

type Alpha =
  | ('a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g')
  | ('h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n')
  | ('o' | 'p' | 'q' | 'r' | 's' | 't' | 'u')
  | ('v' | 'w' | 'x' | 'y' | 'z')
export type MarbleKey = `${Digit}` | Alpha | Uppercase<Alpha>

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

const ALPHAS = [
  ...['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  ...['h', 'i', 'j', 'k', 'l', 'm', 'n'],
  ...['o', 'p', 'q', 'r', 's', 't', 'u'],
  ...['v', 'w', 'x', 'y', 'z'],
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ...['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ...['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ...['V', 'W', 'X', 'Y', 'Z'],
] as const

export const MARBLE_KEYS = [...DIGITS, ...ALPHAS] as const

export function isMarbleKey(key: string): key is MarbleKey {
  return MARBLE_KEYS.includes(key as MarbleKey)
}

export const MarbleKey = {
  all: MARBLE_KEYS,
  is: isMarbleKey,
}

export type MarbleMap<T = string> = { [key in MarbleKey]?: T }

export interface MarbleTimelineConstraints {
  eventKeys?: MarbleKey[]
  allowSimultaneous?: boolean
  minDelay?: number
  maxDelay?: number
  endInError?: boolean
}

export function arbMarbleTimeline({
  eventKeys = [...MARBLE_KEYS],
  allowSimultaneous = true,
  minDelay = 1,
  maxDelay = 100,
  endInError,
}: MarbleTimelineConstraints = {}): Arbitrary<string> {
  const dash = constant('-')
  const delay = integer({ min: minDelay, max: maxDelay }).map((n) => ` ${n}ms `)
  const marble = constantFrom(...eventKeys)
  const units = [dash, delay, marble]
  if (allowSimultaneous) {
    units.push(
      array(marble, { minLength: 2 }).map((marbles) => `(${marbles.join('')})`)
    )
  }
  return tuple(
    string({ unit: oneof(...units) }),
    endInError === undefined ? boolean() : constant(endInError)
  ).map(([timeline, error]) => {
    return timeline + (error ? '#' : '|')
  })
}

export function getTimelineKeys(timeline: string): MarbleKey[] {
  const matches = new Set(
    (function* () {
      for (const match of timeline.matchAll(
        /(?: [0-9]+ms )|(?<marble>[0-9a-zA-Z])/g
      )) {
        if (match.groups?.marble !== undefined) {
          yield match.groups.marble
        }
      }
    })()
  )
  return MARBLE_KEYS.filter((k) => matches.has(k))
}

export interface MarbleDiagram<T = MarbleKey> {
  readonly timeline: string
  readonly values?: MarbleMap<T>
  readonly error?: Error
}

export interface MarbleDiagramConstraints<T = MarbleKey> {
  marble?: Arbitrary<T>
  endInError?: boolean
  error?: Arbitrary<Error>
}

export function arbMarbleDiagram<T = MarbleKey>(
  constraints?: MarbleDiagramConstraints<T>
): Arbitrary<MarbleDiagram<T>>
export function arbMarbleDiagram({
  marble,
  endInError,
  error = tuple(string(), anything()).map(
    ([msg, cause]) => new Error(msg, { cause })
  ),
}: MarbleDiagramConstraints = {}): Arbitrary<MarbleDiagram> {
  const requiredKeys: ('timeline' | 'valueStream' | 'error')[] = ['timeline']
  if (marble !== undefined) requiredKeys.push('valueStream')
  if (endInError === true) requiredKeys.push('error')
  return record(
    {
      timeline: arbMarbleTimeline({ endInError }),
      ...(marble !== undefined ? { valueStream: infiniteStream(marble) } : {}),
      ...(endInError === true ? { error } : {}),
    },
    { requiredKeys }
  ).map(({ timeline, valueStream, error }) => {
    if (valueStream === undefined) {
      return { timeline, error }
    } else {
      const keys = getTimelineKeys(timeline)
      const values = Object.fromEntries(
        keys.map((k) => [k, valueStream.next().value])
      )
      return { timeline, values, error }
    }
  })
}

export default arbMarbleDiagram
