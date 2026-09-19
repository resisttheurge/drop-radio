import { Subscriber } from 'rxjs'

import { RxProcessXformError } from './RxProcessError'

export function makeListener<T, Args extends [...unknown[]]>(
  subscriber: Subscriber<T>,
  xform: (...args: Args) => T | undefined
): (...args: Args) => void {
  return (...args: Args) => {
    let next: T | undefined = undefined
    try {
      next = xform(...args)
      if (next !== undefined) {
        subscriber.next(next)
      }
    } catch (cause) {
      subscriber.error(
        new RxProcessXformError(`error during transform`, {
          xform,
          args,
          next,
          cause,
        })
      )
    }
  }
}
