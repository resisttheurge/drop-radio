import { useTheme } from '@react-navigation/native'
import { Canvas } from '@shopify/react-native-skia'
import { AudioPlayer } from 'expo-audio'
import { useMemo } from 'react'
import { useSharedValue } from 'react-native-reanimated'
import { SpinningMan } from './visualizations'

export type VisualizationType = 'spinning-man'

export interface VisualizerProps {
  visualization?: VisualizationType
  audioPlayer?: AudioPlayer
}

export default function Visualizer({ visualization }: VisualizerProps = {}) {
  const theme = useTheme()
  const { colors } = theme
  const canvasSize = useSharedValue({ width: 0, height: 0 })

  const Viz = useMemo(() => {
    switch (visualization) {
      case 'spinning-man':
        return SpinningMan
      default:
        return SpinningMan
    }
  }, [visualization])

  return (
    <Canvas
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      onSize={canvasSize}
    >
      <Viz theme={theme} canvasSize={canvasSize} />
    </Canvas>
  )
}
