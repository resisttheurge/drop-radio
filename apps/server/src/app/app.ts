import path from 'node:path'
import { FastifyInstance } from 'fastify'
import AutoLoad from '@fastify/autoload'
import streamPlugin from '@drop-radio/stream-plugin'
import { env } from 'process'
import invariant from 'tiny-invariant'

/* eslint-disable-next-line */
export interface AppOptions {}

export async function app(fastify: FastifyInstance, opts: AppOptions) {
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
  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  })
}
