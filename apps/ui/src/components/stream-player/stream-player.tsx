import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web'
import { useCallback, useMemo } from 'react'
import { Platform, View } from 'react-native'
import Loading from '../loading'
import StreamControls from './stream-controls'
import { VisualizerProps } from './stream-visualizer'

function WebVisualizer(props: VisualizerProps) {
  const importVizualizer = useCallback(() => import('./stream-visualizer'), [])
  return (
    <WithSkiaWeb
      getComponent={importVizualizer}
      fallback={<Loading />}
      componentProps={props}
    />
  )
}

function NativeVisualizer(props: VisualizerProps) {
  const requireVizualizer = useCallback(
    () => require('./stream-visualizer').default,
    []
  )
  const Vizualizer = useMemo(requireVizualizer, [requireVizualizer])
  return <Vizualizer {...props} />
}

export default function StreamPlayer() {
  const Visualizer = useMemo(
    () => (Platform.OS === 'web' ? WebVisualizer : NativeVisualizer),
    []
  )
  return (
    <View style={{ flex: 1 }}>
      <Visualizer visualization="spinning-man" />
      <StreamControls />
    </View>
  )
}
