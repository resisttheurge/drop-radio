import invariant from 'tiny-invariant'

import StreamPlayer from '@drop-radio/stream-player'

invariant(
  process.env.EXPO_PUBLIC_STREAM_URL,
  'Environment variable EXPO_PUBLIC_PUBLIC_STREAM_URL is not set'
)
const streamUrl = process.env.EXPO_PUBLIC_STREAM_URL
const video = require('../../assets/movies/the-move.mp4')

export default function Index() {
  return <StreamPlayer streamUrl={streamUrl} video={video} />
}
