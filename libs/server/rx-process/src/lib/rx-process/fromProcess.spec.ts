import { Buffer } from 'node:buffer'
import { ChildProcess } from 'node:child_process'
import EventEmitter from 'node:events'
import { Readable, Writable } from 'node:stream'

import { Observable, of, Subscription } from 'rxjs'

import { fc, it } from '@fast-check/jest'
import { Arbitrary } from 'fast-check'
import { Mock, mock } from 'ts-jest-mocker'

import { fromProcess } from './fromProcess'
import { RxProcess } from './RxProcess'
import { RxProcessMsg } from './RxProcessMsg'
import { RxProcessOptions } from './RxProcessOptions'

interface VirtualEmitters {
  process: EventEmitter
  stdin: EventEmitter
  stdout: EventEmitter
  stderr: EventEmitter
}

interface FromProcessMocks {
  process: Mock<ChildProcess>
  stdin: Mock<Writable>
  stdout: Mock<Readable>
  stderr: Mock<Readable>
}

describe('rx-process.ts', () => {
  describe('makeListener()', () => {})
  describe('fromProcess()', () => {
    let mocks: FromProcessMocks
    let events: VirtualEmitters

    describe('given a child process', () => {
      defaultBehavior(() => fromProcess(mocks.process))
    })

    describe('given a child process and an options object', () => {
      describe('that has any properties', () => {
        let options: RxProcessOptions<unknown, unknown, unknown, unknown>
        beforeEach(() => {
          options = fc.sample(arbOptions([]), 1)[0]
        })
        invariantBehavior(() => fromProcess(mocks.process, options))
      })

      describe('that is empty', () => {
        defaultBehavior(() => fromProcess(mocks.process, {}))
      })

      describe('that has a stdout handler', () => {
        let stdoutOptions: RxProcessOptions<unknown, unknown, unknown, unknown>
        beforeEach(() => {
          stdoutOptions = fc.sample(arbOptions(['stdout']), 1)[0]
        })
        stdoutBehavior(() => fromProcess(mocks.process, stdoutOptions))
      })

      describe('that has a stderr handler', () => {
        let stderrOptions: RxProcessOptions<unknown, unknown, unknown, unknown>
        beforeEach(() => {
          stderrOptions = fc.sample(arbOptions(['stderr']), 1)[0]
        })
        stderrBehavior(() => fromProcess(mocks.process, stderrOptions))
      })

      describe('that has a catch handler', () => {
        let catchOptions: RxProcessOptions<unknown, unknown, unknown, unknown>
        beforeEach(() => {
          catchOptions = fc.sample(arbOptions(['catch']), 1)[0]
        })
        catchBehavior(() => fromProcess(mocks.process, catchOptions))
      })

      describe('that has a close handler', () => {
        let closeOptions: RxProcessOptions<unknown, unknown, unknown, unknown>
        beforeEach(() => {
          closeOptions = fc.sample(arbOptions(['close']), 1)[0]
        })
        closeBehavior(() => fromProcess(mocks.process, closeOptions))
      })

      describe('that has an input observable', () => {
        inputBehavior(
          (options) => fromProcess(mocks.process, options),
          fc.sample(arbOptions(['input']), 1)[0]
        )
      })
    })

    function setup() {
      mocks = {
        process: mock(ChildProcess),
        stdin: mock(Writable),
        stdout: mock(Readable),
        stderr: mock(Readable),
      }

      mocks.process.stdin = mocks.stdin
      mocks.process.stdout = mocks.stdout
      mocks.process.stderr = mocks.stderr

      events = {
        process: simEventEmitter(mocks.process as Mock<EventEmitter>),
        stdin: simEventEmitter(mocks.stdin as Mock<EventEmitter>),
        stdout: simEventEmitter(mocks.stdout as Mock<EventEmitter>),
        stderr: simEventEmitter(mocks.stderr as Mock<EventEmitter>),
      }
    }

    function teardown() {
      jest.resetAllMocks()
    }

    function invariantBehavior(init: () => RxProcess<unknown>) {
      let rxProcess: RxProcess<unknown>

      beforeEach(() => {
        rxProcess = init()
      })

      it('should return an observable', () => {
        expect(rxProcess).toBeInstanceOf(Observable)
      })

      it('should not interact with the process before it is subscribed to', () => {
        expect(mocks.process.off).not.toHaveBeenCalled()
        expect(mocks.process.on).not.toHaveBeenCalled()

        expect(mocks.stdin.emit).not.toHaveBeenCalled()

        expect(mocks.stdout.off).not.toHaveBeenCalled()
        expect(mocks.stdout.on).not.toHaveBeenCalled()

        expect(mocks.stderr.off).not.toHaveBeenCalled()
        expect(mocks.stderr.on).not.toHaveBeenCalled()
      })
    }

    function defaultBehavior(init: () => RxProcess<unknown>) {
      let rxProcess: RxProcess<unknown>

      beforeEach(() => {
        rxProcess = init()
      })

      describe('when subscribed to', () => {
        let subscription: Subscription
        let errorListener: Function
        let closeListener: Function

        beforeEach(() => {
          subscription = rxProcess.subscribe()
          errorListener = events.process.listeners('error')[0]
          closeListener = events.process.listeners('close')[0]
        })

        it("should add one 'error' and 'close' listener each to the process", () => {
          expect(mocks.process.on).toHaveBeenCalledTimes(2)
          expect(events.process.eventNames()).toEqual(['error', 'close'])
        })

        it('should not interact with the process in any other way', () => {
          expect(mocks.process.off).not.toHaveBeenCalled()

          expect(mocks.stdin.emit).not.toHaveBeenCalled()

          expect(mocks.stdout.off).not.toHaveBeenCalled()
          expect(mocks.stdout.on).not.toHaveBeenCalled()

          expect(mocks.stderr.off).not.toHaveBeenCalled()
          expect(mocks.stderr.on).not.toHaveBeenCalled()
        })

        describe('when unsubscribed', () => {
          beforeEach(() => {
            subscription.unsubscribe()
          })

          it("should remove the 'error' and 'close' listeners from the process", () => {
            expect(mocks.process.off).toHaveBeenCalledTimes(2)
            expect(mocks.process.off).toHaveBeenCalledWith(
              'error',
              errorListener
            )
            expect(mocks.process.off).toHaveBeenCalledWith(
              'close',
              closeListener
            )
          })

          it('should not leave any other dangling listeners', () => {
            expect(events.process.eventNames()).toEqual([])
          })

          it('should not interact with the process in any other way', () => {
            expect(mocks.stdin.emit).not.toHaveBeenCalled()

            expect(mocks.stdout.off).not.toHaveBeenCalled()
            expect(mocks.stdout.on).not.toHaveBeenCalled()

            expect(mocks.stderr.off).not.toHaveBeenCalled()
            expect(mocks.stderr.on).not.toHaveBeenCalled()
          })
        })

        afterEach(() => {
          subscription.unsubscribe()
        })
      })
    }

    function stdoutBehavior<T = unknown>(
      init: () => RxProcess<T, unknown, unknown, unknown>
    ) {
      describe('when process.stdout = null', () => {
        let rxProcess: RxProcess<unknown, T, unknown, unknown>
        beforeEach(() => {
          mocks.process.stdout = null
          rxProcess = init()
        })
        it('should not attempt to call process.stdout.on', () => {
          const sub = rxProcess.subscribe()
          expect(mocks.stdout.on).not.toHaveBeenCalled()
          expect(events.stdout.eventNames()).toHaveLength(0)
          sub.unsubscribe()
          expect(mocks.stdout.on).not.toHaveBeenCalled()
          expect(events.stdout.eventNames()).toHaveLength(0)
        })
      })

      describe('when process.stdout != null', () => {
        describe('when subscribed to', () => {
          let rxProcess: RxProcess<unknown>
          let sub: Subscription

          beforeEach(() => {
            rxProcess = init()
            sub = rxProcess.subscribe()
          })

          it("should add one 'data' listener to process.stdout", () => {
            expect(mocks.stdout.on).toHaveBeenCalledTimes(1)
          })

          describe('when unsubscribed', () => {
            beforeEach(() => {
              sub.unsubscribe()
            })

            it("should remove one 'data' listener from process.stdout", () => {
              expect(mocks.stdout.off).toHaveBeenCalledTimes(1)
            })
          })
        })
      })
    }

    function stderrBehavior<T = unknown>(
      init: () => RxProcess<unknown, T, unknown, unknown>
    ) {
      describe('when process.stderr = null', () => {
        let rxProcess: RxProcess<unknown, T, unknown, unknown>
        beforeEach(() => {
          mocks.process.stderr = null
          rxProcess = init()
        })
        it('should not attempt to call process.stderr.on', () => {
          const sub = rxProcess.subscribe()
          expect(mocks.stderr.on).not.toHaveBeenCalled()
          expect(events.stderr.eventNames()).toHaveLength(0)
          sub.unsubscribe()
          expect(mocks.stderr.on).not.toHaveBeenCalled()
          expect(events.stderr.eventNames()).toHaveLength(0)
        })
      })

      describe('when process.stderr != null', () => {
        describe('when subscribed to', () => {
          let rxProcess: RxProcess<unknown, T, unknown, unknown>
          let sub: Subscription

          beforeEach(() => {
            rxProcess = init()
            sub = rxProcess.subscribe()
          })

          it("should add one 'data' listener to process.stderr", () => {
            expect(mocks.stderr.on).toHaveBeenCalledTimes(1)
          })

          describe('when unsubscribed', () => {
            beforeEach(() => {
              sub.unsubscribe()
            })

            it("should remove one 'data' listener from process.stderr", () => {
              expect(mocks.stderr.off).toHaveBeenCalledTimes(1)
            })
          })
        })
      })
    }

    function catchBehavior<T = unknown>(
      init: () => RxProcess<unknown, unknown, T, unknown>
    ) {
      describe('when subscribed to', () => {
        let rxProcess: RxProcess<unknown>
        let sub: Subscription
        let lastErrorListener: Function
        let lastCloseListener: Function

        beforeEach(() => {
          rxProcess = init()
          sub = rxProcess.subscribe()
          lastErrorListener = events.process.listeners('error')[1]
          lastCloseListener =
            events.process.listeners('close')[
              events.process.listeners('close').length - 1
            ]
        })

        it("should add two 'error' listeners to the process", () => {
          expect(mocks.process.on).toHaveBeenCalled()
          expect(events.process.listeners('error')).toHaveLength(2)
        })

        it("should add last to 'error' the same listener as the last 'close' listener (subscriber.complete)", () => {
          expect(lastErrorListener).toEqual(lastCloseListener)
        })

        describe('when unsubscribed', () => {
          beforeEach(() => {
            sub.unsubscribe()
          })

          it("should remove all 'error' listeners from the process", () => {
            expect(mocks.process.off).toHaveBeenCalled()
            expect(events.process.listeners('error')).toHaveLength(0)
          })
        })
      })
    }

    function closeBehavior<T = unknown>(
      init: () => RxProcess<unknown, unknown, unknown, T>
    ) {
      describe('when subscribed to', () => {
        let rxProcess: RxProcess<unknown>
        let sub: Subscription

        beforeEach(() => {
          rxProcess = init()
          sub = rxProcess.subscribe()
        })

        it("should add two 'close' listeners to the process", () => {
          expect(mocks.process.on).toHaveBeenCalled()
          expect(events.process.listeners('close')).toHaveLength(2)
        })

        describe('when unsubscribed', () => {
          beforeEach(() => {
            sub.unsubscribe()
          })

          it("should remove all 'clsoe' listeners from the process", () => {
            expect(mocks.process.off).toHaveBeenCalled()
            expect(events.process.listeners('close')).toHaveLength(0)
          })
        })
      })
    }

    function inputBehavior(
      init: (
        options: RxProcessOptions<unknown, unknown, unknown, unknown>
      ) => RxProcess<unknown, unknown, unknown, unknown>,
      options: Required<Pick<RxProcessOptions, 'input'>> &
        Omit<RxProcessOptions<unknown, unknown, unknown, unknown>, 'input'>
    ) {
      let subSpy: jest.SpyInstance<
        Subscription,
        [
          next?: ((value: RxProcessMsg) => void) | null ,
          error?: ((error: any) => void) | null ,
          complete?: (() => void) | null 
        ],
        any
      >
      beforeEach(() => {
        subSpy = jest.spyOn(options.input, 'subscribe')
      })
      describe('when process.stdin = null', () => {
        let rxProcess: RxProcess<unknown, unknown, unknown, unknown>
        beforeEach(() => {
          mocks.process.stdin = null
          rxProcess = init(options)
        })

        it('should not subscribe to the given input', () => {
          const sub = rxProcess.subscribe()
          expect(subSpy).not.toHaveBeenCalled()
          sub.unsubscribe()
          expect(subSpy).not.toHaveBeenCalled()
        })

        it('should not attempt to call process.stdin.emit', () => {
          const sub = rxProcess.subscribe()
          expect(mocks.stdin.emit).not.toHaveBeenCalled()
          expect(events.stdin.eventNames()).toHaveLength(0)
          sub.unsubscribe()
          expect(mocks.stdin.emit).not.toHaveBeenCalled()
          expect(events.stdin.eventNames()).toHaveLength(0)
        })
      })

      describe('when process.stdin != null', () => {
        describe('when subscribed', () => {
          let inputSub: Mock<Subscription>
          let rxProcess: RxProcess<unknown, unknown, unknown, unknown>
          let sub: Subscription
          beforeEach(() => {
            inputSub = mock(Subscription)
            inputSub.unsubscribe.mockImplementation(() => {})
            subSpy.mockReturnValue(inputSub)
            rxProcess = init(options)
            sub = rxProcess.subscribe()
          })

          it('should subscribe to the input observable', () => {
            expect(subSpy).toHaveBeenCalledTimes(1)
          })

          describe('when unsubscribed', () => {
            beforeEach(() => {
              sub.unsubscribe()
            })
            it('should unsubscribe from the input observable', () => {
              expect(inputSub.unsubscribe).toHaveBeenCalledTimes(1)
            })
          })
        })
      })
    }

    beforeEach(setup)
    afterEach(teardown)
    fc.configureGlobal({ beforeEach: setup, afterEach: teardown })
  })
})

