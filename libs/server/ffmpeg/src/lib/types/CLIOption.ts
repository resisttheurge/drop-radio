export type CLIOption<T extends string | boolean | number> = T | NumericOption

export type SIRank = 'K' | 'M' | 'G'

export type SIPrefix = SIRank | `${SIRank}i`

export type NumericOption =
  | number
  | `${number}`
  | `${number}B`
  | `${number}${SIPrefix}`
  | `${number}${SIPrefix}B`