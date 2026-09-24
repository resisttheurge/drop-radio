import { Theme } from '@drop-radio/theme'
import chroma from 'chroma-js'

export const dark = true
export const type = 'warning'
export const shadow = chroma('#180000')
export const form = chroma('#4b271b')
export const shine = chroma('#825844')
export const border = chroma('#bb9071')
export const focus = chroma('#f6cba3')
export const textCandidates = chroma
  .scale(['black', shadow, form, shine, border, focus, 'white'])
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
