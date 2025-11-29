import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Pressable, StyleSheet } from 'react-native'
import TrackPlayer, {
  Event,
  State,
  useTrackPlayerEvents,
} from 'react-native-track-player'

import icon from '../../../../assets/favicon/dc-man-icon.png'
import { useRotation } from '../hooks/useRotation'
import useTrackPlayer from '../hooks/useTrackPlayer'

export enum StreamPlayerState {
  Init = 'init',
  Error = 'error',
  Loading = 'loading',
  Playing = 'playing',
  Paused = 'paused',
}

/* eslint-disable-next-line */
export interface StreamPlayerProps {
  streamUrl?: string
}

export function StreamPlayer({
  streamUrl = 'https://server.drop-radio.info/stream/live.m3u8',
}: StreamPlayerProps = {}) {
  const [trackPlayerState, setTrackPlayerState] = useState(State.None)
  const { error, initialized } = useTrackPlayer({
    url: streamUrl,
  })

  useTrackPlayerEvents([Event.PlaybackState], (event) =>
    setTrackPlayerState(event.state)
  )

  const streamPlayerState = useMemo(() => {
    if (trackPlayerState === State.Error) {
      return StreamPlayerState.Error
    } else if (!initialized) {
      return StreamPlayerState.Init
    } else if (trackPlayerState === State.Playing) {
      return StreamPlayerState.Playing
    } else if (
      trackPlayerState === State.Paused ||
      trackPlayerState === State.Stopped ||
      trackPlayerState === State.Ready
    ) {
      return StreamPlayerState.Paused
    } else {
      return StreamPlayerState.Loading
    }
  }, [initialized, trackPlayerState])

  const { rpm, rotation } = useRotation()
  const opacity = useRef(new Animated.Value(1)).current
  const scale = useRef(new Animated.Value(1)).current
  const translation = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const backgroundColor = useRef(new Animated.Value(0)).current

  const onPressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(opacity, {
        toValue: 0.8,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, scale])

  const onPress = useCallback(() => {
    switch (streamPlayerState) {
      case StreamPlayerState.Paused:
        TrackPlayer.play()
        break
      case StreamPlayerState.Playing:
        TrackPlayer.pause()
        break
    }
  }, [streamPlayerState])

  const onLongPress = useCallback(() => {
    TrackPlayer.setVolume(0)
  }, [])

  const onPressOut = useCallback(() => {
    TrackPlayer.setVolume(1)
    Animated.parallel([
      Animated.spring(opacity, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, scale])

  const resetRpmAnim = useMemo(
    () =>
      Animated.timing(rpm, {
        toValue: 0,
        easing: Easing.out(Easing.exp),
        duration: 333.3,
        useNativeDriver: true,
      }),
    [rpm]
  )

  const resetOpacityAnim = useMemo(
    () =>
      Animated.timing(opacity, {
        toValue: 1,
        easing: Easing.out(Easing.exp),
        duration: 333.3,
        useNativeDriver: true,
      }),
    [opacity]
  )

  const resetScaleAnim = useMemo(
    () =>
      Animated.timing(scale, {
        toValue: 1,
        easing: Easing.out(Easing.exp),
        duration: 333.3,
        useNativeDriver: true,
      }),
    [scale]
  )

  const resetBackgroundColorAnim = useMemo(
    () =>
      Animated.timing(backgroundColor, {
        toValue: 0,
        easing: Easing.out(Easing.exp),
        duration: 333.3,
        useNativeDriver: false,
      }),
    [backgroundColor]
  )

  const resetAllAnim = useMemo(
    () =>
      Animated.parallel([
        resetRpmAnim,
        resetOpacityAnim,
        resetScaleAnim,
        resetBackgroundColorAnim,
      ]),
    [resetRpmAnim, resetOpacityAnim, resetScaleAnim, resetBackgroundColorAnim]
  )

  const playAnimation = useMemo(
    () =>
      Animated.parallel([
        resetOpacityAnim,
        resetScaleAnim,
        resetBackgroundColorAnim,
        Animated.sequence([
          Animated.timing(rpm, {
            toValue: 33.33,
            duration: 333.3,
            easing: Easing.in(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(rpm, {
                toValue: 33.33,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(rpm, {
                toValue: 444.4,
                easing: Easing.inOut(Easing.bounce),
                duration: 1111000,
                useNativeDriver: true,
              }),
              Animated.timing(rpm, {
                toValue: 33.33,
                easing: Easing.inOut(Easing.bounce),
                duration: 1111000,
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
      ]),
    [resetOpacityAnim, resetScaleAnim, resetBackgroundColorAnim, rpm]
  )

  const loadingAnimation = useMemo(
    () =>
      Animated.parallel([
        resetScaleAnim,
        resetRpmAnim,
        resetBackgroundColorAnim,
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 111,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 111,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    [resetScaleAnim, resetRpmAnim, resetBackgroundColorAnim, opacity]
  )

  const pausedAnimation = useMemo(
    () =>
      Animated.parallel([
        resetScaleAnim,
        resetRpmAnim,
        resetBackgroundColorAnim,
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2222,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 2222,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    [resetScaleAnim, resetRpmAnim, resetBackgroundColorAnim, opacity]
  )

  const errorAnimation = useMemo(
    () =>
      Animated.parallel([
        resetRpmAnim,
        resetOpacityAnim,
        resetScaleAnim,
        Animated.spring(backgroundColor, {
          toValue: 1,
          useNativeDriver: false,
        }),
      ]),
    [resetRpmAnim, resetOpacityAnim, resetScaleAnim, backgroundColor]
  )

  useEffect(() => {
    switch (streamPlayerState) {
      case StreamPlayerState.Playing:
        playAnimation.start()
        break
      case StreamPlayerState.Paused:
        pausedAnimation.start()
        break
      case StreamPlayerState.Loading:
        loadingAnimation.start()
        break
      case StreamPlayerState.Error:
        errorAnimation.start()
        break
      default:
        resetAllAnim.start()
    }
  }, [
    playAnimation,
    resetAllAnim,
    loadingAnimation,
    errorAnimation,
    pausedAnimation,
    streamPlayerState,
  ])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255, 255, 255, 1)', 'rgba(119, 0, 0, 1)'],
          }),
        },
      ]}
    >
      <Pressable
        onPressIn={onPressIn}
        onLongPress={onLongPress}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        <Animated.Image
          style={[
            styles.dcMan,
            {
              transform: [
                {
                  rotate: rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale },
                { translateX: translation.x },
                { translateY: translation.y },
              ],
              opacity,
            },
          ]}
          tintColor={backgroundColor.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0, 0, 0, 1)', 'rgba(255, 0, 0, 1)'],
          })}
          source={icon}
        />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dcMan: {
    width: 512,
    height: 512,
  },
})

export default StreamPlayer
