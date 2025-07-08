import { Temporal } from '@js-temporal/polyfill'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    start: StartInstantDecorations
  }
}

export interface StartInstantOptions {
  readonly start?: string
}

export class StartInstantDecorations {
  private _instant?: Temporal.Instant

  constructor(public readonly start?: string) {
    if (start) {
      this._instant = Temporal.Instant.from(start)
    } else {
      start = 'not provided'
    }
  }

  get instant(): Temporal.Instant {
    if (!this._instant) {
      this._instant = Temporal.Now.instant()
    }
    return this._instant
  }
}

const startInstantPlugin: FastifyPluginAsync<StartInstantOptions> = async (
  fastify,
  { start }
) => {
  fastify.decorate('start', new StartInstantDecorations(start))
}

export default fp(startInstantPlugin, '5.x')
