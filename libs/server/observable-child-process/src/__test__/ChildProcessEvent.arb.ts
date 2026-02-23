import {
  anything,
  Arbitrary,
  nat,
  oneof,
  record,
  string,
  tuple,
} from 'fast-check'

import arbBuffer from './Buffer.arb'
import MockChildProcessEvent, {
  CloseEvent,
  ErrorEvent,
  StderrEvent,
  StdoutEvent,
} from './ChildProcessEvent.mock'
import arbSignal from './Signals.arb'

interface BaseEventConstraints {
  streamValues?: Arbitrary<string | Buffer>[]
}

export interface StdoutEventConstraints extends BaseEventConstraints {
  noStderr?: boolean
}

export function arbStdoutEvent({
  streamValues = [string(), arbBuffer()],
  noStderr = false,
}: StdoutEventConstraints = {}): Arbitrary<StdoutEvent> {
  return record(
    {
      stdout: oneof(...streamValues),
      ...(noStderr ? {} : { stderr: oneof(...streamValues) }),
    },
    { requiredKeys: ['stdout'] }
  )
}

export interface StderrEventConstraints extends BaseEventConstraints {
  noStdout?: boolean
}

export function arbStderrEvent({
  streamValues = [string(), arbBuffer()],
  noStdout = false,
}: StderrEventConstraints = {}): Arbitrary<StderrEvent> {
  return record(
    {
      stderr: oneof(...streamValues),
      ...(noStdout ? {} : { stdout: oneof(...streamValues) }),
    },
    { requiredKeys: ['stderr'] }
  )
}

export interface ErrorEventConstraints
  extends StdoutEventConstraints,
    StderrEventConstraints {
  errorValues?: Arbitrary<Error>[]
}

export function arbErrorEvent({
  errorValues = [
    tuple(string(), anything()).map(
      ([msg, cause]) => new Error(msg, { cause })
    ),
  ],
  streamValues = [string(), arbBuffer()],
  noStdout = false,
  noStderr = false,
}: ErrorEventConstraints = {}): Arbitrary<ErrorEvent> {
  return record(
    {
      error: oneof(...errorValues),
      ...(noStdout ? {} : { stdout: oneof(...streamValues) }),
      ...(noStderr ? {} : { stderr: oneof(...streamValues) }),
    },
    { requiredKeys: ['error'] }
  )
}

export interface CloseEventConstraints
  extends StdoutEventConstraints,
    StderrEventConstraints {
  closeValues?: Arbitrary<number | NodeJS.Signals>[]
}

export function arbCloseEvent({
  closeValues = [nat(), arbSignal()],
  streamValues = [string(), arbBuffer()],
  noStdout = false,
  noStderr = false,
}: CloseEventConstraints = {}): Arbitrary<CloseEvent> {
  return record(
    {
      close: oneof(...closeValues),
      ...(noStdout ? {} : { stdout: oneof(...streamValues) }),
      ...(noStderr ? {} : { stderr: oneof(...streamValues) }),
    },
    { requiredKeys: ['close'] }
  )
}

export interface MockChildProcessEventConstraints {
  events?: Arbitrary<MockChildProcessEvent>[]
}

export function arbMockChildProcessEvent({
  events = [
    string(),
    arbBuffer(),
    arbStdoutEvent(),
    arbStderrEvent(),
    arbErrorEvent(),
    arbCloseEvent(),
  ],
}: MockChildProcessEventConstraints = {}): Arbitrary<MockChildProcessEvent> {
  return oneof(...events)
}

export default arbMockChildProcessEvent
