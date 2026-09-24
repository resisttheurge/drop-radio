import { spawn, SpawnOptions } from 'node:child_process'

import { Observable } from 'rxjs'

import { fromProcess, RxProcess, RxProcessOptions } from './rx-process/'

export type SpawnRxOptions<Out, Err, Catch, Close> = SpawnOptions &
  RxProcessOptions<Out, Err, Catch, Close>

export function spawnrx(command: string): RxProcess
export function spawnrx(command: string, args: string[]): RxProcess
export function spawnrx<Out, Err, Catch, Close>(
  command: string,
  options: SpawnRxOptions<Out, Err, Catch, Close>
): RxProcess<Out, Err, Catch, Close>
export function spawnrx<Out, Err, Catch, Close>(
  command: string,
  args: string[],
  options: SpawnRxOptions<Out, Err, Catch, Close>
): RxProcess<Out, Err, Catch, Close>
export function spawnrx<Out, Err, Catch, Close>(
  command: string,
  args: string[] | SpawnRxOptions<Out, Err, Catch, Close> = [],
  options: SpawnRxOptions<Out, Err, Catch, Close> = {}
): RxProcess<Out, Err, Catch, Close> {
  return new Observable((subscriber) => {
    const process = spawn(
      command,
      Array.isArray(args) ? args : [],
      Array.isArray(args) ? options : args
    )
    const subscription = fromProcess(process, options).subscribe(subscriber)
    return function unsubscribe() {
      try {
        subscription.unsubscribe()
      } finally {
        if (process.exitCode === null && !process.killed) {
          process.kill(options.killSignal)
        }
      }
    }
  })
}
