import { Theme } from '@drop-radio/theme'
import chroma from 'chroma-js'

export const dark = false
export const type = 'warning'
export const shadow = chroma('#825844')
export const form = chroma('#bb9071')
export const shine = chroma('#f6cba3')
export const border = chroma('#4b271b')
export const focus = chroma('#180000')
export const textCandidates = chroma
  .scale(['black', focus, border, shadow, form, shine, 'white'])
  .mode('oklch')
  .padding(0.2)
  .colors(13, null)

export default {
  dark,
  type,
  shadow,
  form,
  shine,
  border,
  focus,
  textCandidates,
} as Theme
