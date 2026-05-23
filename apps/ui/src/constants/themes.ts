import { DefaultTheme, Theme } from '@react-navigation/native'

export const LightTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    primary: '#AFAF8B',
    background: '#E6E6E6',
    card: '#F2F2F2',
    text: '#333333',
    border: '#8B8B8B',
    notification: '#F78B8B',
  },
}

export const DarkTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    primary: '#464633',
    background: '#101010',
    card: '#333333',
    text: '#F2F2F2',
    border: '#8B8B8B',
    notification: '#8B3333',
  },
}
