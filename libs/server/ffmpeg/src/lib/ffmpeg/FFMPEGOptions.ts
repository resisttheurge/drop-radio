/**
 * Standard options for configuring FFMPEG processes.
 * @see {@link FFMPEG_DEFAULTS} for default options.
 */
export interface FFMPEGOptions {
  hide_banner?: boolean
  progress?: 'pipe:1' | 'pipe:2' | string
  stats?: boolean
  stats_period?: number
}

export type FFMPEGOption<K extends keyof FFMPEGOptions = keyof FFMPEGOptions> =
  [K, FFMPEGOptions[K]]

export function getFFMPEGArgs({
  hide_banner,
  progress,
  stats,
  stats_period,
}: FFMPEGOptions): string[] {
  const result: string[] = []
  if (hide_banner) {
    result.push('-hide_banner')
  }
  if (!stats) {
    result.push('-nostats')
  }
  if (progress) {
    result.push('-progress', progress)
  }
  if (stats_period) {
    result.push('-stats_period', stats_period.toString())
  }
  return result
}

/**
 * Default options ({@link FFMPEGOptions}) for FFMEPG processes.
 *
 * {@includeCode FFMPEGOptions.ts#FFMPEG_DEFAULTS}
 */
// #region FFMPEG_DEFAULTS
export const FFMPEG_DEFAULTS: Required<FFMPEGOptions> = {
  hide_banner: true,
  progress: 'pipe:1',
  stats: false,
  stats_period: 0.5,
}
// #endregion FFMPEG_DEFAULTS
