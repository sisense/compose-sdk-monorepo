/**
 * Entry point of `@sisense/sdk-ui/internal`.
 *
 * APIs tagged `@internal`, for Compose SDK cross-package use only (the framework wrappers reach
 * them through `@sisense/sdk-ui-preact/internal`). Not part of the public contract; may change
 * without notice.
 */
export * from './public-api/internal';
// The `query` module's internal tier (`queryStateReducer` and others), used by the framework
// wrappers. Re-exported here for now; long term the module serves it from a sub-entry of its own
// (`@sisense/sdk-ui/query/internal`).
export * from '../query/public-api/internal';
