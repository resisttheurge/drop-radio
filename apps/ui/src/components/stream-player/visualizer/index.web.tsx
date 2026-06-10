import Loading from '@/components/loading'
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web'
import { useCallback } from 'react'
import { type VisualizerProps } from './props'

export * from './props'

export default function WebVisualizer(props: VisualizerProps) {
  const importVizualizer = useCallback(() => import('./visualizer'), [])
  return (
    <WithSkiaWeb
      getComponent={importVizualizer}
      fallback={<Loading />}
      componentProps={props}
    />
  )
}
