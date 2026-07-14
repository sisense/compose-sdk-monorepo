/**
 * `@sisense/sdk-ui/query` sub-bundle.
 *
 * Exports the `query` module and all query-sending functionality, and nothing else —
 * no charts, widgets, dashboards, maps, or drag-and-drop code is included.
 * The root `@sisense/sdk-ui` entry re-exports this module, so both expose the same
 * query functionality.
 */
export * from './public-api';
