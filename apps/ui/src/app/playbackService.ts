import TrackPlayer, { Event } from 'react-native-track-player'
export default async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.setVolume(1)
    TrackPlayer.play()
  })
  TrackPlayer.addEventListener(Event.RemotePause, () =>
    TrackPlayer.setVolume(0)
  )
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.setVolume(0))
  TrackPlayer.addEventListener(Event.RemoteDuck, ({ paused, permanent }) => {
    if (permanent) {
      TrackPlayer.setVolume(0)
    } else if (paused) {
      TrackPlayer.setVolume(0.5)
    } else {
      TrackPlayer.setVolume(1)
    }
  })
}
