import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export function createStreamApi(baseUrl: string) {
  return createApi({
    reducerPath: 'streamApi',
    baseQuery: fetchBaseQuery({ baseUrl }),
    endpoints: (build) => ({
      ready: build.query<undefined, undefined, undefined>({
        query: () => 'ready',
      }),
    }),
  })
}
