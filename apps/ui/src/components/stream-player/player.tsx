import useStream from '@/hooks/useStream'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Neu from '../neu'
import Control from './control'
import { Status } from './status'

export default function StreamPlayer() {
  const [lightAngle, setLightAngle] = useState(0.66 * Math.PI)
  const [controlsActive, setControlsActive] = useState(false)
  const [lastUserInteraction, setLastUserInteraction] = useState(Date.now())
  useEffect(() => {
    if (controlsActive) {
      const timeout = setTimeout(() => {
        setControlsActive(false)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [controlsActive, lastUserInteraction])

  const [audioPlayer, audioStatus] = useStream(
    'https://server.dropradio.org/stream/live.m3u8'
  )

  const status: Status = useMemo(() => {
    if (audioStatus.playing) {
      return 'playing'
    }
    if (!audioStatus.isBuffering && audioStatus.isLoaded) {
      return 'paused'
    }
    return 'waiting'
  }, [audioStatus.playing, audioStatus.isBuffering, audioStatus.isLoaded])

  const video = require('../../../assets/movies/the-move.mp4')
  const videoPlayer = useVideoPlayer(video, (player) => {
    player.volume = 0
    player.loop = true
    player.play()
  })

  const togglePlay = useCallback(() => {
    if (audioStatus.playing) {
      audioPlayer.pause()
    } else {
      audioPlayer.play()
      videoPlayer.play()
    }
  }, [audioPlayer, audioStatus, videoPlayer])

  return (
    <Neu angle={lightAngle} intensity={2} style={styles.container} slant>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          console.log('Press')
          setControlsActive(!controlsActive)
          setLastUserInteraction(Date.now())
        }}
        onHoverIn={() => {
          console.log('HoverIn')
          setControlsActive(true)
          setLastUserInteraction(Date.now())
        }}
        onPointerMove={(event) => {
          console.log('PointerMove')
          setControlsActive(true)
          setLastUserInteraction(Date.now())
        }}
      >
        <VideoView
          style={styles.video}
          player={videoPlayer}
          nativeControls={false}
          contentFit="cover"
        />
      </Pressable>
      <View style={styles.control}>
        <Control
          lightAngle={lightAngle}
          status={status}
          active={controlsActive}
          onPress={togglePlay}
        />
      </View>
    </Neu>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    flex: 1,
    opacity: 0.85,
  },
  control: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  },
})
