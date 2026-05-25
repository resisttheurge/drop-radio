import { AudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { View } from 'react-native'

export interface StreamControlsProps {
  player: AudioPlayer
}

export default function StreamControls({ player }: StreamControlsProps) {
  const status = useAudioPlayerStatus(player)
  return <View></View>
}
