/* eslint-disable jsx-a11y/accessible-emoji */
import { useEffect, useRef, useState } from 'react'
import { Animated, Image, SafeAreaView, StyleSheet } from 'react-native'
import TrackPlayer from 'react-native-track-player'

import icon from '../../../../assets/favicon/dc-man-icon.png'

export const App = () => {
  const [ready, setReady] = useState(false)
  const rotation = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const setup = async () => {
      await TrackPlayer.setupPlayer()
      await TrackPlayer.add({
        url: 'http://server.drop-radio.info/stream/live.m3u8',
      })
      await TrackPlayer.play()
      setReady(true)
    }
    const result = setup()
    return () => {}
  }, [])
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image style={styles.dcMan} source={icon} />
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  dcMan: {
    width: 512,
    height: 512,
    transform: [{ rotate: '90deg' }],
  },
})

export default App
