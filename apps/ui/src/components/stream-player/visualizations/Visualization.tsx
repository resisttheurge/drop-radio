import { Theme } from '@react-navigation/native'
import { AudioPlayer } from 'expo-audio'
import { SharedValue } from 'react-native-reanimated'

export interface VisualizationProps {
  player: AudioPlayer
  theme: Theme
  canvasSize: SharedValue<{ width: number; height: number }>
}

export type Visualization = React.ComponentType<VisualizationProps>

export default Visualization
