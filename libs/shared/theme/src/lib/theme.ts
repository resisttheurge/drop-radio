import chroma from 'chroma-js'

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
