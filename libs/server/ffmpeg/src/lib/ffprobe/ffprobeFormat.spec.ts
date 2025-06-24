import child_process, { ChildProcess } from 'node:child_process'

import { fc, it } from '@fast-check/jest'
import { Mock, mock } from 'ts-jest-mocker'

import { ffprobeFormat } from './ffprobeFormat'
import { FFProbeError } from './FFProbeError'
import { Arbitrary } from 'fast-check'
import { FFProbeResult } from './FFProbeResult'
import { Readable } from 'node:stream'

jest.mock('node:child_process')

describe('ffprobeFormat', () => {
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

  beforeEach(() => {
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
  })

  afterEach(() => {
    jest.resetAllMocks()
    processCallbackMap.clear()
    stdoutCallbackMap.clear()
    stderrCallbackMap.clear()
  })

  it.prop([fc.string()])(
    'spawns a child process with expected arguments',
    async (input) => {
      ffprobeFormat(input)

      expect(mock_child_process.spawn).toHaveBeenCalledWith('ffprobe', [
        '-hide_banner',
        '-show_format',
        '-of',
        'json=c=1',
        input,
      ])
    }
  )

  it.prop({
    input: fc.string(),
    ffprobeResult: arbFFProbeResult(),
  })(
    'resolves with parsed JSON output on success',
    async ({ input, ffprobeResult }) => {
      const resultPromise = ffprobeFormat(input)

      mockStdout.emit('data', Buffer.from(JSON.stringify(ffprobeResult)))
      mockProcess.emit('close', 0, null)

      expect(resultPromise).resolves.toEqual(ffprobeResult)
    }
  )

  it.prop({
    input: fc.string(),
    jsonError: fc.anything(),
  })(
    'rejects with FFProbeError on JSON parse error',
    async ({ input, jsonError }) => {
      jest.spyOn(JSON, 'parse').mockImplementation(() => {
        throw jsonError
      })

      const resultPromise = ffprobeFormat(input)

      mockProcess.emit('close', 0, null)

      expect(resultPromise).rejects.toBeInstanceOf(FFProbeError)
      expect(resultPromise).rejects.toThrow(
        'Failed to parse ffprobe output as JSON'
      )
      expect(resultPromise).rejects.toHaveProperty('cause', jsonError)
    }
  )

  it.prop({
    input: fc.string(),
    exitCode: fc.integer({ min: 1 }),
    stderrContents: fc.string(),
  })(
    'rejects with FFProbeError on non-zero exit code',
    async ({ input, exitCode, stderrContents }) => {
      const resultPromise = ffprobeFormat(input)

      mockStderr.emit('data', Buffer.from(stderrContents))
      mockProcess.emit('close', exitCode, null)

      expect(resultPromise).rejects.toBeInstanceOf(FFProbeError)
      expect(resultPromise).rejects.toThrow(
        `ffprobe exited with code ${exitCode}`
      )
      expect(resultPromise).rejects.toHaveProperty('cause', stderrContents)
    }
  )

  it.prop({
    input: fc.string(),
    signal: arbTermSig(),
  })(
    'rejects with FFProbeError on process termination by signal',
    async ({ input, signal }) => {
      const resultPromise = ffprobeFormat(input)

      mockProcess.emit('close', null, signal)

      expect(resultPromise).rejects.toBeInstanceOf(FFProbeError)
      expect(resultPromise).rejects.toThrow(
        `ffprobe process was terminated by signal ${signal}`
      )
      expect(resultPromise).rejects.toHaveProperty('cause', signal)
    }
  )

  it.prop({
    input: fc.string(),
    error: fc.anything(),
  })('rejects with FFProbeError on "error" event', async ({ input, error }) => {
    const resultPromise = ffprobeFormat(input)

    mockProcess.emit('error', error)

    expect(resultPromise).rejects.toBeInstanceOf(FFProbeError)
    expect(resultPromise).rejects.toThrow('ffprobe child process failed')
    expect(resultPromise).rejects.toHaveProperty('cause', error)
  })
})

interface ArbFFProbeResultConstraints {
  format?: Arbitrary<FFProbeResult['format']>
}

function arbFFProbeResult({
  format = fc.option(arbFFProbeFormat()),
}: ArbFFProbeResultConstraints = {}): Arbitrary<FFProbeResult> {
  return fc.record({
    format,
  })
}

interface ArbFFProbeFormatConstraints {
  filename?: Arbitrary<string>
  nb_streams?: Arbitrary<number>
  nb_programs?: Arbitrary<number>
  nb_stream_groups?: Arbitrary<number>
  format_name?: Arbitrary<string>
  format_long_name?: Arbitrary<string>
  duration?: Arbitrary<string>
  size?: Arbitrary<string>
  bit_rate?: Arbitrary<string>
  probe_score?: Arbitrary<number>
}

function arbFFProbeFormat({
  filename = fc.string(),
  nb_streams = fc.nat(),
  nb_programs = fc.nat(),
  nb_stream_groups = fc.nat(),
  format_name = fc.string(),
  format_long_name = fc.string(),
  duration = fc.float({ min: 0.0 }).map((n) => n.toString()),
  size = fc.nat().map((n) => n.toString()),
  bit_rate = fc.nat().map((n) => n.toString()),
  probe_score = fc.nat(100),
}: ArbFFProbeFormatConstraints = {}): Arbitrary<
  Required<FFProbeResult>['format']
> {
  return fc.record({
    filename,
    nb_streams,
    nb_programs,
    nb_stream_groups,
    format_name,
    format_long_name,
    duration,
    size,
    bit_rate,
    probe_score,
  })
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
