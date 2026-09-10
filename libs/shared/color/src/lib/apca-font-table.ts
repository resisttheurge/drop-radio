/**
 * Font size representing contrast too low for any use
 */
export const NA = 999

/**
 * Font size representing contrast too low for textual use
 */
export const NT = 777

export type FontSizeArray = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
]

/**
 * Table of minimum font sizes to be used for specific APCA contrast values.
 *
 * Columns are arranged by acending font weight, with `x = weight / 100 - 1`
 *
 * Rows are arranged by ascending APCA Lc (contrast) value, with `y = |Lc| / 5`
 *
 * Font sizes `> 120` represent font weight and contrast pairs which should not
 * be used for text. See {@link NT} and {@link NA} for details
 */
export const fontSizes = [
  [NA, NA, NA, NA, NA, NA, NA, NA, NA],
  [NA, NA, NA, NA, NA, NA, NA, NA, NA],
  [NA, NA, NA, NA, NA, NA, NA, NA, NA],
  [NT, NT, NT, NT, NT, NT, NT, NT, NT],
  [NT, NT, NT, NT, NT, NT, NT, NT, NT],
  [NT, NT, NT, 120, 120, 108, 96, 96, 96],
  [NT, NT, 120, 108, 108, 96, 72, 72, 72],
  [NT, 120, 108, 96, 72, 60, 48, 48, 48],
  [120, 108, 96, 60, 48, 42, 32, 32, 32],
  [108, 96, 72, 42, 32, 28, 24, 24, 24],
  [96, 72, 60, 32, 28, 24, 21, 21, 21],
  [80, 60, 48, 28, 24, 21, 18, 18, 18],
  [72, 48, 42, 24, 21, 18, 16, 16, 18],
  [68, 46, 32, 21.75, 19, 17, 15, 16, 18],
  [64, 44, 28, 19.5, 18, 16, 14.5, 16, 18],
  [60, 42, 24, 18, 16, 15, 14, 16, 18],
  [56, 38.25, 23, 17.25, 15.81, 14.81, 14, 16, 18],
  [52, 34.5, 22, 16.5, 15.625, 14.625, 14, 16, 18],
  [48, 32, 21, 16, 15.5, 14.5, 14, 16, 18],
  [45, 28, 19.5, 15.5, 15, 14, 13.5, 16, 18],
  [42, 26.5, 18.5, 15, 14.5, 13.5, 13, 16, 18],
  [39, 25, 18, 14.5, 14, 13, 12, 16, 18],
  [36, 24, 18, 14, 13, 12, 11, 16, 18],
  [34.5, 22.5, 17.25, 12.5, 11.875, 11.25, 10.625, 14.5, 16.5],
  [33, 21, 16.5, 11, 10.75, 10.5, 10.25, 13, 15],
  [32, 20, 16, 10, 10, 10, 10, 12, 14],
] as const

export const fontDeltas = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 12, 12, 12, 24, 24, 24],
  [0, 0, 12, 12, 36, 36, 24, 24, 24],
  [0, 12, 12, 36, 24, 18, 16, 16, 16],
  [12, 12, 24, 18, 16, 14, 8, 8, 8],
  [12, 24, 12, 10, 4, 4, 3, 3, 3],
  [16, 12, 12, 4, 4, 3, 3, 3, 3],
  [8, 12, 6, 4, 3, 3, 2, 2, 0],
  [4, 2, 10, 2.25, 2, 1, 1, 0, 0],
  [4, 2, 4, 2.25, 1, 1, 0.5, 0, 0],
  [4, 2, 4, 1.5, 2, 1, 0.5, 0, 0],
  [4, 3.75, 1, 0.75, 0.188, 0.188, 0, 0, 0],
  [4, 3.75, 1, 0.75, 0.188, 0.188, 0, 0, 0],
  [4, 2.5, 1, 0.5, 0.125, 0.125, 0, 0, 0],
  [3, 4, 1.5, 0.5, 0.5, 0.5, 0.5, 0, 0],
  [3, 1.5, 1, 0.5, 0.5, 0.5, 0.5, 0, 0],
  [3, 1.5, 0.5, 0.5, 0.5, 0.5, 1, 0, 0],
  [3, 1, 0, 0.5, 1, 1, 1, 0, 0],
  [1.5, 1.5, 0.75, 1.5, 1.125, 0.75, 0.375, 1.5, 1.5],
  [1.5, 1.5, 0.75, 1.5, 1.125, 0.75, 0.375, 1.5, 1.5],
  [1, 1, 0.5, 1, 0.75, 0.5, 0.25, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
] as const

/**
 * Calculates
 * @param contrast
 * @returns
 */
export function contrastToFontSizeArray(contrast: number): FontSizeArray {
  const stepContrast = Math.min(125, Math.abs(contrast)) * 0.2
  const index = stepContrast | 0
  const adjustment = stepContrast - index
  return fontSizes[index].map(
    (fontSize, i) => fontSize + adjustment * fontDeltas[index][i]
  ) as FontSizeArray
}

export type FontWeight =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 'thin'
  | 'ultralight'
  | 'light'
  | 'medium'
  | 'regular'
  | 'semibold'
  | 'condensedBold'
  | 'condensed'
  | 'heavy'
  | 'black'

export function fontWeightToNumber(weight: FontWeight): number {
  switch (weight) {
    case 'normal':
    case 'regular':
    case '400':
      return 400
    case 'bold':
    case '700':
      return 700
    case 'thin':
    case '100':
      return 100
    case 'ultralight':
    case '200':
      return 200
    case 'light':
    case '300':
      return 300
    case 'medium':
    case '500':
      return 500
    case 'semibold':
    case '600':
      return 600
    case 'condensedBold':
    case 'condensed':
    case '800':
      return 800
    case 'heavy':
    case 'black':
    case '900':
      return 900
    default:
      return weight
  }
}

export function fontWeightToSize(
  weight: FontWeight,
  fontSizes: FontSizeArray
): number {
  return fontSizes[fontWeightToNumber(weight) / 100 - 1]
}
