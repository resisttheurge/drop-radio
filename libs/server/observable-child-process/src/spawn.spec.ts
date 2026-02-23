import child_process, { ChildProcess } from 'node:child_process'

import { fc, it } from '@fast-check/jest'
import { anything, oneof, string, tuple } from 'fast-check'
import { concat, mergeAll, mergeMap, of } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import invariant from 'tiny-invariant'
import { Mock } from 'ts-jest-mocker'

import { resolve } from './CommandOrThunk'
import rotateBuffer from './rotateBuffer'
import * as namedExports from './spawn'
import SpawnError from './SpawnError'
import SpawnOptions from './SpawnOptions'

import arbBuffer from './__test__/Buffer.arb'
import mockChildProcess from './__test__/ChildProcess.mock'
import {
  arbCloseEvent,
  arbErrorEvent,
  arbStderrEvent,
  arbStdoutEvent,
} from './__test__/ChildProcessEvent.arb'
import arbMarbleDiagram from './__test__/MarbleDiagram.arb'
import arbSignal from './__test__/Signals.arb'
import arbCommandOrThunk from './CommandOrThunk.arb'
import mockSpawn from './spawn.mock'
import arbSpawnOptions from './SpawnOptions.arb'

jest.mock('node:child_process')

describe('the spawn module', () => {
  const { spawn, default: defaultExport, ...unexpectedExports } = namedExports
  it('should export the spawn function', () => {
    expect(spawn).toBeDefined()
    expect(typeof spawn).toBe('function')
  })

  it('should export the spawn function as the default export', () => {
    expect(defaultExport).toBe(spawn)
  })

  it('should not have any unexpected named exports', () => {
    expect(unexpectedExports).toEqual({})
  })

  describe('the spawn function', () => {
    // Test state
    let testScheduler: TestScheduler
    let mockProcess: Mock<ChildProcess>
    let spawnSpy: jest.SpyInstance<
      ReturnType<typeof child_process.spawn>,
      Parameters<typeof child_process.spawn>
    >

    // Per-test setup
    function setup() {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected)
      })
      mockProcess = mockChildProcess()
      spawnSpy = jest.mocked(child_process).spawn.mockReturnValue(mockProcess)
    }

    // Per-test teardown
    function teardown() {
      jest.clearAllMocks()
    }

    // Configure jest and fast-check
    beforeEach(setup)
    afterEach(teardown)
    fc.configureGlobal({ beforeEach: setup, afterEach: teardown })

    // Scenarios
    const givenValidCommandOrThunk = it.prop([arbCommandOrThunk()])

    const givenValidCommandOrThunkAndOptions = it.prop([
      arbCommandOrThunk(),
      arbSpawnOptions(),
    ])

    const givenOnlyStdoutEvents = it.prop([
      arbCommandOrThunk(),
      arbSpawnOptions(),
      arbMarbleDiagram({
        marble: fc.oneof(fc.string(), arbBuffer()),
        endInError: false,
      }),
    ])

    const givenStdoutAndStderrEvents = it.prop([
      arbCommandOrThunk(),
      arbSpawnOptions(),
      arbMarbleDiagram({
        marble: fc.oneof(
          fc.string(),
          arbBuffer(),
          arbStdoutEvent(),
          arbStderrEvent()
        ),
        endInError: false,
      }),
    ])

    const givenEndInClose = it.prop([
      arbCommandOrThunk(),
      arbSpawnOptions(),
      arbMarbleDiagram({
        marble: fc.oneof(
          fc.string(),
          arbBuffer(),
          arbStdoutEvent(),
          arbStderrEvent()
        ),
        endInError: false,
      }),
      arbCloseEvent(),
    ])

    const givenEndInProcessError = it.prop([
      arbCommandOrThunk(),
      arbSpawnOptions(),
      arbMarbleDiagram({
        marble: fc.oneof(
          fc.string(),
          arbBuffer(),
          arbStdoutEvent(),
          arbStderrEvent()
        ),
        endInError: false,
      }),
      oneof(
        arbErrorEvent(),
        tuple(string(), anything()).map(
          ([msg, cause]) => new Error(msg, { cause })
        )
      ),
    ])

    const givenNonZeroExit = it.prop([
      arbCommandOrThunk(),
      arbSpawnOptions(),
      arbMarbleDiagram({
        endInError: false,
      }),
      fc.integer().filter((n) => n !== 0),
    ])

    const givenExitWithSignal = it.prop([
      arbCommandOrThunk(),
      arbSpawnOptions(),
      arbMarbleDiagram({ endInError: false }),
      arbSignal(),
    ])

    const givenProcessError = it.prop([
      arbCommandOrThunk(),
      arbSpawnOptions(),
      arbMarbleDiagram({ endInError: true }),
    ])

    // Properties
    givenValidCommandOrThunk(
      'should not call node:child_process.spawn until subscribed to',
      (command) => {
        testScheduler.run(() => {
          expect(spawnSpy).not.toHaveBeenCalled()
          spawn(command).subscribe().unsubscribe()
          expect(spawnSpy).toHaveBeenCalledTimes(1)
        })
      }
    )

    givenValidCommandOrThunkAndOptions(
      'should call node:child_process.spawn with the resolved command and node spawn options',
      (command, options) => {
        testScheduler.run(() => {
          // extract options that are not part of node:child_process spawn options
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { errorTrace, maxBuffer, mapStdout, mapStderr, ...opts } =
            options
          const [cmd, ...args] = resolve(command)
          spawn(command, options).subscribe().unsubscribe()
          expect(spawnSpy).toHaveBeenCalledWith(cmd, args, opts)
        })
      }
    )

    givenValidCommandOrThunkAndOptions(
      'should register listeners for "close" and "error" events on the spawned process',
      (command, options) => {
        testScheduler.run(() => {
          const process = spawn(command, options)
          process.subscribe().unsubscribe()
          expect(mockProcess.on).toHaveBeenCalledTimes(2)
          expect(mockProcess.listeners('error')).toHaveLength(1)
          expect(mockProcess.listeners('close')).toHaveLength(1)
        })
      }
    )

    givenValidCommandOrThunkAndOptions(
      'should register a listener for "data" events on stdout',
      (command, options) => {
        testScheduler.run(() => {
          const process = spawn(command, options)
          process.subscribe().unsubscribe()
          expect(mockProcess.stdout?.on).toHaveBeenCalledTimes(1)
          expect(mockProcess.stdout?.listeners('data')).toHaveLength(1)
        })
      }
    )

    givenValidCommandOrThunkAndOptions(
      'should register a listener for "data" events on stderr if errorTrace is set',
      (command, options) => {
        testScheduler.run(() => {
          let numListeners = 0
          if (options.errorTrace === true) numListeners += 1
          if (options.mapStderr !== undefined) numListeners += 1
          const process = spawn(command, options)
          process.subscribe().unsubscribe()
          expect(mockProcess.stderr?.on).toHaveBeenCalledTimes(numListeners)
          expect(mockProcess.stderr?.listeners('data')).toHaveLength(
            numListeners
          )
        })
      }
    )

    givenOnlyStdoutEvents(
      'should return an observable that emits stdout events as they emitted by the underlying process',
      (command, options, diagram) => {
        testScheduler.run(({ expectObservable, cold }) => {
          const process = cold(diagram.timeline, diagram.values)
          expectObservable(process.pipe(mockSpawn(command, options))).toBe(
            diagram.timeline,
            diagram.values
          )
        })
      }
    )

    givenStdoutAndStderrEvents(
      'should return an observable that only emits stdout events if mapStderr is undefined',
      (command, options, diagram) => {
        const { mapStdout } = options
        fc.pre(mapStdout !== undefined)
        testScheduler.run(({ expectObservable, cold }) => {
          const process = cold(diagram.timeline, diagram.values)
          expectObservable(
            process.pipe(
              mockSpawn(command, { ...options, mapStderr: undefined })
            )
          ).toEqual(
            process.pipe(
              mergeMap((event) => {
                if (typeof event === 'string' || Buffer.isBuffer(event)) {
                  return of(mapStdout(event))
                } else if ('stdout' in event) {
                  return of(mapStdout(event.stdout))
                } else {
                  return of()
                }
              })
            )
          )
        })
      }
    )

    givenStdoutAndStderrEvents(
      'should return an observable that emits both stdout and stderr events if mapStderr is defined',
      (command, options, diagram) => {
        const { mapStdout, mapStderr } = options
        fc.pre(mapStdout !== undefined && mapStderr !== undefined)
        testScheduler.run(({ expectObservable, cold }) => {
          const process = cold(diagram.timeline, diagram.values)
          expectObservable(process.pipe(mockSpawn(command, options))).toEqual(
            process.pipe(
              mergeMap((event) => {
                if (typeof event === 'string' || Buffer.isBuffer(event)) {
                  return of(mapStdout(event))
                } else {
                  const events: (string | Buffer)[] = []
                  if ('stdout' in event) {
                    events.push(mapStdout(event.stdout))
                  }
                  if ('stderr' in event) {
                    events.push(mapStderr(event.stderr))
                  }
                  return of(...events)
                }
              })
            )
          )
        })
      }
    )

    givenEndInProcessError(
      'should return an observable that errors if the underlying process emits an error event',
      (command, options, diagram, errorEvent) => {
        testScheduler.run(({ flush, cold }) => {
          const [cmd, ...args] = resolve(command)
          const process = cold(diagram.timeline, diagram.values)
          const sub = concat(process, of(errorEvent))
            .pipe(mockSpawn(command, options))
            .subscribe({
              error: (err) => {
                expect(err).toEqual(
                  SpawnError.failedWithError(
                    cmd,
                    args,
                    errorEvent instanceof Error ? errorEvent : errorEvent.error
                  )
                )
              },
            })
          flush()
          sub.unsubscribe()
        })
      }
    )

    givenEndInClose(
      'should return an observable that errors with an error trace if enabled',
      (command, options, diagram, closeEvent) => {
        testScheduler.run(({ flush, cold }) => {
          const maxBuffer = options.maxBuffer ?? SpawnOptions.defaults.maxBuffer
          const process = cold(diagram.timeline, diagram.values)
          let trace: Buffer = Buffer.from('')
          const sub = concat(process, of(closeEvent))
            .pipe(
              mockSpawn(command, {
                ...options,
                mapStdout: () => of(),
                mapStderr: (err) => of(err),
                errorTrace: true,
              }),
              mergeAll()
            )
            .subscribe({
              next: (data) => {
                if (Buffer.isBuffer(data)) {
                  trace = rotateBuffer(trace, data, maxBuffer)
                } else {
                  trace = rotateBuffer(trace, Buffer.from(data), maxBuffer)
                }
              },
              error: (err) => {
                expect(err).toBeInstanceOf(SpawnError)
                expect(err.stderr).toBeDefined()
                expect(err.cause).toBeDefined()
                expect(err.cause).toBe(err.stderr)
                expect(err.stderr?.length).toBeLessThanOrEqual(
                  options.maxBuffer ?? SpawnOptions.defaults.maxBuffer
                )
                expect(err.stderr).toEqual(trace)
              },
            })
          flush()
          sub.unsubscribe()
        })
      }
    )

    givenNonZeroExit(
      'should return an observable that errors if the underlying process exits with a non-zero code',
      (command, options, diagram, exitCode) => {
        testScheduler.run(({ expectObservable, cold }) => {
          const [cmd, ...args] = resolve(command)
          const process = cold(diagram.timeline, diagram.values)
          expectObservable(
            process.pipe(mockSpawn(command, options, exitCode))
          ).toBe(
            diagram.timeline.replace('|', '#'),
            diagram.values,
            SpawnError.exitedWithNonzeroCode(cmd, args, exitCode)
          )
        })
      }
    )

    givenExitWithSignal(
      'should return an observable that errors if the underlying process exits due to a signal',
      (command, options, diagram, signal) => {
        testScheduler.run(({ expectObservable, cold }) => {
          const [cmd, ...args] = resolve(command)
          const process = cold(diagram.timeline, diagram.values)
          expectObservable(
            process.pipe(mockSpawn(command, options, signal))
          ).toBe(
            diagram.timeline.replace('|', '#'),
            diagram.values,
            SpawnError.terminatedBySignal(cmd, args, signal)
          )
        })
      }
    )

    givenProcessError(
      'should return an observable that errors if the underlying process emits an error event',
      (command, options, diagram) => {
        testScheduler.run(({ expectObservable, cold }) => {
          invariant(
            diagram.error !== undefined,
            'Test: expected diagram.error to be set'
          )
          const [cmd, ...args] = resolve(command)
          const process = cold(diagram.timeline, diagram.values, diagram.error)
          expectObservable(process.pipe(mockSpawn(command, options))).toBe(
            diagram.timeline,
            diagram.values,
            SpawnError.failedWithError(cmd, args, diagram.error)
          )
        })
      }
    )
  })
})
