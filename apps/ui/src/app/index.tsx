import { SafeAreaView } from 'react-native'

import invariant from 'tiny-invariant'
import StreamPlayer from '../components/StreamPlayer'

invariant(
  process.env.EXPO_PUBLIC_STREAM_URL,
  'Environment variable EXPO_PUBLIC_PUBLIC_STREAM_URL is not set'
)
const streamUrl = `${process.env.EXPO_PUBLIC_STREAM_URL}/stream/live.m3u8`

export const App = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <StreamPlayer streamUrl={streamUrl} />
    </SafeAreaView>
  )
}

export default App
