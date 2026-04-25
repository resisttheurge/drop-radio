/* eslint-disable jsx-a11y/accessible-emoji */
import { SafeAreaView } from 'react-native'

import StreamPlayer from '../components/StreamPlayer'

export const App = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <StreamPlayer />
    </SafeAreaView>
  )
}

export default App
