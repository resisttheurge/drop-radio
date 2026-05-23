import { Theme } from '@react-navigation/native'
import { SharedValue } from 'react-native-reanimated'

export interface VisualizationProps {
  theme: Theme
  canvasSize: SharedValue<{ width: number; height: number }>
}

export type Visualization = React.FC<VisualizationProps>

export default Visualization
