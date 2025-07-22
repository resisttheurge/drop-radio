import { createGcpLoggingPinoConfig } from '@google-cloud/pino-logging-gcp-config'
import Fastify from 'fastify'
import 'pino-pretty'

import { app } from './app/app'

const host = process.env.HOST ?? 'localhost'
const port = process.env.PORT ? Number(process.env.PORT) : 3000
const isProduction = process.env.NODE_ENV === 'production'

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: createGcpLoggingPinoConfig(),
}

// Instantiate Fastify with some config
const server = Fastify({
  logger: envToLogger[isProduction ? 'production' : 'development'],
})
// Register your application as a normal plugin.
server.register(app)

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  } else {
    console.log(`[ ready ] http://${host}:${port}`)
  }
})
