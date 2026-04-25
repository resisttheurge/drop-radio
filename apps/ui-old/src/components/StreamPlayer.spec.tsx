import React from 'react'
import { render } from '@testing-library/react-native'

import StreamPlayer from './StreamPlayer'

describe('StreamPlayer', () => {
  it('should render successfully', () => {
    const { root } = render(<StreamPlayer />)
    expect(root).toBeTruthy()
  })
})
