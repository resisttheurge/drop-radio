export type OptionValue<T extends string | boolean | number> = T | NumericOption

export enum SIRank {
  K, M, G
}

export type SIPrefix = SIRank | `${keyof typeof SIRank}i`

export type NumericOption =
  | `${number}`
  | `${number}B`
  | `${number}${SIPrefix}`
  | `${number}${SIPrefix}B`

export type 