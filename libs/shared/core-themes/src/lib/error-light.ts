import { Theme } from '@drop-radio/theme'
import chroma from 'chroma-js'

export const dark = false
export const type = 'error'
export const shadow = chroma('#8d524c')
export const form = chroma('#c4827c')
export const shine = chroma('#ffb4af')
export const border = chroma('#582621')
export const focus = chroma('#270000')
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
