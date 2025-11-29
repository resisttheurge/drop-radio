import { useEffect, useMemo, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import {
  Observable,
  startWith,
  switchMap,
  throttleTime,
  withLatestFrom,
} from 'rxjs'

function fromAnimatedValue(value: Animated.Value): Observable<number> {
  return new Observable((subscriber) => {
    const id = value.addListener(({ value }) => {
      subscriber.next(value)
    })
    return () => {
      value.removeListener(id)
    }
  })
}

function fromAnimation(
  animation: Animated.CompositeAnimation
): Observable<boolean> {
  return new Observable((subscriber) => {
    animation.start(({ finished }) => {
      subscriber.next(finished)
      subscriber.complete()
    })
    return () => {
      animation.stop()
    }
  })
}

export function useRotation() {
  const rpm = useRef(new Animated.Value(0)).current
  const rawRotation = useRef(new Animated.Value(0)).current
  const rotation = useMemo(() => Animated.modulo(rawRotation, 1), [rawRotation])

  const animation$ = useMemo(
    () =>
      fromAnimatedValue(rpm).pipe(
        startWith(0),
        throttleTime(222),
        withLatestFrom(fromAnimatedValue(rawRotation).pipe(startWith(0))),
        switchMap(([rpmValue, lastRawRotationValue]) => {
          const modValue = lastRawRotationValue % 1
          rawRotation.setValue(modValue)
          const animation = Animated.timing(rawRotation, {
            toValue: rpmValue > 0 ? modValue + 1 : modValue - 1,
            duration: rpmValue > 0 ? 60000 / rpmValue : 0,
            easing: Easing.linear,
            useNativeDriver: true,
          })
          return fromAnimation(Animated.loop(animation))
        })
      ),
    [rpm, rawRotation]
  )

  useEffect(() => {
    const subscription = animation$.subscribe()
    return () => {
      subscription.unsubscribe()
    }
  }, [animation$])

  return { rpm, rotation }
}
