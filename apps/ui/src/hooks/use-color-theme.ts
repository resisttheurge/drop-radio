import { NeutralDarkTheme } from '@/constants'
import { createContext, useContext } from 'react'

export const ColorThemeContext = createContext(NeutralDarkTheme)

export default function useColorTheme() {
  return useContext(ColorThemeContext)
}
