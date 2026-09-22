import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

import { LibraryDecorations } from './LibraryDecorations'
import { LibraryOptions } from './LibraryOptions'

declare module 'fastify' {
  interface FastifyInstance {
    /**
     *
     */
    library: LibraryDecorations
  }
}

export const libraryPlugin: FastifyPluginAsync<LibraryOptions> = async (
  fastify,
  {}
) => {
  // initialize the plugin
}

export default fp(libraryPlugin, '5.x')
