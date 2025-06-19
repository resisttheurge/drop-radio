/**
 * Base Error class for errors thrown during FFProbe operations.
 */
export class FFProbeError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'FFProbeError'
  }
}
