import { Slot } from 'expo-router'
import { SafeAreaView, StyleSheet } from 'react-native'
import TrackPlayer from 'react-native-track-player'

import playbackService from '../playbackService'

TrackPlayer.registerPlaybackService(() => playbackService)

export default function RootLayout() {
  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Slot />
    </SafeAreaView>
  )
}
