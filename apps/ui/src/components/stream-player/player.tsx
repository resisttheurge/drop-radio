import { useAudioPlayer } from 'expo-audio'
import { View } from 'react-native'
import Control from './control'
import Visualizer from './visualizer'

export default function StreamPlayer() {
  const player = useAudioPlayer(
    'https://server.test.drop-radio.info/stream/live.m3u8'
  )
  return (
    <View style={{ flex: 1 }}>
      <Visualizer visualization="spinning-man" player={player} />
      <Control player={player} />
    </View>
  )
}
