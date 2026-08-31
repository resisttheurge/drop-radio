import { findBestContrastForFontSizeAndWeight } from '@drop-radio/color'
import chroma from 'chroma-js'
import { StyleSheet, Text, View } from 'react-native'

export default function ColorChip({
  color,
  textCandidates = [color],
}: {
  color: chroma.Color
  textCandidates?: chroma.Color[]
}) {
  const name = color.name()
  const text = textStyles(color, textCandidates)
  return (
    <View style={[styles.colorChip, { backgroundColor: color.css() }]}>
      <Text style={[styles.text, text.normal]}>{text.normal.color}</Text>
      <Text style={[styles.text, text.bold]}>{name}</Text>
      <Text style={[styles.text, text.small]}>
        [
        {color
          .oklch()
          .map((n) => n.toFixed(2))
          .join(', ')}
        ]
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  colorChip: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  text: {},
})

function textStyles(color: chroma.Color, textCandidates: chroma.Color[]) {
  const normalColor = findBestContrastForFontSizeAndWeight(
    color,
    textCandidates,
    27,
    600
  )
  const boldColor = findBestContrastForFontSizeAndWeight(
    color,
    textCandidates,
    56,
    900
  )
  const smallColor = findBestContrastForFontSizeAndWeight(
    color,
    textCandidates,
    36,
    100
  )
  return StyleSheet.create({
    normal: {
      ...normalColor,
    },
    bold: {
      ...boldColor,
    },
    small: {
      fontStyle: 'italic',
      ...smallColor,
    },
  })
}
