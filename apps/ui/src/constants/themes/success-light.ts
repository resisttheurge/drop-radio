import chroma from 'chroma-js'
import { ColorTheme } from './color-theme'

export const dark = false
export const type = 'success'
export const shadow = chroma('#646455')
export const form = chroma('#9b9b8a')
export const shine = chroma('#d6d6c4')
export const border = chroma('#333324')
export const focus = chroma('#080801')
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
} as ColorTheme
