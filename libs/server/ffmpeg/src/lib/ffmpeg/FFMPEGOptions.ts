/**
 * Standard options for configuring FFMPEG processes.
 * @see {@link FFMPEG_DEFAULTS} for default options.
 */
export interface FFMPEGOptions {
  banner?: boolean
  stats?: boolean
  progress?: boolean
  live?: boolean
}

export function getFFMPEGArgs({banner, stats, progress, live}: FFMPEGOptions): string[] {
  const result: string[] = []
  if (!banner) {
    result.push('-hide_banner')
  }
  if (!stats) {
    result.push('-nostats')
  }
  if (progress) {
    result.push('-progress', 'pipe:1')
  }
  if (live) {
    result.push('-re')
  }
  return result
}

/**
 * Default options ({@link FFMPEGPublishOptions}) for FFMEPG processes.
 *
 * {@includeCode FFMPEGPublishOptions.ts#FFMPEG_DEFAULTS}
 */
// #region FFMPEG_DEFAULTS
export const FFMPEG_DEFAULTS: Required<FFMPEGOptions> = {
  banner: false,
  stats: false,
  progress: false,
  live: false
}
// #endregion FFMPEG_DEFAULTS
