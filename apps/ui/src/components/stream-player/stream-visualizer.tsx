import { useTheme } from '@react-navigation/native'
import { Canvas } from '@shopify/react-native-skia'
import { AudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useMemo } from 'react'
import { Pressable } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { SpinningMan } from './visualizations'

export type VisualizationType = 'spinning-man'

export interface VisualizerProps {
  visualization?: VisualizationType
  player: AudioPlayer
}

export default function Visualizer({
  visualization = 'spinning-man',
  player,
}: VisualizerProps) {
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

  const status = useAudioPlayerStatus(player)

  return (
    <Pressable
      onPress={() => {
        if (status.playing) {
          if (player.volume === 0) {
            player.volume = 1
          } else {
            player.volume = 0
          }
        } else {
          player.play()
        }
      }}
      style={{ flex: 1 }}
    >
      <Canvas
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
        onSize={canvasSize}
      >
        <Viz player={player} theme={theme} canvasSize={canvasSize} />
      </Canvas>
    </Pressable>
  )
}
