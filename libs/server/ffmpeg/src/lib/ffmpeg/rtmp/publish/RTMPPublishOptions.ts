import {
  FFMPEG_DEFAULTS,
  FFMPEGOptions,
  getFFMPEGArgs,
} from '../../FFMPEGOptions'

/**
 * Options for configuring HLS streaming.
 * @see {@link HLS_STREAM_DEFAULTS} for default options.
 */
export interface RTMPPublishOptions extends FFMPEGOptions {
  videoCodec: string
  videoProfile: string,
  audioCodec: string,
  audioSamplerate: string
}

export function getRTMPPublishArgs(options: RTMPPublishOptions): string[] {
  const result: string[] = []
  result.push(...getFFMPEGArgs(options))
  return result
}

/**
 * Default options ({@link RTMPPublishOptions}) for HLS streaming.
 *
 * {@includeCode RTMPPublishOptions.ts#HLS_STREAM_DEFAULTS}
 */
// #region HLS_STREAM_DEFAULTS
export const RTMP_PUBLISH_DEFAULTS: Required<RTMPPublishOptions> = {
  ...FFMPEG_DEFAULTS,
}
// #endregion HLS_STREAM_DEFAULTS
