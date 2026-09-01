import useStream from '@/hooks/useStream'
import { useVideoPlayer, VideoView } from 'expo-video'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import invariant from 'tiny-invariant'
import Neu from '../neu'
import Control from './control'
import { Status } from './status'

function calcAngle(x: number, y: number, center: { x: number; y: number }) {
  const dx = x - center.x
  const dy = y - center.y
  return Math.atan2(dy, dx)
}

export default function StreamPlayer() {
  const [lightAngle, setLightAngle] = useState(0.66 * Math.PI)
  const [center, setCenter] = useState({ x: 0, y: 0 })
  const pressableRef = useRef<View>(null)

  useLayoutEffect(() => {
    pressableRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setCenter({ x: pageX + width / 2, y: pageY + height / 2 })
    })
  }, [pressableRef])

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
  invariant(
    process.env.EXPO_PUBLIC_STREAM_URL,
    'EXPO_PUBLIC_STREAM_URL is not defined'
  )
  const [audioPlayer, audioStatus] = useStream(
    process.env.EXPO_PUBLIC_STREAM_URL
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
    <Neu
      angle={lightAngle}
      intensity={1}
      style={styles.container}
      slant
      extrude
    >
      <Pressable
        ref={pressableRef}
        style={{ flex: 1 }}
        onPress={(event) => {
          setLightAngle(
            calcAngle(event.nativeEvent.pageX, event.nativeEvent.pageY, center)
          )
          setControlsActive(!controlsActive)
          setLastUserInteraction(Date.now())
        }}
        onHoverIn={(event) => {
          setLightAngle(
            calcAngle(event.nativeEvent.pageX, event.nativeEvent.pageY, center)
          )
          setControlsActive(true)
          setLastUserInteraction(Date.now())
        }}
        onPointerMove={(event) => {
          setLightAngle(
            calcAngle(event.nativeEvent.pageX, event.nativeEvent.pageY, center)
          )
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
          onPress={() => {
            if (controlsActive) {
              togglePlay()
            } else {
              setControlsActive(true)
            }
            setLastUserInteraction(Date.now())
          }}
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
