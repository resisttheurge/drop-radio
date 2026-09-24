import Icon from '@expo/vector-icons/Ionicons'
import { useMemo } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import Neu from '@drop-radio/neumorphism'

import { Status } from './status'

export interface StreamControlProps {
  lightAngle: number
  active: boolean
  status: Status
  onPress: () => void
}

export default function StreamControl({
  lightAngle,
  active,
  status,
  onPress,
}: StreamControlProps) {
  const icon = useMemo(() => {
    switch (status) {
      case 'playing':
        return <Icon size={15} name="pause" />
      case 'paused':
        return <Icon size={15} name="play" />
      case 'waiting':
        return <Icon size={15} name="refresh" />
    }
  }, [status])

  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles.button,
        active ? styles.buttonActive : styles.buttonDormant,
      ]}
      onPress={onPress}
    >
      <Neu angle={lightAngle} intensity={15} curvature="convex" slant extrude>
        {icon}
      </Neu>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    transitionProperty: 'opacity',
    transitionDuration: '200ms',
  },
  buttonDormant: {
    opacity: 0.15,
  },
  buttonActive: {
    opacity: 0.75,
  },
})