function arbBufferEncoding(): Arbitrary<BufferEncoding> {
  return fc.constantFrom(
    'ascii',
    'utf8',
    'utf-8',
    'utf16le',
    'utf-16le',
    'ucs2',
    'ucs-2',
    'base64',
    'base64url',
    'latin1',
    'binary',
    'hex'
  )
}

function arbRxMessage(): Arbitrary<RxProcessMsg> {
  return fc.oneof(
    fc.string(),
    fc
      .tuple(fc.string(), arbBufferEncoding())
      .map(([data, encoding]) => Buffer.from(data, encoding))
  )
}

function arbOptions(
  requiredKeys: Array<
    keyof RxProcessOptions<unknown, unknown, unknown, unknown>
  >
) {
  return fc.record(
    {
      input: fc.array(arbRxMessage()).map((msgs) => of(...msgs)),
      stdout: fc.func(fc.anything()),
      stderr: fc.func(fc.anything()),
      catch: fc.func(fc.anything()),
      close: fc.func(fc.constant(undefined)),
    },
    { requiredKeys }
  )
}

function simEventEmitter<U, T extends Record<keyof U, unknown[]>>(
  mock: Mock<EventEmitter<T>>
): EventEmitter<T> {
  const result = new EventEmitter<T>()
  mock.on.mockImplementation((...args) => {
    result.on(...args)
    return mock
  })
  mock.off.mockImplementation((...args) => {
    result.off(...args)
    return mock
  })
  return result
}
