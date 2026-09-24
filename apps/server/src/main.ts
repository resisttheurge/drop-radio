import { createGcpLoggingPinoConfig } from '@google-cloud/pino-logging-gcp-config'
import Fastify, { FastifyLoggerOptions } from 'fastify'
import pretty from 'pino-pretty'

import { app } from './app/app'

// Google Cloud Run will set this environment variable for you, so
// you can also use it to detect if you are running in Cloud Run
const IS_GOOGLE_CLOUD_RUN = process.env.K_SERVICE !== undefined

// You must listen on the port Cloud Run provides
const port = process.env.PORT ? Number(process.env.PORT) : 8080

// You must listen on all IPV4 addresses in Cloud Run
const host = IS_GOOGLE_CLOUD_RUN ? '0.0.0.0' : process.env.HOST ?? 'localhost'

const logger: FastifyLoggerOptions = IS_GOOGLE_CLOUD_RUN
  ? createGcpLoggingPinoConfig()
  : {
      stream: pretty({
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      }),
    }

try {
  // Instantiate Fastify with some config
  const server = Fastify({ logger })

  // Register your application as a normal plugin.
  server.register(app)

  // Start listening.
  server.listen({ port, host }, (err) => {
    if (err) {
      server.log.error(err)
      server.close()
      process.exit(1)
    } else {
      server.log.info(`[ ready ] http://${host}:${port}`)
    }
  })
} catch (err) {
  console.error(err)
  process.exit(1)
}
