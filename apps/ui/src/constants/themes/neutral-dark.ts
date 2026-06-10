import chroma from 'chroma-js'
import { ColorTheme } from './color-theme'

export const dark = true
export const type = 'neutral'
export const shadow = chroma('#070707')
export const form = chroma('#313131')
export const shine = chroma('#636363')
export const border = chroma('#9a9a9a')
export const focus = chroma('#d4d4d4')
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
