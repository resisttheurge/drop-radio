import { ChildProcess } from 'node:child_process'
import { Readable } from 'stream'

import { mock, Mock } from 'ts-jest-mocker'

jest.mock('node:child_process')

export function mockChildProcess(): Mock<ChildProcess> {
  const processCallbackMap: Map<
    Parameters<ChildProcess['on']>[0],
    ((...args: unknown[]) => void)[]
  > = new Map()
  const mockProcess = mock(ChildProcess)
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
  mockProcess.listeners.mockImplementation((event) => {
    return (
      processCallbackMap.get(event as Parameters<ChildProcess['on']>[0]) ?? []
    )
  })

  const stdoutCallbackMap: Map<
    Parameters<Readable['on']>[0],
    ((...args: unknown[]) => void)[]
  > = new Map()
  const mockStdout = mock(Readable)
  mockStdout.on.mockImplementation((event, cb) => {
    stdoutCallbackMap.set(event, [...(stdoutCallbackMap.get(event) ?? []), cb])
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
  mockStdout.listeners.mockImplementation((event) => {
    return stdoutCallbackMap.get(event as Parameters<Readable['on']>[0]) ?? []
  })
  Object.defineProperty(mockProcess, 'stdout', {
    get: () => mockStdout,
  })

  const stderrCallbackMap: Map<
    Parameters<Readable['on']>[0],
    ((...args: unknown[]) => void)[]
  > = new Map()
  const mockStderr = mock(Readable)
  mockStderr.on.mockImplementation((event, cb) => {
    stderrCallbackMap.set(event, [...(stderrCallbackMap.get(event) ?? []), cb])
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
  mockStderr.listeners.mockImplementation((event) => {
    return stderrCallbackMap.get(event as Parameters<Readable['on']>[0]) ?? []
  })
  Object.defineProperty(mockProcess, 'stderr', {
    get: () => mockStderr,
  })

  return mockProcess
}

export default mockChildProcess
