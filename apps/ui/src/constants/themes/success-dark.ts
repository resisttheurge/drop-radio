import chroma from 'chroma-js'
import { ColorTheme } from './color-theme'

export const dark = true
export const type = 'success'
export const shadow = chroma('#080801')
export const form = chroma('#333324')
export const shine = chroma('#646455')
export const border = chroma('#9b9b8a')
export const focus = chroma('#d6d6c4')
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
} as ColorTheme
