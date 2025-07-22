import path from 'node:path'

import staticPlugin from '@fastify/static'
import { Temporal } from '@js-temporal/polyfill'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import {
  filter,
  firstValueFrom,
  Subject,
  Subscription,
  throttleTime,
  timer,
} from 'rxjs'

import { hlsStream } from '@drop-radio/ffmpeg'

import startInstantPlugin from '../start-instant-plugin'
import { cleanupStreamFiles } from './cleanupStreamFiles'
import { convertPlaylistProgress } from './convertPlaylistProgress'
import { createMetaPlaylistFile } from './createMetaPlaylistFile'
import { Playlist } from './Playlist'
import { Progress } from './Progress'
import { readPlaylistFromDirectory } from './readPlaylistFromDir'
import { writePlaylistToFile } from './writePlaylistToFile'

declare module 'fastify' {
  interface FastifyInstance {
    stream: StreamDecorations
  }
}

export interface StreamOptions {
  readonly fileExtension: string
  readonly inputDirectory: string
  readonly outputDirectory: string
  readonly start?: string
}

export interface StreamDecorations {
  readonly inputDirectory: string
  readonly outputDirectory: string
  readonly metaPlaylistFile: string
  readonly playlistFile: string
  readonly playlist: Playlist
  readonly progress: Subject<Progress>
  subscription?: Subscription
  playhead(): number
}

const streamPlugin: FastifyPluginAsync<StreamOptions> = async (
  fastify,
  { fileExtension, inputDirectory, outputDirectory, start }
) => {
  const absInDir = path.resolve(inputDirectory)
  const absOutDir = path.resolve(outputDirectory)
  const absPlaylistFile = path.resolve(absOutDir, 'playlist.txt')
  const absMetaPlaylistFile = path.resolve(absOutDir, 'meta-playlist.txt')

  const playlist = await readPlaylistFromDirectory(absInDir, fileExtension)

  fastify.register(startInstantPlugin, { start })

  fastify.decorate('stream', {
    playlist,
    inputDirectory: absInDir,
    outputDirectory: absOutDir,
    metaPlaylistFile: absMetaPlaylistFile,
    playlistFile: absPlaylistFile,
    progress: new Subject<Progress>(),
    playhead() {
      const offset = fastify.start.instant.until(Temporal.Now.instant())
      return offset.total('microseconds')
    },
  })

  fastify.stream.progress.subscribe({
    next: (progress) => {
      fastify.log.info(
        `Stream progress: ${
          progress.playlist.entries[progress.index].title
        } - Loop: ${progress.loop}, Entry Progress: ${(
          (100 * progress.entryOffset) /
          progress.playlist.entries[progress.index].duration
        ).toFixed(2)}%, Total Progress: ${(
          (100 * progress.playlistOffset) /
          progress.playlist.duration
        ).toFixed(2)}%`
      )
    },
    error: (error) => {
      fastify.log.error('Stream progress error: %o', error)
      if (error.message) {
        fastify.log.error('Message: %s', error.message)
      }
      if (error.cause) {
        fastify.log.error('Cause: %s', error.cause)
      }
      throw error
    },
    complete: () => {
      fastify.log.info('Stream progress completed')
      fastify.log.info('Shutting server down...')
      fastify.close()
    },
  })

  await cleanupStreamFiles(fastify.stream.outputDirectory)
  await createMetaPlaylistFile(absMetaPlaylistFile, absPlaylistFile)

  fastify.get('/progress', async (request, reply) => {
    const progress = await firstValueFrom(fastify.stream.progress)
    reply.send(progress)
  })

  fastify.register(staticPlugin, {
    root: fastify.stream.outputDirectory,
    prefix: '/stream/',
    logLevel: 'warn',
  })

  fastify.addHook('onReady', async () => {
    fastify.log.info('Starting HLS stream...')

    const seekTime = Math.round(fastify.stream.playhead())

    fastify.log.info(`Seeking to time: ${seekTime} microseconds`)

    await writePlaylistToFile(playlist, absPlaylistFile, seekTime)

    if (seekTime > 0) {
      const schedule = (playlist.duration - (seekTime % playlist.duration)) / 2
      const milliseconds = Math.floor(schedule / 1000)
      fastify.log.info(`Scheduling playlist replacement in ${milliseconds} ms`)
      timer(milliseconds).subscribe(async () => {
        await writePlaylistToFile(playlist, absPlaylistFile)
        fastify.log.info(`Replaced playlist after ${milliseconds} ms`)
      })
    }

    fastify.stream.subscription = hlsStream(
      fastify.stream.metaPlaylistFile,
      fastify.stream.outputDirectory,
      {
        concat: true,
        loopCount: -1,
        segmentDuration: 1,
        segmentCount: 50,
      }
    )
      .pipe(
        throttleTime(1000),
        filter(({ out_time_us }) => out_time_us !== 'N/A'),
        convertPlaylistProgress(fastify.stream.playlist, seekTime)
      )
      .subscribe(fastify.stream.progress)
  })

  fastify.addHook('onClose', async () => {
    fastify.log.info('Unsubscribing from stream progress updates...')
    fastify.stream.subscription?.unsubscribe()
  })
}

export default fp(streamPlugin, '5.x.x')
