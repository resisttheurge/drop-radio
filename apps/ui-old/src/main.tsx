import { AppRegistry } from 'react-native'
import TrackPlayer from 'react-native-track-player'

import App from './app/App'
import playbackService from './app/playbackService'

AppRegistry.registerComponent('Ui', () => App)
TrackPlayer.registerPlaybackService(() => playbackService)
