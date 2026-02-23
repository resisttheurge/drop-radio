export type ChildProcessEvent =
  | string
  | Buffer
  | Error
  | StdoutEvent
  | StderrEvent
  | ErrorEvent
  | CloseEvent

export interface StdoutEvent {
  stdout: string | Buffer
}

export interface StderrEvent {
  stderr: string | Buffer
}

export interface ErrorEvent {
  error: Error
}

export interface CloseEvent {
  close: number | NodeJS.Signals
}

export default ChildProcessEvent
