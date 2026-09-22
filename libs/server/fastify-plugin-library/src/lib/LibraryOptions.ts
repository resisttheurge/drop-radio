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
   */
  readonly include?: string | string[]

  /**
   * Specific files and glob patterns to exclude from the library.
   * All paths are relative to the {@link rootDirectory}
   * Excluded paths take precedence over {@link include}d ones.
   * Special paths (`library.manifest`, `library.manifest.checksum`, and `library.metadata.json`)
   * used by the plugin are automatically excluded when {@link cacheDir} is not set
   */
  readonly exclude?: string | string[]
}
