import { useTheme } from '@react-navigation/native'
import { useLayoutEffect, useRef, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { bounce } from 'react-native-css-animations'
import Animated, { AnimatedStyle } from 'react-native-reanimated'
import FallingMan from './falling-man-logo'

export default function Loading() {
  const theme = useTheme()
  const viewRef = useRef<Animated.View>(null)
  const [style, setStyle] = useState({ width: 256, height: 256 })
  useLayoutEffect(() => {
    viewRef.current?.measure((x, y, width, height) => {
      const size = Math.min(width, height)
      setStyle({ width: size / 2, height: size / 2 })
    })
  }, [])
  return (
    <Animated.View
      ref={viewRef}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={[bounce as StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>]}
      >
        <FallingMan theme={theme} style={[style]} />
      </Animated.View>
    </Animated.View>
  )
}
