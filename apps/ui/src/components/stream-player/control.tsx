import { AudioPlayer } from 'expo-audio'
import { View } from 'react-native'

export interface ControlProps {
  player: AudioPlayer
}

export default function Control({ player }: ControlProps) {
  return <View></View>
}
