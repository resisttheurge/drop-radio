import { ffmpeg } from './ffmpeg'

describe('ffmpeg', () => {
  it('should work', () => {
    expect(ffmpeg()).toEqual('ffmpeg')
  })
})
