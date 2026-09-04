import chroma from 'chroma-js'

import { findBestContrastAPCA } from '@drop-radio/color'

export interface Theme {
  dark: boolean
  type: 'neutral' | 'success' | 'warning' | 'error'
  shadow: chroma.Color
  form: chroma.Color
  shine: chroma.Color
  border: chroma.Color
  focus: chroma.Color
  textCandidates: chroma.Color[]
}

export function defaultTextAndBackground(theme: Theme): {
  text: chroma.Color
  background: chroma.Color
} {
  const text = textForBackground(theme, theme.form)
  return { text, background: theme.form }
}

export function textForBackground(
  theme: Theme,
  background: chroma.Color = theme.form
): chroma.Color {
  return findBestContrastAPCA(background, theme.textCandidates)
}
