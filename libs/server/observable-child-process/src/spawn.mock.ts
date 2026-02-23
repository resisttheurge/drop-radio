import child_process from 'node:child_process'
import { Observable } from 'rxjs'

import CommandOrThunk from './CommandOrThunk'
import spawn from './spawn'
import SpawnOptions from './SpawnOptions'

import mockChildProcess from './__test__/ChildProcess.mock'
import MockChildProcessEvent from './__test__/ChildProcessEvent.mock'

export function mockSpawn<T>(
  command: CommandOrThunk,
  options?: SpawnOptions<T>,
  exitCodeOrSignal: number | NodeJS.Signals = 0
) {
  return function pipeToMockChildProcess(
    observable: Observable<MockChildProcessEvent>
  ) {
    return new Observable<T>((subscriber) => {
      const process = mockChildProcess()
      jest.mocked(child_process).spawn.mockReturnValueOnce(process)

      const spawnSubscription = spawn(command, options).subscribe(subscriber)
      const processSubscription = observable.subscribe({
        next,
        error,
        complete,
      })

      function error(err: unknown) {
        process.emit('error', err)
      }

      function complete() {
        if (typeof exitCodeOrSignal === 'number') {
          process.emit('close', exitCodeOrSignal)
        } else {
          process.emit('close', null, exitCodeOrSignal)
        }
      }

      function next(mockEvent: MockChildProcessEvent) {
        if (typeof mockEvent === 'string' || Buffer.isBuffer(mockEvent)) {
          process.stdout?.emit('data', mockEvent)
        } else if (mockEvent instanceof Error) {
          process.emit('error', mockEvent)
          processSubscription.unsubscribe()
        } else {
          if ('stdout' in mockEvent) {
            process.stdout?.emit('data', mockEvent.stdout)
          }
          if ('stderr' in mockEvent) {
            process.stderr?.emit('data', mockEvent.stderr)
          }
          if ('error' in mockEvent) {
            process.emit('error', mockEvent.error)
            processSubscription.unsubscribe()
          }
          if ('close' in mockEvent) {
            if (typeof mockEvent.close === 'number') {
              process.emit('close', mockEvent.close)
            } else {
              process.emit('close', null, mockEvent.close)
            }
            processSubscription.unsubscribe()
          }
        }
      }

      return function unsubscribe() {
        processSubscription.unsubscribe()
        spawnSubscription.unsubscribe()
      }
    })
  }
}

export default mockSpawn
