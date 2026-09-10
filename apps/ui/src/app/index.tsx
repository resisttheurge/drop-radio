import invariant from 'tiny-invariant'

import { Loading } from '@drop-radio/core-components'
import StreamPlayer from '@drop-radio/stream-player'

import { QueryStatus } from '@reduxjs/toolkit/query'
import { streamApi } from '../store'

invariant(
  process.env.EXPO_PUBLIC_STREAM_URL,
  'Environment variable EXPO_PUBLIC_PUBLIC_STREAM_URL is not set'
)
const streamUrl = `${process.env.EXPO_PUBLIC_STREAM_URL}/stream/live.m3u8`
const video = require('../../assets/movies/the-move.mp4')

export default function Index() {
  const { data, status, error } = streamApi.useReadyQuery(undefined, {
    pollingInterval: 1000,
  })
  if (error || status === QueryStatus.uninitialized) {
    return <Loading />
  } else {
    return <StreamPlayer streamUrl={streamUrl} video={video} />
  }
}
