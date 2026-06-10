import chroma from 'chroma-js'
import { ColorTheme } from './color-theme'

export const dark = true
export const type = 'error'
export const shadow = chroma('#270000')
export const form = chroma('#582621')
export const shine = chroma('#8d524c')
export const border = chroma('#c4827c')
export const focus = chroma('#ffb4af')
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
