import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { BehaviorSubject } from 'rxjs'

import { LibraryDecorations } from './LibraryDecorations'
import { LibraryOptions, ResolvedLibraryOptions } from './LibraryOptions'
import { LibraryStatus } from './LibraryStatus'
import { LiveLibrarySnapshot } from './LiveLibrary'

declare module 'fastify' {
  interface FastifyInstance {
    library: LibraryDecorations
  }
}

export const libraryPlugin: FastifyPluginAsync<LibraryOptions> = async (
  fastify,
  _options: LibraryOptions
) => {
  try {
    const options = new ResolvedLibraryOptions(_options)
    const live = new BehaviorSubject({
      status: LibraryStatus.INIT,
      errorLog: [],
    } as LiveLibrarySnapshot)
    fastify.library = {
      options,
      live,
    }
    fastify.addHook('onRegister', async () => {
      fastify.sche
    })
  } catch (error) {
    fastify.log.error(error, 'uncaught error while initializing library plugin')
    throw error
  }
}

export default fp(libraryPlugin, '5.x')
