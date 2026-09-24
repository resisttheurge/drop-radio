import { createContext, useContext } from 'react'

import defaultTheme from '@drop-radio/core-themes'

export const ThemeContext = createContext(defaultTheme)

export function useTheme() {
  return useContext(ThemeContext)
}
