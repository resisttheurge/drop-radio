import path from 'node:path'

import cors from '@fastify/cors'
import { FastifyInstance } from 'fastify'
import { env } from 'process'
import invariant from 'tiny-invariant'

import streamPlugin from '@drop-radio/stream-plugin'

export async function app(fastify: FastifyInstance) {
  // Place here your custom code!
  invariant(
    env.FILE_EXTENSION,
    'FILE_EXTENSION must be provided as an environment variable'
  )
  invariant(
    env.INPUT_DIRECTORY,
    'INPUT_DIRECTORY must be provided as an environment variable'
  )
  invariant(
    env.OUTPUT_DIRECTORY,
    'OUTPUT_DIRECTORY must be provided as an environment variable'
  )

  fastify.register(cors, { origin: true })

  fastify.register(streamPlugin, {
    fileExtension: env.FILE_EXTENSION,
    inputDirectory: path.resolve(env.INPUT_DIRECTORY),
    outputDirectory: path.resolve(env.OUTPUT_DIRECTORY),
    hlsOptions: {
      segmentDuration:
        (env.SEGMENT_DURATION && Number(env.SEGMENT_DURATION)) || 3,
      segmentCount: (env.SEGMENT_COUNT && Number(env.SEGMENT_COUNT)) || 4,
      formats: [
        {
          name: 'high',
          bitrate: env.HI_BIT_RATE ?? '640k',
          sampleRate: env.HI_SAMPLE_RATE ?? '48k',
        },
        {
          name: 'low',
          bitrate: env.LO_BIT_RATE ?? '32k',
          sampleRate: env.LO_SAMPLE_RATE ?? '12k',
        },
      ],
    },
    start: env.START,
  })
}
