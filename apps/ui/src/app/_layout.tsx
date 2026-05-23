import { Theme, ThemeProvider } from '@react-navigation/native'
import { Slot } from 'expo-router'
import { useMemo } from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Loading from '../components/loading'
import { DarkTheme, LightTheme } from '../constants/themes'

export function SuspenseFallback() {
  const colorScheme = useColorScheme()
  const theme = useMemo(
    () => (colorScheme === 'dark' ? DarkTheme : LightTheme),
    [colorScheme]
  )
  const styles = useMemo(() => themedStyles(theme), [theme])
  return (
    <ThemeProvider value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Loading />
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const theme = useMemo(
    () => (colorScheme === 'dark' ? DarkTheme : LightTheme),
    [colorScheme]
  )
  const styles = useMemo(() => themedStyles(theme), [theme])
  return (
    <ThemeProvider value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  )
}

function themedStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  })
}
