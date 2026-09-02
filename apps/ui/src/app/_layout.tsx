import { Slot } from 'expo-router'
import { useMemo } from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { Loading } from '@drop-radio/core-components'
import { NeutralDarkTheme, NeutralLightTheme } from '@drop-radio/core-themes'
import { Theme } from '@drop-radio/theme'
import { ThemeContext } from '@drop-radio/theme-context'

export function SuspenseFallback() {
  const colorScheme = useColorScheme()
  const theme = useMemo(
    () => (colorScheme === 'dark' ? NeutralDarkTheme : NeutralLightTheme),
    [colorScheme]
  )
  const styles = useMemo(() => themedStyles(theme), [theme])
  return (
    <ThemeContext value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Loading />
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeContext>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const theme = useMemo(
    () => (colorScheme === 'dark' ? NeutralDarkTheme : NeutralLightTheme),
    [colorScheme]
  )
  const styles = useMemo(() => themedStyles(theme), [theme])
  return (
    <ThemeContext value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeContext>
  )
}

function themedStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.dark ? theme.shadow.css() : theme.shine.css(),
    },
  })
}
