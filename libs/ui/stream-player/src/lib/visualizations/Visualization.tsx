import { AudioPlayer } from 'expo-audio'
import { SharedValue } from 'react-native-reanimated'

import { Theme } from '@drop-radio/theme'

export interface VisualizationProps {
  player: AudioPlayer
  theme: Theme
  canvasSize: SharedValue<{ width: number; height: number }>
}

export type Visualization = React.ComponentType<VisualizationProps>

export default Visualization
