import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    // any decorations created by this plugin
  }
}

export interface StreamOptions {
  // any configuration options available for this plugin
}

export const streamPlugin: FastifyPluginAsync<StreamOptions> = async (
  fastify,
  {}
) => {
  // initialize the plugin
}

export default fp(streamPlugin, '5.x')
