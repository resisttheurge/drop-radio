import chroma from 'chroma-js'
import { StyleSheet, View } from 'react-native'
import ColorSwatch from './swatch'

export interface ColorPaletteProps {
  size: number
  colors: chroma.Color[]
  shades: chroma.Color[]
}

export default function ColorPalette({
  size,
  colors,
  shades,
}: ColorPaletteProps) {
  const grays = shades.map((shade) =>
    shade.set('oklch.c', 0).set('oklch.h', NaN)
  )
  const colorSwatches = colors.map((color) =>
    grays.map((gray) => color.set('oklch.l', gray.get('oklch.l')))
  )
  return (
    <View style={[styles.container]}>
      <ColorSwatch scale={chroma.scale(grays).mode('oklch')} count={size} />
      {colorSwatches.map((swatch, i) => (
        <ColorSwatch
          key={i}
          scale={chroma.scale(swatch).mode('oklch')}
          count={size}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
