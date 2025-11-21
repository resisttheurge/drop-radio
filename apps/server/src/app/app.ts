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
    start: env.START,
  })
}
