import path from 'node:path'

/**
 * Fastify .register() options for the library plugin
 */
export interface LibraryOptions {
  /**
   * Root directory to scan for media files in the library
   */
  readonly mediaDir: string

  /**
   * Root directory to store metadata and cache files.
   *
   * Defaults to {@link mediaDir}
   */
  readonly cacheDir?: string

  /**
   * File to save file scan list to.
   *
   * Defaults to `${`{@link cacheDir|`cacheDir`}`}/library.manifest`
   */
  readonly manifestFile?: string

  /**
   * File to save hash digest to
   *
   * Defaults to `${`{@link cacheDir|`cacheDir`}`}/library.digest`
   */
  readonly digestFile?: string

  /**
   * File to save hash digest to
   *
   * Defaults to `${`{@link cacheDir|`cacheDir`}`}/library.json`
   */
  readonly metadataFile?: string

  /**
   * Minimum interval for a full directory scan
   */
  readonly scanInterval?: number

  /**
   * Max length of time a full directory scan is allowed to run
   */
  readonly scanTimeout?: number

  /**
   * Number of times a full directory scan can be retried
   */
  readonly scanRetries?: number

  /**
   * Whether to watch the directory for changes
   */
  readonly watch?: boolean

  /**
   * Specific files and glob patterns to include in the library.
   * All paths are relative to the {@link rootDirectory}
   * If no files or patterns are included explicitly, all file paths in
   * the root directory are considered included.
   * The library manifest file is automatically included.
   */
  readonly include?: string | string[]

  /**
   * Specific files and glob patterns to exclude from the library.
   * All paths are relative to the {@link rootDirectory}
   * Excluded paths take precedence over {@link include}d ones.
   * Special paths (digest and metadata files)
   * used by the plugin are automatically excluded
   */
  readonly exclude?: string | string[]
}

export class ResolvedLibraryOptions implements Required<LibraryOptions> {
  constructor(
    _options: LibraryOptions,
    readonly mediaDir = path.resolve(_options.mediaDir),
    readonly cacheDir = path.resolve(_options.cacheDir ?? mediaDir),
    readonly manifestFile = path.resolve(
      cacheDir,
      _options.manifestFile ?? 'library.manifest'
    ),
    readonly digestFile = path.resolve(
      cacheDir,
      _options.digestFile ?? 'library.digest'
    ),
    readonly metadataFile = path.resolve(
      cacheDir,
      _options.metadataFile ?? 'library.json'
    ),
    readonly scanInterval = _options.scanInterval ?? 5000,
    readonly scanRetries = _options.scanRetries ?? 3,
    readonly scanTimeout = _options.scanTimeout ?? 1500,
    readonly watch = _options.watch ?? true,
    readonly include = [
      manifestFile,
      ...(Array.isArray(_options.include)
        ? _options.include
        : [_options.include ?? '*.*']
      ).map((glob) => path.resolve(mediaDir, glob)),
    ],
    readonly exclude = [
      digestFile,
      metadataFile,
      ...(Array.isArray(_options.exclude)
        ? _options.exclude
        : _options.exclude !== undefined
        ? [_options.exclude]
        : []
      ).map((glob) => path.resolve(mediaDir, glob)),
    ]
  ) {}
}
