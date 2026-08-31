import {
  AudioPlayer,
  AudioPlayerOptions,
  AudioStatus,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio'
import { useEffect } from 'react'

export const defaultAudioPlayerOptions: AudioPlayerOptions = {
  keepAudioSessionActive: true,
  updateInterval: 1000,
}

export interface StreamHookConfig {
  audioPlayerOptions?: AudioPlayerOptions
}

export type StreamHookReturn = readonly [AudioPlayer, AudioStatus]

export default function useStream(
  url: string,
  { audioPlayerOptions = {} }: StreamHookConfig = {}
): StreamHookReturn {
  const audioPlayer = useAudioPlayer(url, {
    ...defaultAudioPlayerOptions,
    ...audioPlayerOptions,
  })
  const audioStatus = useAudioPlayerStatus(audioPlayer)
  useEffect(() => {
    switch (audioStatus.playbackState) {
      case 'waiting':
        console.log(
          `Audio waiting because: ${audioStatus.reasonForWaitingToPlay}`
        )
        break
      case 'playing':
        console.log(`Audio playing: ${audioStatus.currentTime}`)
        break
      case 'paused':
        console.log('Audio paused')
        break
    }
  }, [
    audioStatus.playbackState,
    audioStatus.reasonForWaitingToPlay,
    audioStatus.currentTime,
  ])
  return [audioPlayer, audioStatus]
}
