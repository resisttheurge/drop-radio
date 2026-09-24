import chroma from 'chroma-js'

export const white = chroma.oklch(1, 0, NaN)

export const black = chroma.oklch(0, 0, NaN)

/**
 * Equivalent of black with 87% opacity (#000000de) on a white (#fff) background, or
 * #070707 computed without opacity. Suitable for text on {@link light} backgrounds.
 */
export const dark = chroma.mix(white, black, 0.87, 'oklch')

/**
 * Equivalent of white with 87% opacity (#ffffffde) on a black (#000) background, or
 * #d4d4d4 without opacity. Suitable for text on {@link dark} backgrounds.
 */
export const light = chroma.mix(black, white, 0.87, 'oklch')

export const success = chroma('#767666')

export const warning = chroma('#926c46')

export const error = chroma('#b05452')
