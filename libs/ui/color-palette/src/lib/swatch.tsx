import chroma from 'chroma-js'
import { StyleSheet, View } from 'react-native'

import { black, white } from '@drop-radio/color'

import ColorChip from './chip'

export interface ColorSwatchProps {
  scale: chroma.Scale
  count: number
  textCandidates?: chroma.Color[]
  mode?: chroma.InterpolationMode
}

export default function ColorSwatch({
  scale,
  count,
  mode = 'oklch',
  textCandidates = chroma
    .scale([black, ...scale.mode(mode).colors(count, null), white])
    .mode(mode)
    .padding(0.2)
    .colors(count * 2 + 3, null),
}: ColorSwatchProps) {
  const colors = scale.mode(mode).colors(count, null)
  const chips = colors.map((color, i) => (
    <ColorChip key={i} color={color} textCandidates={textCandidates} />
  ))
  return <View style={[styles.row]}>{chips}</View>
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
})
