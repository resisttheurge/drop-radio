/**
 * Base class for errors related to HLS streaming.
 */
export class HLSStreamError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'HLSStreamError'
  }
}
