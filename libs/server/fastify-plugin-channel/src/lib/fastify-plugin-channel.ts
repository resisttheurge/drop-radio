import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

import libraryPlugin from '@drop-radio/fastify-plugin-library'
import playlistPlugin from '@drop-radio/fastify-plugin-playlist'
import streamPlugin from '@drop-radio/fastify-plugin-stream'

declare module 'fastify' {
  interface FastifyInstance {
    // any decorations created by this plugin
  }
}

export interface ChannelOptions {
  // any configuration options available for this plugin
}

export const channelPlugin: FastifyPluginAsync<ChannelOptions> = async (
  fastify,
  {}
) => {
  // initialize the plugin
  fastify.register(libraryPlugin)
  fastify.register(playlistPlugin)
  fastify.register(streamPlugin)
}

export default fp(channelPlugin, '5.x')
