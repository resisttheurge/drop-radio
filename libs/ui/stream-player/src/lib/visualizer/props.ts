import { AudioPlayer } from 'expo-audio'

export type VisualizationType = 'spinning-man'

export interface VisualizerProps {
  visualization?: VisualizationType
  player: AudioPlayer
}
