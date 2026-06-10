import { NeutralDarkTheme } from '@/constants'
import { createContext, useContext } from 'react'

export const BackgroundColorContext = createContext(NeutralDarkTheme.form)

export default function useBackgroundColor() {
  return useContext(BackgroundColorContext)
}
