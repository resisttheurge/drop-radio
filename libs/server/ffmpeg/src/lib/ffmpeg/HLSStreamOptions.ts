export interface HLSStreamFormat {
  readonly name: string
  readonly bitrate: string
  readonly sampleRate: string
}

export interface HLSStreamOptions {
  readonly formats?: HLSStreamFormat[]
  readonly seekTime?: string
  readonly segmentDuration?: number
  readonly segmentCount?: number
  readonly masterPlaylistName?: string
  readonly segmentFileNameSuffix?: string
  readonly playlistName?: string
}

export const defaults: Required<HLSStreamOptions> = {
  formats: [
    { name: '01_highest', bitrate: '1.528M', sampleRate: '96k' },
    { name: '02_high', bitrate: '640k', sampleRate: '48k' },
    { name: '03_medium', bitrate: '128k', sampleRate: '24k' },
    { name: '04_low', bitrate: '32k', sampleRate: '12k' },
    { name: '05_lowest', bitrate: '12k', sampleRate: '7350' },
  ],
  seekTime: '0',
  segmentDuration: 2,
  segmentCount: 4,
  masterPlaylistName: '00_stream',
  segmentFileNameSuffix: '',
  playlistName: 'stream',
}
