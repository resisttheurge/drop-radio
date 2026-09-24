import { Canvas } from '@shopify/react-native-skia'
import { useAudioPlayerStatus } from 'expo-audio'
import { useMemo } from 'react'
import { Pressable } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

import { useTheme } from '@drop-radio/theme-context'

import { SpinningMan } from '../visualizations'
import { VisualizerProps } from './props'

export function Visualizer({
  visualization = 'spinning-man',
  player,
}: VisualizerProps) {
  const theme = useTheme()
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
          backgroundColor: theme.form.css(),
        }}
        onSize={canvasSize}
      >
        <Viz player={player} theme={theme} canvasSize={canvasSize} />
      </Canvas>
    </Pressable>
  )
}

export default Visualizer
