import { Observable } from 'rxjs'

export type RxProcess<
  Out = never,
  Err = never,
  Catch = never,
  Close = never
> = Observable<Out | Err | Catch | Close>
