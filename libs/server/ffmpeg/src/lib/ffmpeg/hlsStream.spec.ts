import child_process, { ChildProcess } from 'node:child_process'

import { Arbitrary } from 'fast-check'
import { it, fc } from '@fast-check/jest'
import { Mock, mock } from 'ts-jest-mocker'

import { hlsStream, HLSStreamArgs, toHLSStreamArgs } from './hlsStream'
import {
  HLS_STREAM_DEFAULTS,
  HLSStreamFormat,
  HLSStreamOptions,
} from './HLSStreamOptions'
import { HLSStreamProgress } from './HLSStreamProgress'
import { Readable } from 'node:stream'
import { TestScheduler } from 'rxjs/testing'
import { Observable } from 'rxjs'
import { HLSStreamError } from './HLSStreamError'

jest.mock('node:child_process')

describe('hlsStream', () => {
  let mock_child_process: jest.Mocked<typeof child_process>
  let mockProcess: Mock<ChildProcess>
  let mockStdout: Mock<Readable>
  let mockStderr: Mock<Readable>
  let processCallbackMap: Map<
    Parameters<ChildProcess['on']>[0],
    ((...args: unknown[]) => void)[]
  >
  let stdoutCallbackMap: Map<
    Parameters<Readable['on']>[0],
    ((...args: unknown[]) => void)[]
  >
  let stderrCallbackMap: Map<
    Parameters<Readable['on']>[0],
    ((...args: unknown[]) => void)[]
  >
  let testScheduler: TestScheduler

  function mockProcessEvents(
    events: Observable<Buffer>,
    {
      next = (data: Buffer) => {
        mockStdout.emit('data', data)
      },
      error = (error: unknown) => {
        mockProcess.emit('error', error)
      },
      complete = () => {
        mockProcess.emit('close', 0)
      },
    } = {}
  ) {
    events.subscribe({
      next,
      error,
      complete,
    })
  }

  function setup() {
    mock_child_process = jest.mocked(child_process)
    mockProcess = mock(ChildProcess)
    mockStdout = mock(Readable)
    mockStderr = mock(Readable)
    processCallbackMap = new Map()
    stdoutCallbackMap = new Map()
    stderrCallbackMap = new Map()
    Object.defineProperty(mockProcess, 'stdout', {
      get: () => mockStdout,
    })
    Object.defineProperty(mockProcess, 'stderr', {
      get: () => mockStderr,
    })
    mock_child_process.spawn.mockReturnValue(mockProcess)
    mockProcess.kill.mockImplementation(jest.fn())
    mockProcess.on.mockImplementation((event, cb) => {
      processCallbackMap.set(event, [
        ...(processCallbackMap.get(event) ?? []),
        cb,
      ])
      return mockProcess
    })
    mockProcess.emit.mockImplementation((event, ...args) => {
      const callbacks = processCallbackMap.get(event)
      if (callbacks) {
        callbacks.forEach((cb) => cb(...args))
        return true
      } else {
        return false
      }
    })
    mockStdout.on.mockImplementation((event, cb) => {
      stdoutCallbackMap.set(event, [
        ...(stdoutCallbackMap.get(event) ?? []),
        cb,
      ])
      return mockStdout
    })
    mockStdout.emit.mockImplementation((event, ...args) => {
      const callbacks = stdoutCallbackMap.get(event)
      if (callbacks) {
        callbacks.forEach((cb) => cb(...args))
        return true
      } else {
        return false
      }
    })
    mockStderr.on.mockImplementation((event, cb) => {
      stderrCallbackMap.set(event, [
        ...(stderrCallbackMap.get(event) ?? []),
        cb,
      ])
      return mockStderr
    })
    mockStderr.emit.mockImplementation((event, ...args) => {
      const callbacks = stderrCallbackMap.get(event)
      if (callbacks) {
        callbacks.forEach((cb) => cb(...args))
        return true
      } else {
        return false
      }
    })
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })
  }

  function teardown() {
    jest.resetAllMocks()
    processCallbackMap.clear()
    stdoutCallbackMap.clear()
    stderrCallbackMap.clear()
    testScheduler.flush()
  }

  fc.configureGlobal({ beforeEach: setup, afterEach: teardown })

  beforeEach(setup)
  afterEach(teardown)

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
  })(
    'returns a cold Observable that does not spawn a child process if not ' +
      'subscribed',
    ({ inputFile, outputDirectory, options }) => {
      testScheduler.run(() => {
        hlsStream(inputFile, outputDirectory, options)
        expect(mock_child_process.spawn).not.toHaveBeenCalled()
      })
    }
  )

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
  })(
    'returns a cold Observable that spawns a child process with expected ' +
      'arguments when subscribed',
    ({ inputFile, outputDirectory, options }) => {
      const args = toHLSStreamArgs(options)

      testScheduler.run(() => {
        hlsStream(inputFile, outputDirectory, options).subscribe()

        expect(mock_child_process.spawn).toHaveBeenCalledWith(
          'ffmpeg',
          [
            '-hide_banner',
            '-nostats',
            ...['-progress', 'pipe:1'],
            '-re',
            ...args.seekTime,
            ...args.concat,
            ...args.loopCount,
            ...['-i', inputFile],
            ...args.maps,
            ...args.sampleRates,
            ...args.bitrates,
            ...['-f', 'hls'],
            ...args.segmentDuration,
            ...args.segmentCount,
            ...[
              '-hls_flags',
              'discont_start+delete_segments+temp_file+append_list',
            ],
            ...['-hls_allow_cache', '0'],
            ...args.varStreamMap,
            ...['-strftime', '1'],
            ...args.masterPlaylistName,
            ...args.segmentFileName,
            args.playlistName,
          ],
          {
            cwd: outputDirectory,
          }
        )
      })
    }
  )

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
  })(
    'returns an Observable that kills the child process when unsubscribed',
    ({ inputFile, outputDirectory, options }) => {
      testScheduler.run(() => {
        const process = hlsStream(inputFile, outputDirectory, options)
        const subscription = process.subscribe({ error: console.log })
        expect(mockProcess.kill).not.toHaveBeenCalled()
        subscription.unsubscribe()
        expect(mockProcess.kill).toHaveBeenCalled()
      })
    }
  )

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
    eventStream: arbProgressEvents(),
  })(
    'returns an Observable that does not kill the child process when ' +
      'unsubscribed after the process closes',
    ({ inputFile, outputDirectory, options, eventStream }) => {
      testScheduler.run(({ cold, expectObservable, flush }) => {
        const events = cold<Buffer>(
          `${eventStream.marbles}|`,
          eventStream.buffers
        )
        const expected = `           ${eventStream.marbles}|`
        const process = hlsStream(inputFile, outputDirectory, options)
        const subscription = process.subscribe()
        mockProcessEvents(events)
        expectObservable(process).toBe(expected, eventStream.objects)
        flush()
        subscription.unsubscribe()
        expect(mockProcess.kill).not.toHaveBeenCalled()
      })
    }
  )

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
    eventStream: arbProgressEvents(),
    err: fc.anything(),
  })(
    'returns an Observable that does not kill the child process when ' +
      'unsubscribed after an error when the process fails',
    ({ inputFile, outputDirectory, options, eventStream, err }) => {
      const error = new HLSStreamError('ffmpeg child process failed', {
        cause: err,
      })
      testScheduler.run(({ cold, expectObservable, flush }) => {
        const events = cold<Buffer>(
          `${eventStream.marbles}#`,
          eventStream.buffers,
          err
        )
        const expected = `           ${eventStream.marbles}#`
        const process = hlsStream(inputFile, outputDirectory, options)
        const subscription = process.subscribe({
          error: (e) => {
            expect(e).toBeInstanceOf(HLSStreamError)
            expect(e).toEqual(error)
          },
        })
        mockProcessEvents(events)
        expectObservable(process).toBe(expected, eventStream.objects, error)
        flush()
        subscription.unsubscribe()
        expect(mockProcess.kill).not.toHaveBeenCalled()
      })
    }
  )

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
    eventStream: arbProgressEvents(),
  })(
    'returns an Observable that completes when the process exits with code 0',
    ({ inputFile, outputDirectory, options, eventStream }) => {
      testScheduler.run(({ cold, expectObservable }) => {
        const events = cold<Buffer>(
          `${eventStream.marbles}|`,
          eventStream.buffers
        )
        const expected = `           ${eventStream.marbles}|`
        const process = hlsStream(inputFile, outputDirectory, options)
        process.subscribe()
        mockProcessEvents(events)
        expectObservable(process).toBe(expected, eventStream.objects)
      })
    }
  )

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
    eventStream: arbProgressEvents(),
    err: fc.anything(),
  })(
    'returns an Observable that errors when the process fails',
    ({ inputFile, outputDirectory, options, eventStream, err }) => {
      const error = new HLSStreamError('ffmpeg child process failed', {
        cause: err,
      })
      testScheduler.run(({ cold, expectObservable }) => {
        const events = cold<Buffer>(
          `${eventStream.marbles}#`,
          eventStream.buffers,
          err
        )
        const expected = `           ${eventStream.marbles}#`
        const process = hlsStream(inputFile, outputDirectory, options)
        process.subscribe({
          error: (e) => {
            expect(e).toBeInstanceOf(HLSStreamError)
            expect(e).toEqual(error)
          },
        })
        mockProcessEvents(events)
        expectObservable(process).toBe(expected, eventStream.objects, error)
      })
    }
  )

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
    eventStream: arbProgressEvents(),
    errorCode: fc.integer({ min: 1 }),
    errorMessage: fc.string(),
  })(
    'returns an Observable that errors when the process exits with a non-zero code',
    ({
      inputFile,
      outputDirectory,
      options,
      eventStream,
      errorCode,
      errorMessage,
    }) => {
      const error = new HLSStreamError(`ffmpeg exited with code ${errorCode}`, {
        cause: errorMessage,
      })
      testScheduler.run(({ cold, expectObservable }) => {
        const events = cold<Buffer>(
          `${eventStream.marbles}|`,
          eventStream.buffers
        )
        const expected = `           ${eventStream.marbles}#`
        const process = hlsStream(inputFile, outputDirectory, options)
        process.subscribe({
          error: (err) => {
            expect(err).toBeInstanceOf(HLSStreamError)
            expect(err).toEqual(error)
          },
        })
        mockProcessEvents(events, {
          complete: () => {
            mockStderr.emit('data', Buffer.from(errorMessage)) // Simulate stderr output
            mockProcess.emit('close', errorCode) // Simulate non-zero exit code
          },
        })
        expectObservable(process).toBe(expected, eventStream.objects, error)
      })
    }
  )

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
    eventStream: arbProgressEvents(),
    signal: arbTermSig(),
  })(
    'returns an Observable that errors when the process is terminated by a signal',
    ({ inputFile, outputDirectory, options, eventStream, signal }) => {
      const error = new HLSStreamError(
        `ffmpeg process was terminated by signal ${signal}`,
        { cause: signal }
      )
      testScheduler.run(({ cold, expectObservable }) => {
        const events = cold<Buffer>(
          `${eventStream.marbles}|`,
          eventStream.buffers
        )
        const expected = `           ${eventStream.marbles}#`
        const process = hlsStream(inputFile, outputDirectory, options)
        process.subscribe({
          error: (err) => {
            expect(err).toBeInstanceOf(HLSStreamError)
            expect(err.message).toBe(error.message)
            expect(err.cause).toBe(error.cause)
          },
        })
        mockProcessEvents(events, {
          complete: () => {
            mockProcess.emit('close', null, signal) // Simulate termination by signal
          },
        })
        expectObservable(process).toBe(expected, eventStream.objects, error)
      })
    }
  )

  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
    eventStream: arbProgressEvents(),
  })(
    'returns an Observable that emits HLSStreamProgress objects parsed from ' +
      'stdout',
    ({ inputFile, outputDirectory, options, eventStream }) => {
      testScheduler.run(({ cold, expectObservable }) => {
        const events = cold<Buffer>(
          `${eventStream.marbles}|`,
          eventStream.buffers
        )
        const expected = `           ${eventStream.marbles}|`
        const process = hlsStream(inputFile, outputDirectory, options)
        process.subscribe()
        mockProcessEvents(events)
        expectObservable(process).toBe(expected, eventStream.objects)
      })
    }
  )
  it.prop({
    inputFile: fc.string(),
    outputDirectory: fc.string(),
    options: fc.option(arbHLSStreamOptions(), { nil: undefined }),
    eventStream: arbProgressEvents(),
    err: fc.anything(),
  })(
    'returns an Observable that errors if it fails to parse ffmpeg output',
    ({ inputFile, outputDirectory, options, eventStream, err }) => {
      const error = new HLSStreamError('Failed to parse ffmpeg output', {
        cause: err,
      })
      const mockBuffer = mock(Buffer)
      jest.spyOn(mockBuffer, 'toString').mockImplementation(() => {
        throw err
      })
      testScheduler.run(({ cold, expectObservable }) => {
        const events = cold<Buffer>(
          `${eventStream.marbles}x-|`,
          { ...eventStream.buffers, x: mockBuffer } // Simulate invalid data
        )
        const expected = `           ${eventStream.marbles}#`
        const process = hlsStream(inputFile, outputDirectory, options)
        process.subscribe({
          error: (e) => {
            expect(e).toBeInstanceOf(HLSStreamError)
            expect(e).toEqual(error)
          },
        })
        mockProcessEvents(events)
        expectObservable(process).toBe(expected, eventStream.objects, error)
      })
    }
  )
})

