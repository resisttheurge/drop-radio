import { configureStore } from '@reduxjs/toolkit'

import invariant from 'tiny-invariant'
import { createStreamApi } from './stream-api-slice'

invariant(
  process.env.EXPO_PUBLIC_STREAM_URL,
  'Environment variable EXPO_PUBLIC_PUBLIC_STREAM_URL is not set'
)
const baseUrl: string = process.env.EXPO_PUBLIC_STREAM_URL

export const streamApi = createStreamApi(baseUrl)

export default configureStore({
  reducer: {
    [streamApi.reducerPath]: streamApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(streamApi.middleware),
})
