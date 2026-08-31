import { ColorTheme, NeutralDarkTheme } from '@/constants'
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient'
import { useMemo } from 'react'
import { StyleSheet, ViewProps } from 'react-native'
import Animated, {
  AnimatedProps,
  createAnimatedComponent,
} from 'react-native-reanimated'

export const AnimatedLinearGradient = createAnimatedComponent(LinearGradient)

export type Curvature = 'flat' | 'convex' | 'concave'

export type NeuProps = (
  | AnimatedProps<ViewProps>
  | AnimatedProps<LinearGradientProps>
) & {
  theme?: ColorTheme
  angle?: number
  intensity?: number
  curvature?: Curvature
  extrude?: boolean
  slant?: boolean
  active?: boolean
  focus?: boolean
}

export default function Neu({
  theme = NeutralDarkTheme,
  angle = (3 * Math.PI) / 4,
  intensity = 8,
  curvature = 'convex',
  extrude = false,
  slant = false,
  active = false,
  focus = false,
  style: passedStyle,
  ...viewProps
}: NeuProps) {
  const [start, end] = useMemo(() => {
    const [x, y] = [Math.cos(angle), Math.sin(angle)]
    return [
      { x, y },
      { x: -x, y: -y },
    ]
  }, [angle])
  const backgroundColor = useMemo(
    () =>
      active && focus
        ? theme.focus
        : active || focus
        ? theme.border
        : theme.form,
    [active, focus, theme]
  )
  const styles = useNeuStyles(
    theme,
    start,
    end,
    backgroundColor,
    intensity,
    curvature,
    extrude
  )
  if (!slant) {
    return (
      <Animated.View
        style={[styles.container, styles.shadows, passedStyle]}
        {...viewProps}
      />
    )
  } else {
    const colors =
      curvature === 'convex'
        ? ([
            theme.shine.css(),
            backgroundColor.css(),
            theme.shadow.css(),
          ] as const)
        : curvature === 'concave'
        ? ([
            theme.shadow.css(),
            backgroundColor.css(),
            theme.shine.css(),
          ] as const)
        : ([theme.shine.css(), backgroundColor.css()] as const)
    return (
      <AnimatedLinearGradient
        style={[styles.container, styles.shadows, passedStyle]}
        colors={colors}
        start={start}
        end={end}
        {...viewProps}
      />
    )
  }
}

export interface BoxShadowProps {
  offset: { x: number; y: number } | [number, number] | number
  color: chroma.Color
  inset?: boolean
  blur?: number
}

export function boxShadow({
  offset,
  color,
  inset = false,
  blur = 0,
}: BoxShadowProps) {
  const { x, y } =
    typeof offset === 'number'
      ? { x: offset, y: offset }
      : Array.isArray(offset)
      ? { x: offset[0], y: offset[1] }
      : offset
  let result = `${x}px ${y}px`
  if (blur !== 0) {
    result = `${result} ${blur}px`
  }
  if (inset) {
    result = `inset ${result}`
  }
  return `${result} ${color.css()}`
}

export function boxShadows(...props: BoxShadowProps[]) {
  return props.map(boxShadow).join(',\n')
}

export function useNeuStyles(
  theme: ColorTheme,
  start: { x: number; y: number },
  end: { x: number; y: number },
  backgroundColor: chroma.Color,
  intensity: number,
  curvature: Curvature,
  extrude: boolean
) {
  const { container } = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: backgroundColor.css(),
          padding: intensity * 2,
          margin: intensity * 2,
          borderRadius: intensity * 2,
        },
      }),
    [backgroundColor, intensity]
  )
  const outerShadows: BoxShadowProps[] = useMemo(() => {
    if (extrude) {
      return [
        {
          offset: [end.x * intensity, end.y * intensity],
          blur: intensity * 2,
          color: theme.shadow,
        },
        {
          offset: [start.x * intensity, start.y * intensity],
          blur: intensity * 2,
          color: theme.shine,
        },
      ]
    } else {
      return []
    }
  }, [extrude, theme, start, end, intensity])
  const innerShadows: BoxShadowProps[] = useMemo(() => {
    if (curvature !== 'flat') {
      const [shadowPos, shinePos] =
        curvature === 'concave' ? [end, start] : [start, end]
      return [
        {
          offset: [shadowPos.x * intensity, shadowPos.y * intensity],
          blur: intensity * 2,
          color: theme.shadow,
          inset: true,
        },
        {
          offset: [shinePos.x * intensity, shinePos.y * intensity],
          blur: intensity * 2,
          color: theme.shine,
          inset: true,
        },
      ]
    } else {
      return []
    }
  }, [curvature, theme, start, end, intensity])
  const { shadows } = useMemo(
    () =>
      StyleSheet.create({
        shadows:
          outerShadows.length + innerShadows.length === 0
            ? {}
            : {
                boxShadow: boxShadows(...outerShadows, ...innerShadows),
              },
      }),
    [outerShadows, innerShadows]
  )
  return { container, shadows }
}
