# Changelog

## [0.8.0] - 2023-08-15

### Added

- Add measures `trend` and `forecast` for advanced analytics
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
