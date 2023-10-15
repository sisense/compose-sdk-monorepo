# Changelog

## [0.11.2] - 2023-10-12

### Changed
- Add props `count` and `offset` to `ExecuteQuery`, `useExecuteQuery`, `ExecuteQueryByWidgetId`, and `useExecuteQueryByWidgetId`
  to support pagination
- Upgrade `postcss` to from 8.4.22 to 8.4.31 to address a vulnerability
- Handle use case that SSO enabled in `SisenseContextProvider` but not enabled in the Sisense instance
- Replace component `HighchartsWrapper` with the official `HighchartsReact` wrapper component
  from `highcharts-react-official` package
- Improve styles of tooltips, `MemberFilterTile`, and `DateRangeFilterTile`
- Fix refresh of table in `DashboardWidget`
- Turn off tailwindcss Preflight (CSS normalization) and add explicit styles instead
- Fix issues with subtypes of Pie chart
- Return loading state from `useExecuteQuery` when params change
- Re-organize files in the `packages/sdk-ui/src/components` directory

## [0.11.1] - 2023-10-03

### Changed
- Fix an issue that hook `useExecuteQuery` does not re-run in some cases when input prop `filters` are updated
- Add `ScaterDataPoint` and event handlers for it to support additional data point structures
- Support rubber band selection for scatter chart

## [0.11.0] - 2023-09-28

### Added

- Add component `TreemapChart`
  and support Treemap chart type in components `Chart`, `ChartWidget`, and `DashboardWidget`
- Add component `DrilldownWidget`, which allows adding drilldown functionality to any type of chart

### Changed
- Refactor `HttpClient` to return raw response – in addition to JSON
- Support internationalization for numbers and improve tooltip consistency
- Make `dataSource` optional in `ChartWidgetProps` and `TableWidgetProps`
- Extend component `ExecuteQueryByWidgetId` and hook `useExecuteQueryByWidgetId`
  to support `filters`, `highlights`, and `filtersMergeStrategy`
- Extend hook `useExecuteQuery` to support boolean flag `enabled`
- Extend component `DashboardWidget` to support `filtersMergeStrategy`
- Move `markers`, `navigator`, `xAxis`, `yAxis`, and `yAxis2` out of `BaseStyleOptions`
  and into `BaseAxisStyleOptions`
- Bump `sisense-charts` version after fixing chart freeze on navigator update
- Improve styling of the Drilldown Breadcrumbs

## [0.10.0] - 2023-09-15

### Added

- Support React hook `useExecuteQueryByWidgetId` and component `ExecuteQueryByWidgetId`
  to execute a data query extracted from an existing widget in the Sisense instance.

### Changed
- **Breaking:** Remove `username` and `password` from `SisenseContextProviderProps`
- Fix axis min/max configuration
- Match number format in the `DashboardWidget` component
- Make `HighchartsOptions` importable from `@sisense/sdk-ui`
- Update supported react/react-dom versions in `peerDependencies`: `^16.14.0`, `^17.0.0`, or `^18.0.0`
- Rename directories and files to consistent kebab-case

## [0.9.0] - 2023-09-05

### Added

- Support `useExecuteQuery` hook to execute a data query.
  This approach, which offers an alternative to `ExecuteQuery` component,
  is similar to React Query's `useQuery` hook.
- Add CLI command `get-api-token` to generate an API token that can be used in `SisenseContextProviderProps`
- Extend `StyleOptions` with `width` and `height` props for controlling the size of a UI component
  such as `Chart` and `ChartWidget`

### Changed

- Mark `username` and `password` as `@deprecated` in `SisenseContextProviderProps`.
  This authentication method will be removed in future releases of Compose SDK.
  This change does not affect the username/password authentication supported by the CLI tool.
- Add prefix `csdk-` to all Tailwind CSS classes to avoid conflicts with user-defined classes
- Refactor common logic behind data-driven UI components into a higher-order component, `asSisenseComponent`
- Improve validation of data options for `Table` component
- Reorganize API reference (on sisense.dev) by splitting API items into individual files
  and group individual files by modules and types.

## [0.8.0] - 2023-08-15

### Added

- Add measures `trend` and `forecast` for advanced analytics.
  To use these measures, Sisense version of `L2023.6.0` or greater is required.
- Support data model representation in JavaScript by specifying `.js` output file in CLI commands
  – in addition to TypeScript (`.ts` output file)
- Detect and apply theme settings as defined in Web Access Token's payload – the `thm` claim

### Changed

- Display No Results overlay, instead of an error box, when there are no results to visualize
- Apply theme settings to component `DateRangeFilterTile`
- Migrate from `jest` to `vitest` for unit tests
- Produce only ESM bundle for `@sisense/sdk-ui` and target ES6 instead of default ES20221

## [0.7.4] - 2023-08-05

### Fixed

- Fix CLI usage tracking for Node.js 16

## [0.7.3] - 2023-08-03

### Changed

- Support usage tracking of CLI commands
- Support error tracking of UI components and CLI commands

## [0.7.2] - 2023-08-01

### Changed

- Update `README.md` and `quickstart.md` for beta release

## [0.7.1] - 2023-07-29

### Changed

- Clean up internal code references for beta release

## [0.7.0] - 2023-07-29

### Changed

- Support GitHub CI

## [0.6.0] - 2023-07-28

### Added

- Support usage tracking of all UI components

### Changed
- **Breaking:** Rename component `TableChart` to `Table`. Related props are also renamed accordingly.
- **Breaking:** Rename component `Widget` to `ChartWidget`. Related props are also renamed accordingly.
- Refactor `DateRangeFilterTile` to use `react-datepicker` instead of `@mui/x-date-pickers`, `@mui/x-date-pickers-pro`

## [0.5.1] - 2023-07-25

### Added
- Add `LICENSE.md`

## [0.4.0] - 2023-07-25

### Added

- Support usage tracking of component `Widget` 
- Support usage tracking of REST API calls to a Sisense instance

### Changed

- Support partial assignment of the `StyleOptions` and `ThemeSettings` properties
- Fix issues with Web Access Token authentication
- Bundle `@sisense/sisense-charts`, which is a React wrapper of `highcharts`, 
with `@sisense/sdk-ui` 
- Bundle `@sisense/task-manager` with `@sisense/sdk-query-client`

## [0.3.0] - 2023-07-13

### Changed

- Bump `highcharts` from 6.x to 10.x

## [0.2.0] - 2023-07-11

### Added

- Support `Widget` header styles
- Support aggregation in `TableChart`

## [0.1.0] - 2023-07-06
_Initial release._
