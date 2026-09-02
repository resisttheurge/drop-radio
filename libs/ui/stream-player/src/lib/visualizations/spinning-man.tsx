import { Group, Path, Skia } from '@shopify/react-native-skia'
import { useAudioPlayerStatus, useAudioSampleListener } from 'expo-audio'
import { useEffect, useMemo } from 'react'
import {
  cancelAnimation,
  Easing,
  interpolate,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withDecay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { VisualizationProps } from './Visualization'

export interface FallingMenProps {
  count?: number
  fgColor?: string
  bgColor?: string
  scale?: number
  opacity?: number
  degrees?: number
}

export function FallingMen({
  count = 10,
  fgColor = 'black',
  bgColor = 'white',
  scale = 1.05,
  opacity = 0.75,
  degrees = 10,
}: FallingMenProps = {}) {
  const center = 1024
  return useMemo(
    () =>
      Array.from({ length: count - 1 })
        .map((_, i) => {
          const color = i % 2 === 0 ? fgColor : bgColor
          const scaleCoefficient = Math.pow(scale, i)
          const opacityCoefficient = Math.pow(opacity, i)
          const rotationCoefficient = Math.pow(1 + degrees / 360, i)

          const rotate = -2 * Math.PI * rotationCoefficient
          const offset = center - scaleCoefficient * center
          const matrix = Skia.Matrix()
            .translate(center, center)
            .rotate(rotate)
            .translate(-center, -center)
            .translate(offset, offset)
            .scale(scaleCoefficient)

          return (
            <Path
              path={
                'M754.86 1126.57c49.88 38.41 59.19 109.98 20.78 159.87s-109.98 59.19-159.87 20.78-59.19-109.98-20.78-159.87 109.98-59.19 159.87-20.78Zm-542.09 420.49c13.73-8.14 26.35-15.5 39.14-23.1 13.94-8.22 28.95-17.09 43.26-25.53 10.37-6.52 19.76-10.42 26.06-17.74 5.48-6.42 6.19-18.8-2.58-22.7-5.28-2.6-12.99-2.39-22.99-2.73-9.28-.24-19.01-.57-28.23-.81-11.35-.62-18.9.24-27.14-3.6-5.89-2.36-8.38-10.12-2.93-14.32 2.32-1.95 5.21-2.92 8.24-3.55 6.64-1.28 17.64-.74 26.87-.44 13.17.42 27.85.74 40.63 1.16 26.66 1.02 57.43 1.04 84.38 2.95 38.5-1.68 119.74-17.47 167.83-23.5 47.28-8.52 210.68-31.91 259.67-127.74 36.62-84.3 2.73-163.67-41.96-238.89-10.29-17.92-18-31.18-28.79-49.8-31.42-54.13-96.69-167.02-111.53-192.46-5.41-8.81-12.98-18.64-19.32-27.71-15.48-23.3-34.01-40.34-54.34-59.86-7.9-7.71-16.54-15.96-24.27-23.55-5.38-5.3-9.76-9.96-11.9-14.76-4.93-10.62 3.9-16.67 13.07-12.04 7.03 3.49 11.93 9.05 19.61 16.28 7.29 7.07 14.97 14.5 22.28 21.6 7.81 7.45 12.76 12.95 18.11 14.11 9.81 1.64 16.67-10.02 17.49-19.16.73-14.77-3.19-31.44-4.56-45.71-2.1-16.13-4.11-31.59-6.26-48.11-1.27-14.08-5.61-30.47-3.21-42.72 2.13-9.46 10.66-10.91 15.74-4.49 6.36 9.27 5.87 21.41 7.99 34.06 1.37 10.49 3.16 24.28 4.37 33.56.67 12.8 9.42 27 15.7 8.26 3.18-13.4 3.14-26.68 4.99-40.5 1.88-15.01 2.84-36.34 6.02-49.15 3.86-14.95 17.56-14.43 19.69-.43 1.23 8.83-.38 17.05-1.47 29.36-.96 9.35-1.96 19.15-2.91 28.36-1.11 10.79-1.77 17.27-2.75 26.8-.82 8.44-2.28 18.37-.63 26.6 2.63 11.24 10.18-5.79 11.22-9.5 3.83-11.69 5.98-18.98 10.41-32.84 4.86-14.39 10.06-34.57 15.7-46.93 6.4-13.94 20.22-11.84 19.66 2.84-.21 6.46-2.77 13.93-5.68 23.26-6.34 20.13-12.21 38.68-18.39 58.32-2.18 7.24-5.1 15.63-3.99 23.4.95 7.05 8.38 5.43 12.04 1.5 3.88-3.7 8.12-10.98 12.01-17.26 4.56-7.37 9.68-15.5 14.79-23.78 6.51-10.08 10.18-17.49 16.28-23.72 11.66-11.62 21.27-1.27 16.4 10.64-2.72 7.74-11.08 19.87-16.76 29.24-8.88 14.29-17.55 28.19-26.28 42.26-10.07 16.66-23.79 33.59-22.28 54.65-.02 5.29 1.43 10.27 4.26 14.73 19.99 34.55 79.83 137.85 109.24 188.27 23.19 39.11 68.98 114.52 96.57 160.4 14.47 23.11 44.75 75.88 74.69 96.3 33.38 18.88 73.83 28.66 115.29 26.03 25.2-2.06 55.1-3.29 73.43-21.85 3.12-3.21 6.05-6.45 6.66-10.43 9.25-33.07-34.47-183.46-70.78-290.91-18.25-53.78-121.85-358.82-139.6-410.8-12.51-36.91-10.17-89.27 19.32-108.08 32.7-19.72 67.18 2.21 89.75 39.43 4.58 7.17 10.45 20.72 12.92 27.09 53.75 160.7 153.34 447.07 203.58 598.67 4.89 13.1 6.09 22.08 13.54 33.04 33.24 48.28 75.87 43.9 104.52-8.74 77.7-137.45 227.09-415.97 312.37-563.61 22.14-33.7 64-62.68 97.26-44.48l.17.09c33.75 18.6 30.23 70.66 13.78 106.75-20.42 40.6-123.24 223.36-181.47 329.78-51.85 94.17-179.02 323.43-233.09 421.82-5.36 9.91-6.53 12.45-11.68 20.29-10.75 18.16-43.25 44.86-67.45 56.72-22 11.48-44.54 19.15-68.21 24.8-61.16 15.38-196.12 15.47-287.07 23.33-118.72.52-240.73 14.13-360.65 31.62-64.82 9.59-174.82 26.34-219.8 32.91-4.6.5-8.67 1.76-12.34 4.73-7.07 5.12-16.95 16.1-21.82 25.05-4.97 8.73-8.57 19.31-12.12 28.41-5.43 14.22-10.64 27.9-16.2 42.44-1.63 4.28-3.28 8.59-4.9 12.85-5.46 12.76-7 23.32-16.57 29.7-9.39 4.63-14.11-5.65-11.78-14.73 3.46-14.17 13.59-37.11 18.71-51.53 3.08-9.36 7.74-16.14 6.71-25.18-.71-3.96-3.94-4.24-7.47-1.64-7.61 5.44-12.96 14.07-18.7 21.18-10.15 13.19-19.93 25.88-30.57 39.7-7.53 9.33-11.5 16.33-19.82 20.75-3.04 1.52-6.88 1.86-9.67-.11-1.87-1.36-2.98-3.48-3.17-5.86-.27-2.96.52-5.93 1.78-8.7 2.71-5.98 7.76-12.13 13.76-20 7.56-9.81 16.16-20.98 23.51-30.54 5.75-7.47 11.28-14.65 17.01-22.09 4.61-6.24 9.23-11.4 10.55-18.37.37-2.64-1.76-3.44-4.08-2.46-10.66 4.37-24.39 22.3-33.16 30.54-12.97 13.51-25.91 26.98-39.1 40.72-9.4 9.25-16.28 18.88-26.23 22.69-3.19 1.09-6.87.94-9.38-1.35-2.51-2.35-2.91-6.03-1.96-9.33 3.41-10.03 10.38-14.99 19.33-24.87 14.76-15.37 29.24-30.45 43.83-45.64 7.13-8.06 49.67-47.44 12.4-27.91-19.18 11.01-36.89 21.72-56.04 32.95-11.07 5.56-33.05 23.82-42.37 13.09-6.28-12.03 11.39-19.99 23.81-27.74Z'
              }
              key={i}
              color={color}
              opacity={opacityCoefficient}
              matrix={matrix}
            />
          )
        })
        .reverse(),
    [fgColor, bgColor, count, scale, opacity, degrees, center]
  )
}

export function SpinningMan({ player, theme, canvasSize }: VisualizationProps) {
  const { colors } = theme
  const rpm = useSharedValue(0)
  const rotation = useSharedValue(0)
  const status = useAudioPlayerStatus(player)
  useAudioSampleListener(player, (sample) => {
    // Use sample.channels array for audio visualization
    console.log('Audio sample:', sample.channels[0].frames)
  })
  const slow = 33.33
  const fast = 666.6

  useEffect(() => {
    if (status.playing && player.volume > 0) {
      rpm.value = withSequence(
        withTiming(slow, {
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
        }),
        withRepeat(
          withTiming(fast, {
            duration: 0.5 * 60 * 1000,
            easing: Easing.inOut(Easing.bounce),
          }),
          -1,
          true
        )
      )
    } else {
      rotation.value = withDecay({
        velocity: rpm.value / 60,
      })
    }

    return () => {
      cancelAnimation(rpm)
      rpm.value = 0
    }
  }, [player.volume, status.playing, rpm, rotation])

  useFrameCallback(({ timeSincePreviousFrame }) => {
    'worklet'
    if (
      status.playing &&
      player.volume > 0 &&
      timeSincePreviousFrame !== null
    ) {
      rotation.value =
        (rotation.value + (rpm.value * timeSincePreviousFrame) / 1000 / 60) % 1
    }
  })

  const transform = useDerivedValue(() => {
    const { width, height } = canvasSize.value
    const size = Math.min(width, height)
    const scale = size / 2048
    const rad = interpolate(rotation.value, [0, 1], [0, Math.PI * 2])
    return [
      { translateX: width / 2 },
      { translateY: height / 2 },
      { rotate: rad },
      { scale: 0.9 + Math.sin(rad) * 0.1 },
      { translateX: -width / 2 },
      { translateY: -height / 2 },
      { translateX: (width - size) / 2 },
      { translateY: (height - size) / 2 },
      { scale },
    ]
  })

  return (
    <Group blendMode="src" transform={transform}>
      <FallingMen
        count={20}
        degrees={5}
        fgColor={colors.text}
        bgColor={colors.card}
      />
    </Group>
  )
}

export default SpinningMan
