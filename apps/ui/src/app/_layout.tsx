import { ColorTheme, NeutralDarkTheme, NeutralLightTheme } from '@/constants'
import { ColorThemeContext } from '@/hooks/use-color-theme'
import { Slot } from 'expo-router'
import { useMemo } from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Loading from '../components/loading'

export function SuspenseFallback() {
  const colorScheme = useColorScheme()
  const theme = useMemo(
    () => (colorScheme === 'dark' ? NeutralDarkTheme : NeutralLightTheme),
    [colorScheme]
  )
  const styles = useMemo(() => themedStyles(theme), [theme])
  return (
    <ColorThemeContext value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Loading />
        </SafeAreaView>
      </SafeAreaProvider>
    </ColorThemeContext>
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
    <ColorThemeContext value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    </ColorThemeContext>
  )
}

function themedStyles(theme: ColorTheme) {
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.dark ? theme.shadow.css() : theme.shine.css(),
    },
  })
}