describe('toHLSStreamArgs', () => {
  it('uses library defaults when no options object is provided', () => {
    expect(toHLSStreamArgs()).toEqual(toHLSStreamArgs(HLS_STREAM_DEFAULTS))
  })

  it('uses library defaults when an empty options object is provided', () => {
    expect(toHLSStreamArgs({})).toEqual(toHLSStreamArgs(HLS_STREAM_DEFAULTS))
  })

  for (const key of Object.keys(
    HLS_STREAM_DEFAULTS
  ) as (keyof HLSStreamOptions)[]) {
    it.prop([arbHLSStreamOptions({ [key]: fc.constant(undefined) })])(
      `uses library defaults for ${key} when not provided`,
      () => {
        const options: Partial<HLSStreamOptions> = { [key]: undefined }
        expect(toHLSStreamArgs(options)).toEqual(
          toHLSStreamArgs({ ...options, [key]: HLS_STREAM_DEFAULTS[key] })
        )
      }
    )
  }

  it.prop([arbHLSStreamOptions()])(
    'produces the correct concat arguments',
    (options) => {
      const expectedArgs: HLSStreamArgs['concat'] = options.concat
        ? ['-f', 'concat', '-safe', '0']
        : []
      const args = toHLSStreamArgs(options)

      expect(args.concat).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct loop arguments',
    (options) => {
      const expectedArgs: HLSStreamArgs['loopCount'] = [
        '-stream_loop',
        options.loopCount?.toString() ??
          HLS_STREAM_DEFAULTS.loopCount.toString(),
      ]
      const args = toHLSStreamArgs(options)

      expect(args.loopCount).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct seek time arguments',
    (options) => {
      const expectedArgs: HLSStreamArgs['seekTime'] = [
        '-ss',
        options.seekTime ?? HLS_STREAM_DEFAULTS.seekTime,
      ]
      const args = toHLSStreamArgs(options)

      expect(args.seekTime).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct map arguments',
    (options) => {
      const inputFormats = options.formats ?? HLS_STREAM_DEFAULTS.formats
      const expectedArgs: HLSStreamArgs['maps'] = inputFormats.flatMap(() => [
        '-map',
        '0:a',
      ])

      const args = toHLSStreamArgs(options)

      expect(args.maps).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct sample rate arguments',
    (options) => {
      const inputFormats = options.formats ?? HLS_STREAM_DEFAULTS.formats
      const expectedArgs: HLSStreamArgs['sampleRates'] = inputFormats.flatMap(
        ({ sampleRate }, index) => [`-ar:a:${index}`, sampleRate]
      )

      const args = toHLSStreamArgs(options)

      expect(args.sampleRates).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct bitrate arguments',
    (options) => {
      const inputFormats = options.formats ?? HLS_STREAM_DEFAULTS.formats
      const expectedArgs: HLSStreamArgs['bitrates'] = inputFormats.flatMap(
        ({ bitrate }, index) => [`-b:a:${index}`, bitrate]
      )

      const args = toHLSStreamArgs(options)

      expect(args.bitrates).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct segment duration arguments',
    (options) => {
      const expectedArgs: HLSStreamArgs['segmentDuration'] = [
        '-hls_time',
        (
          options.segmentDuration ?? HLS_STREAM_DEFAULTS.segmentDuration
        ).toString(),
      ]

      const args = toHLSStreamArgs(options)

      expect(args.segmentDuration).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct segment count arguments',
    (options) => {
      const expectedArgs: HLSStreamArgs['segmentCount'] = [
        '-hls_list_size',
        (options.segmentCount ?? HLS_STREAM_DEFAULTS.segmentCount).toString(),
      ]

      const args = toHLSStreamArgs(options)

      expect(args.segmentCount).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct variable stream map arguments',
    (options) => {
      const inputFormats = options.formats ?? HLS_STREAM_DEFAULTS.formats
      const expectedArgs: HLSStreamArgs['varStreamMap'] = [
        '-var_stream_map',
        inputFormats
          .map(({ name }, index) => `a:${index},name:${name}`)
          .join(' '),
      ]

      const args = toHLSStreamArgs(options)

      expect(args.varStreamMap).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct master playlist name arguments',
    (options) => {
      const expectedArgs: HLSStreamArgs['masterPlaylistName'] = [
        '-master_pl_name',
        `${
          options.masterPlaylistName ?? HLS_STREAM_DEFAULTS.masterPlaylistName
        }.m3u8`,
      ]

      const args = toHLSStreamArgs(options)

      expect(args.masterPlaylistName).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct segment file name arguments',
    (options) => {
      const expectedArgs: HLSStreamArgs['segmentFileName'] = [
        '-hls_segment_filename',
        `%v/%Y%m%d_%s${
          options.segmentFileNameSuffix ??
          HLS_STREAM_DEFAULTS.segmentFileNameSuffix
        }.ts`,
      ]

      const args = toHLSStreamArgs(options)

      expect(args.segmentFileName).toEqual(expectedArgs)
    }
  )

  it.prop([arbHLSStreamOptions()])(
    'produces the correct playlist name arguments',
    (options) => {
      const expectedArgs: HLSStreamArgs['playlistName'] = `%v/${
        options.playlistName ?? HLS_STREAM_DEFAULTS.playlistName
      }.m3u8`

      const args = toHLSStreamArgs(options)

      expect(args.playlistName).toEqual(expectedArgs)
    }
  )
})

type ArbitraryConstraints<T> = {
  [K in keyof T]?: Arbitrary<T[K]>
}

function arbHLSStreamFormat({
  name = fc.string(),
  bitrate = fc.string(),
  sampleRate = fc.string(),
}: ArbitraryConstraints<HLSStreamFormat> = {}): Arbitrary<HLSStreamFormat> {
  return fc.record({
    name,
    bitrate,
    sampleRate,
  })
}

function arbHLSStreamOptions({
  concat = fc.boolean(),
  loopCount = fc.integer({ min: -1 }),
  formats = fc.array(arbHLSStreamFormat()),
  seekTime = fc.string(),
  segmentDuration = fc.integer({ min: 1 }),
  segmentCount = fc.integer({ min: 1 }),
  masterPlaylistName = fc.string(),
  segmentFileNameSuffix = fc.string(),
  playlistName = fc.string(),
}: ArbitraryConstraints<HLSStreamOptions> = {}): Arbitrary<HLSStreamOptions> {
  return fc.record(
    {
      concat,
      loopCount,
      formats,
      seekTime,
      segmentDuration,
      segmentCount,
      masterPlaylistName,
      segmentFileNameSuffix,
      playlistName,
    },
    { requiredKeys: [] }
  )
}

function arbHLSStreamProgress({
  bitrate = fc.string(),
  total_size = fc.string(),
  out_time_us = fc.string(),
  out_time_ms = fc.string(),
  out_time = fc.string(),
  speed = fc.string(),
  progress = fc.constantFrom('continue', 'end'),
}: ArbitraryConstraints<HLSStreamProgress> = {}): Arbitrary<HLSStreamProgress> {
  return fc.record({
    bitrate,
    total_size,
    out_time_us,
    out_time_ms,
    out_time,
    speed,
    progress,
  })
}

function hlsStreamProgressToBuffer(progress: HLSStreamProgress): Buffer {
  return Buffer.from(
    Object.entries(progress)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n'),
    'utf-8'
  )
}

function arbProgressEvents({
  progressEvent = arbHLSStreamProgress({ progress: fc.constant('continue') }),
  endEvent = fc.oneof(arbHLSStreamProgress({ progress: fc.constant('end') })),
  delay = arbMarbleDelay(),
} = {}) {
  return endEvent
    .chain((end) =>
      fc
        .array(progressEvent)
        .map((progressEvents) => progressEvents.concat(end))
    )
    .chain((events) =>
      fc
        .array(delay, {
          minLength: events.length + 1,
          maxLength: events.length + 1,
        })
        .map((delays) => {
          const marbles =
            Array.from(
              { length: events.length },
              (_, i) => `${delays[i]}${i}`
            ).join('') + delays.slice(-1)
          const buffers = Object.fromEntries(
            events.map(hlsStreamProgressToBuffer).entries()
          )
          const objects = Object.fromEntries(events.entries())
          return { marbles, buffers, objects }
        })
    )
}

function arbMarbleDelay({ length = fc.integer({ min: 1, max: 100 }) } = {}) {
  return length.map((n) => '-'.repeat(n))
}

function arbTermSig(): Arbitrary<string> {
  return fc.constantFrom(
    'SIGABRT',
    'SIGALRM',
    'SIGBUS',
    'SIGEMT',
    'SIGFPE',
    'SIGHUP',
    'SIGILL',
    'SIGINT',
    'SIGIO',
    'SIGIOT',
    'SIGKILL',
    'SIGLOST',
    'SIGPIPE',
    'SIGPOLL',
    'SIGPROF',
    'SIGPWR',
    'SIGQUIT',
    'SIGSEGV',
    'SIGSTKFLT',
    'SIGSYS',
    'SIGTERM',
    'SIGTRAP',
    'SIGTTIN',
    'SIGTTOU',
    'SIGUNUSED',
    'SIGUSR1',
    'SIGUSR2',
    'SIGVTALRM',
    'SIGXCPU',
    'SIGXFSZ'
  )
}
