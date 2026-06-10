import { NeutralDarkTheme, NeutralLightTheme } from '@/constants'
import { ScrollViewStyleReset } from 'expo-router/html'
import { useMemo, type PropsWithChildren } from 'react'
import { useColorScheme } from 'react-native'

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme()
  const style = useMemo(
    () => ({
      backgroundColor:
        colorScheme === 'dark'
          ? NeutralDarkTheme.shadow.css()
          : NeutralLightTheme.shine.css(),
    }),
    [colorScheme]
  )
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/*
          PWA and favicon configuration. See the apps/ui/public directory
        */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body style={style}>{children}</body>
    </html>
  )
}
