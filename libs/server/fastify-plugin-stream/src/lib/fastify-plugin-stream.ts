import { Temporal } from '@js-temporal/polyfill'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import {
  BehaviorSubject,
  concat,
  mergeMap,
  Observable,
  of,
  repeat,
  retry,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs'

import { FFMPEGProgress } from '@drop-radio/ffmpeg'
import { stream } from './stream'
declare module 'fastify' {
  interface FastifyInstance {
    // any decorations created by this plugin
    stream: StreamDecorations
  }
}

export interface StreamDecorations {
  // any configuration options available for this plugin
  progress: Observable<StreamState>
}

export interface StreamOptions {
  // any configuration options available for this plugin
  destination: string
  entryPlaylist$: Observable<string>
  loop?: boolean
  repeatPlaylist$?: Observable<string>
  retries?: number
  retryDelay?: number
}

export interface StreamState {
  status: StreamStatus
  destination: string
  source?: string
  start?: Temporal.Instant
  progress?: FFMPEGProgress
  error?: unknown
}

export const streamPlugin: FastifyPluginAsync<StreamOptions> = async (
  fastify,
  {
    destination,
    entryTrack: string,
    repeatTrack: string
    loop = true,
    retries = 3,
    retryDelay = 1000,
  }
) => {
  // initialize the plugin
  let sub: Subscription
  const subject = new BehaviorSubject<StreamState>({ status: StreamStatus.INIT, destination })

  const stream$ = concat(
    entryPlaylist$.pipe(tap(playlist => subject.next({ source: playlist, ...subject.getValue() })), switchMap(stream(destination))),
    !loop
      ? of()
      : repeatPlaylist$.pipe(take(1), tap(playlist => subject.next({ source: playlist, ...subject.getValue() })) mergeMap(stream(destination)), repeat())
  ).pipe(retry({ count: retries, delay: retryDelay }))

  fastify.stream.progress = subject

  fastify.addHook('onReady', () => {
    sub = stream$.subscribe({
      next(value) {},
      error(err) {},
      complete() {},
    })
  })
}

export default fp(streamPlugin, '5.x')
