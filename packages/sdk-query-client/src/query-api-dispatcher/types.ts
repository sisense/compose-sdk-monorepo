/**
 * System setting that controls whether field search should use display names.
 * Sourced from `api/v1/settings/system` JSON key `displayName`, exposed in CSDK as
 * `displayNameConfig`.
 *
 * @sisenseInternal
 */
export type DisplayNameConfig = {
  enabled?: boolean;
  useNewSearchByDisplayNameApi?: boolean;
};

/**
 * Options for {@link QueryApiDispatcher.getDataSourceFields}.
 *
 * @sisenseInternal
 */
export type GetDataSourceFieldsOptions = {
  count?: number;
  offset?: number;
  /** Search term sent as POST body `term` (Fusion data browser). */
  term?: string;
  /**
   * Whether the datasource is live. Required for the displayName field-search path
   * (`searchByDisplayName?isLive=`). When omitted and that path is selected, the
   * dispatcher resolves it via {@link QueryApiDispatcher.getDataSourceByTitle}.
   */
  live?: boolean;
  /** When both flags are true, uses `fields/searchByDisplayName` instead of `fields/search`. */
  displayNameConfig?: DisplayNameConfig;
};
