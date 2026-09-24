import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    // any decorations created by this plugin
  }
}

export interface PlaylistOptions {
  // any configuration options available for this plugin
}

export const playlistPlugin: FastifyPluginAsync<PlaylistOptions> = async (
  fastify,
  {}
) => {
  // initialize the plugin
}

export default fp(playlistPlugin, '5.x')
