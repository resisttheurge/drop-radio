import { useCallback, useEffect, useState } from 'react'
import TrackPlayer, { Track } from 'react-native-track-player'

export function useTrackPlayer(track: Track) {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<unknown | null>(null)

  const setupPlayer = useCallback(async (track: Track) => {
    try {
      await TrackPlayer.setupPlayer()
      await TrackPlayer.reset()
      await TrackPlayer.add(track)
      setInitialized(true)
      setError(null)
    } catch (e) {
      setError(e)
    }
  }, [])

  useEffect(() => {
    if (!initialized) {
      setupPlayer(track)
    }
  }, [initialized, setupPlayer, track])

  return { error, initialized, setupPlayer }
}

export default useTrackPlayer
