import { ChildProcess } from 'node:child_process'

import { Observable, Subscription } from 'rxjs'

import { RxProcessOptions } from './RxProcessOptions'
import { makeListener } from './makeListener'
import { RxProcessMsg } from './RxProcessMsg'
import { RxProcess } from './RxProcess'

export function fromProcess(proc: ChildProcess): RxProcess
export function fromProcess<
  Out = never,
  Err = never,
  Catch = never,
  Close = never
>(
  proc: ChildProcess,
  options: RxProcessOptions<Out, Err, Catch, Close>
): RxProcess<Out, Err, Catch, Close>
export function fromProcess<Out, Err, Catch, Close>(
  proc: ChildProcess,
  options?: RxProcessOptions<Out, Err, Catch, Close>
): RxProcess<Out, Err, Catch, Close> {
  return new Observable((subscriber) => {
    const stdout =
      proc.stdout && options?.stdout && makeListener(subscriber, options.stdout)
    const stderr =
      proc.stderr && options?.stderr && makeListener(subscriber, options.stderr)
    const error = options?.catch && makeListener(subscriber, options.catch)
    const close = options?.close && makeListener(subscriber, options.close)

    if (stdout && proc.stdout) {
      proc.stdout.on('data', stdout)
    }

    if (stderr && proc.stderr) {
      proc.stderr.on('data', stderr)
    }

    if (error) {
      proc.on('error', error)
      proc.on('error', subscriber.complete)
    } else {
      proc.on('error', subscriber.error)
    }

    if (close) {
      proc.on('close', close)
    }

    proc.on('close', subscriber.complete)

    let subscription: Subscription | undefined = undefined

    if (proc.stdin && options?.input) {
      const { stdin } = proc
      subscription = options.input.subscribe({
        next: (value: RxProcessMsg) => stdin.emit('data', value),
        error: subscriber.error,
      })
    }

    return function unsubscribe() {
      if (subscription !== undefined) {
        subscription.unsubscribe()
      }

      proc.off('close', subscriber.complete)

      if (close) {
        proc.off('close', close)
      }

      if (error) {
        proc.off('error', subscriber.complete)
        proc.off('error', error)
      } else {
        proc.off('error', subscriber.error)
      }

      if (stdout && proc.stdout) {
        proc.stdout.off('data', stdout)
      }

      if (stderr && proc.stderr) {
        proc.stderr.off('data', stderr)
      }
    }
  })
}
