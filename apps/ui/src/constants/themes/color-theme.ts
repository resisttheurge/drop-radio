export interface ColorTheme {
  dark: boolean
  type: 'neutral' | 'success' | 'warning' | 'error'
  shadow: chroma.Color
  form: chroma.Color
  shine: chroma.Color
  border: chroma.Color
  focus: chroma.Color
  textCandidates: chroma.Color[]
}
