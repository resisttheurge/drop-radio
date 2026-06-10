import Neu from '@/components/neu'
import useColorTheme from '@/hooks/use-color-theme'
import { findBestContrastForFontSizeAndWeight } from '@/utils'
import Icon from '@expo/vector-icons/Ionicons'
import chroma from 'chroma-js'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'

const tau = 2 * Math.PI
const radiansPerSecond = tau / 360

export default function NeuTest() {
  const [angle, setAngle] = useState(
    ((Date.now() / 1000) * radiansPerSecond) % tau
  )
  useEffect(() => {
    const interval = setInterval(
      () => setAngle((a) => (a + radiansPerSecond) % tau),
      1000 / 30
    )
    return () => {
      clearInterval(interval)
    }
  }, [])
  const theme = useColorTheme()
  const icon = (
    <Icon
      name="radio"
      size={128}
      color={
        findBestContrastForFontSizeAndWeight(
          chroma.mix(theme.form, theme.form),
          theme.textCandidates,
          128,
          'bold'
        ).color
      }
    />
  )
  const [buttonState, setButtonState] = useState<'ready' | 'held' | 'released'>(
    'ready'
  )
  const props = useMemo(() => {
    switch (buttonState) {
      case 'ready':
        return { curvature: 'convex', slant: true }
      case 'held':
        return { curvature: 'concave', slant: false }
      case 'released':
        return { curvature: 'flat', slant: true }
    }
  }, [buttonState])

  useEffect(() => {
    if (buttonState === 'released') {
      const timeout = setTimeout(() => setButtonState('ready'), 1000)
      return () => clearTimeout(timeout)
    }
  }, [buttonState])
  return (
    <Neu theme={theme} angle={angle} intensity={4} style={styles.card} slant>
      <Pressable
        onPressIn={() => setButtonState('held')}
        onPressOut={() => setButtonState('released')}
      >
        <Neu
          theme={theme}
          angle={angle}
          intensity={8}
          style={styles.iconButton}
          extrude
          {...props}
        >
          {icon}
        </Neu>
      </Pressable>
    </Neu>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 192,
    height: 192,
    borderRadius: 128,
  },
})
