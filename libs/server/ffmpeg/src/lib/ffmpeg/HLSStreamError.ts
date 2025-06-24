export class HLSStreamError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'HLSStreamError'
  }
}
