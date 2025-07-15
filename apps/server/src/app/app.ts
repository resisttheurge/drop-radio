import path from 'node:path'
import { FastifyInstance } from 'fastify'
import streamPlugin from '@drop-radio/stream-plugin'
import { env } from 'process'
import invariant from 'tiny-invariant'

export async function app(fastify: FastifyInstance) {
  // Place here your custom code!
  invariant(
    env.INPUT_DIRECTORY,
    'INPUT_DIRECTORY must be provided as an environment variable'
  )
  invariant(
    env.OUTPUT_DIRECTORY,
    'OUTPUT_DIRECTORY must be provided as an environment variable'
  )

  fastify.register(streamPlugin, {
    inputDirectory: path.resolve(env.INPUT_DIRECTORY),
    outputDirectory: path.resolve(env.OUTPUT_DIRECTORY),
    start: env.START,
  })
}
