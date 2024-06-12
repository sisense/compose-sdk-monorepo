# Changelog

## [1.12.0] - 2024-06-11

### Added
- Add `DashboardModel` class and implement `getDashboardProps` hook for internal testing
- Add `Dashboard` and `DashboardById` components for internal testing
- Extend `DashboardModel` to support cascading filters
- Export `useLastNlqResponse` hook for extracting NLQ (Natural Language Query) response
- Add tiled version of `DateRangeFilterTile`
- Add support for Common JS in `sdk-data` and `sdk-ui` packages

### Changed
- Make Chatbot tooltip style and data topics customizable
- Minor tweaks and UI improvements for `Chatbot` component
- Enable Angular v18 support for `sdk-ui-angular` package

## [1.11.0] - 2024-05-28

### Added
- Add React component `AreaRangeChart` (beta)
- Extend component `Chart` and `ChartWidget` to support chart type `table`
- Add highlight filters support for the `PivotTable` and `DashboardWidget` components, as well as for the useGetWidgetModel hook.
- Add React component `FiltersPanel` for internal testing
- Add generic `useFetch` Vue composable to call any Sisense REST endpoint

### Changed
- Mark `headersColor`, `alternatingColumnsColor`, and `alternatingRowsColor` as `@deprecated` in `TableStyleOptions` – use `header.color`, `columns.alternatingColor`, and `rows.alternatingColor` instead
- Support pie chart of multiple values and no category
- Support boolean flag `ungroup` for JAQL queries with no aggregation
- Make UI improvements: error messages for unsupported functionality in `BoxplotChart` and chart redraw on highlights deselect
- Make improvements to AI chat to code (internal)
- Move the `@sisense/sdk-ui-vue` package from beta to General Availability (GA)
- Move components `AreamapChart`, `ScattermapChart`, and `BoxplotChart` from beta to General Availability (GA)
- Move component `PivotTable` and hook `useExecutePivotQuery` from alpha to beta
- Move AI components and hooks from private beta to beta

## [1.10.1] - 2024-05-10

### Changed
- Fix an issue with CLI command `get-data-model` caused by React upgrade

## [1.10.0] - 2024-05-09

### Added
- Implement `WidgetService.getWidgetModel()` in `@sisense/sdk-angular`

### Changed
- Adjust `@mui` and `@emotion` packages in `@sisense/sdk-ui` to work with React 17
- Refactor `Chart` to simplify steps of adding new chart types
- Upgrade `@sisense/sisense-charts` to 5.1.1
- Make improvements to the AI components and hooks (private beta): toggleable insights

## [1.9.0] - 2024-05-02

### Added
- Add pivot table support to `DashboardWidget` and `WidgetModel`
- Extend `PivotTable` to support additional style options
- Add internal `ContentPanel` component for rendering a layout of widgets
- Add extra factory functions for measure filters: `measureEquals`, `measureGreaterThan`, and `measureLessThan`

### Changed
- Reduce the bundle size of `@sisense/sdk-ui`
- Extend CLI command `get-data-model` to include field descriptions in the generated data model file.
  _Note: User account of role 'Data Designer' and above is required to include field descriptions_
- Upgrade `sisense-charts` to prevent jQuery patching by Highcharts
- Fix pivot types to prevent build errors in Angular 17
- Fix missing values in drilldown breadcrumbs of categorical charts
- Improve the translation of filter JAQL to `Filter` objects
- Make improvements to the AI components and hooks (private beta): theme settings, style customizations, insight customization, chatbot header, and dropup for recent queries/suggestions

## [1.8.0] - 2024-04-15

### Added
- Add pivot sorting interface for component `PivotTable` and hook `useExecutePivotQuery`

### Changed
- Fix boxplot outliers factory functions to prevent loading of redundant data points
- Make improvements to the AI components and hooks (private beta)
- Improve translation of AI chats to charts and code for internal testing.

## [1.7.2] - 2024-04-09

### Changed
- Fix `includeWidgets` option in `useGetDashboardModel` for non-admin users
- Support theme settings in `ErrorBoundary` UI component
- Make improvements to the AI components and hooks (private beta)

## [1.7.1] - 2024-04-03

### Changed
- Extend `appConfig` with boolean flag `accessibilityConfig.enabled` to toggle accessibility support in Highcharts

## [1.7.0] - 2024-04-03

### Added
- Support caching of query execution (alpha)
- Extend the `PivotTable` component (alpha) to support
  UI sorting, date and number formatting, and dynamic sizing
- Add generic `useFetch` React hook to call any Sisense REST endpoint
- Add Typedoc plugin `@sisense/typedoc-plugin-markdown` (forked from `tgreyuk/typedoc-plugin-markdown` version `4.0.0-next.20`)

### Changed
- Enable accessibility support in Highcharts
- Extend `appConfig` (in Sisense context) to support the `queryLimit` property
- Fix the issue with Indicator chart not using theme colors
- Fix issues with `PieChart`: highlights and convolution animation
- Make improvements to the AI components and hooks (private beta)
- Move the `@sisense/sdk-ui-angular` package from beta to General Availability (GA)

## [1.6.0] - 2024-03-20

### Added
- Support simple pivot tables and gracefully handle unsupported widgets
in hooks `useGetDashboardModel`, `useGetDashboardModels`, `useExecuteQueryByWidgetId` and component `DashboardWidget`
- Implement translation of AI chats to charts and code for internal testing.

### Changed
- Update CLI command `get-data-model` to support data model whose table names starting with a number
- Remove global scrollbar CSS in `PivotTable`
- Simplify the handling of `N/A` values in charts
- Remove redundant info in the tooltip of combo chart
- Make improvements to the AI components and hooks (private beta)

## [1.5.0] - 2024-03-05

### Changed
- Improve the AI components and hooks (private beta)
- Extend CLI command `get-data-model` to
  include additional metadata about Live data models for JAQL optimization.
  _Note: If you are using Live models, you need to re-run `get-data-model` to update the data model representation files._
- Optimize the `useExecuteQuery` hook by removing unnecessary render
- Improve loading indicator on chart re-fetch triggered by aggregation change
- Fix number formatting in `DashboardWidget` and `useGetWidgetModel`
- Make small fixes in components `Table` (sorting icons) and
  `IndicatorChart` (rendering of `N/A` and `0` values)

## [1.4.1] - 2024-02-23

### Changed
- Limit max zoom for `AreamapChart`

## [1.4.0] - 2024-02-22

### Added
- Implement additional components and hooks in `@sisense/sdk-ui-vue` package for public beta testing
- Add component `PivotTable` (alpha) for React, Angular, and Vue

### Changed
- **Breaking:** Refactor `ScattermapChartDataOptions.geo` (beta) to use `StyledColumn`, instead `ScattermapColumn` (removed).
  Prop `ScattermapColumn.level` has been replaced with `StyledColumn.geoLevel`
- Support HTML content in component `Table`
- Support theme settings for `IndicatorChart` in ticker mode
- Extend `StyledMeasureColumn` with `seriesStypeOptions` to support different series of different chart types
- Make improvements to `Chart` (refactoring and chart labels), `AreaChart` (sticky tracking), `NumberFormatConfig` (optional props),
  testing infrastructure (adoption of `msw` for mocks), and exports of packages (for both CommonJS and ESM imports)
- Make improvements to the AI components and hooks (private beta)

## [1.3.0] - 2024-02-07

### Added
- Implement additional components and hooks in `@sisense/sdk-ui-vue` package for internal testing
- Support filter relations (logic operators `and` and `or`) for `DashboardWidget` and `useExecuteQueryByWidgetId`

### Changed
- Show loading indicator on chart data re-fetch
- Extend component `IndicatorChart` to support ticker mode (prop param `forceTickerView`) regardless of the display size
- Extend component `MemberFilterTile` to add indication of inactive members
- Support `onDataPointClick` prop for `AreamapChart`
- Refactor to reuse `WidgetModel` in `DashboardWidget` and `useExecuteQueryByWidgetId`
- Make minor improvements to chart navigator, i18n translations, and SSO flow.

## [1.2.0] - 2024-01-24

### Added
- Add React hook `useExecutePivotQuery` (alpha) to execute a pivot data query and return the result in both table and tree structures
- Implement additional components and hooks in `@sisense/sdk-ui-vue` package for internal testing

### Changed
- Re-export common types of `sdk-ui` from `sdk-ui-angular`
- Support coordinates via user-provided data for `ScattermapChart`
- Make improvements to the AI `Chatbot` component including format of chat messages,
  the question recommendations, and the mapping from NLQ response to chart's axes
- Improve the SSO flow by checking the redirect completion,
  skipping the fetch of color palette, and adding null check for the `window` object

## [1.1.0] - 2024-01-10

### Added
- Add component `AreamapChart`
  and support the `areamap` chart type in components `Chart`, `ChartWidget`, and `DashboardWidget` for beta testing
- Mark `@sisense/sdk-ui-angular` package as ready for public beta testing
- Implement additional components and hooks in `@sisense/sdk-ui-vue` package for internal testing

### Changed
- **Breaking:** Rename `ScattermapChartDataOptions.locations` to `ScattermapChartDataOptions.geo` for `ScattermapChart` (beta)
- Make minor improvements to chart legend position type, xAxis gridlines, and filter relations.

## [1.0.0] - 2023-12-27

### Added
- Publish `@sisense/sdk-ui-vue` and related dependencies to NPM registry for internal testing.
- Add component `ScattermapChart`
  and support the `scattermap` chart type in components `Chart`, `ChartWidget`, and `DashboardWidget` for beta testing
- Add component `BoxplotChart`
  and support the `boxplot` chart type in components `Chart`, `ChartWidget`, and `DashboardWidget` for beta testing
- Support filter relations (logic operators `and` and `or`) for beta testing
- Add UI component `RelativeDateFilterTile`

### Changed
- **Breaking:** Refactor `ExecuteQuery` and `ExecuteQueryByWidgetId` to return `QueryState` and `QueryByWidgetIdState`, respectively
- **Breaking:** Rename type alias `StyleOptions` to `ChartStyleOptions`
- **Breaking:** Combine prop `widgetStyleOptions` into `styleOptions` for `ChartWidget` and `DashboardWidget`
- **Breaking:** Rename type `IndicatorDataOptions` to `IndicatorChartDataOptions`
- **Breaking:** Rename namespace `measures` to `measureFactory` and namespace `filters` to `filterFactory`

_See [migration guide](./guides/migration-guide-1.0.0.md) for more details._

## [0.16.0] - 2023-12-12

### Added
- Add React hook `useExecuteCsvQuery` to execute a data query and return the result in CSV format
- Add React hook `useGetWidgetModel` to retrieve a dashboard widget from the Sisense instance

### Changed
- Fix `ChartWidget` rendering issue when updating filters
- Adjust the SSO authentication flow to not show error while waiting for SSO redirect
- Fix named export error in `@sisense/sdk-cli`
- Adjust the range of axes when `treatNullAsZero` is enabled for time series
- Support cross filtering when clicking on data points in charts
- Correct `modelType` of the `trend()` measure function to match the values expected by the backend API
- Add translations for messages in `@sisense/sdk-rest-client` and `@sisense/sdk-data`
- Extend components `MemberFilterTile` and `DateRangeFilterTile` to show UI errors in case of JAQL query failures
- Extend `CriteriaFilterTile` and `CriteriaFilterMenu` to support ranking criteria filter options
- Make minor UI improvements to highcharts legends, drilldown breadcrumbs, chart markers, and transition animation between chart types

## [0.15.0] - 2023-11-30

### Added
- Add AI `Chatbot` component and related logic in `@sisense/sdk-ui/ai` namespace for internal testing
- Support fully Angular in `@sisense/sdk-ui-angular` package
- Add loading indicators for charts and tables
- Implement `CriteriaFilterMenu` component for vertical double-input and horizontal use cases
- Extend `IndicatorChart` with the `ticker` mode
- Add `useGetSharedFormula` hook to retrieve shared formulas
- Add support for custom formulas in code
- Add Authentication user guide

### Changed
- Support Angular v17 in `@sisense/sdk-ui-angular`
- Extend `widgetStyleOptions` with ability to render custom chart header in widget
- Support text inputs in criteria filters
- Support dependent filters

## [0.14.0] - 2023-11-14

### Added
- Add component `CriteriaFilterTile` for vertical single input use case.

### Changed
- Support dashboard filters by boolean flag `includeDashboardFilters` in component `DashboardWidget`, component `ExecuteQueryByWidgetId`, and hook `useExecuteQueryByWidgetId`
- Extend `fitlersMergeStrategy` to support highlight filters
- Extend hooks `useExecuteQuery` and `useExecuteQueryByWidgetId` to re-execute on `onBeforeQuery` changes
- Fix issues related to date formatting and continuous timeline
- Show the No Result image for scatter chart without data
- Support highlights for scatter chart and pie chart
- Implement colors by series in sunburst chart
- Implement usage tracking of public hooks
- Extract usage tracking logic into a separate package `@sisense/sdk-tracking`

## [0.13.0] - 2023-11-02

### Added
- Publish `@sisense/sdk-ui-angular` and related dependencies to NPM registry for internal testing.
- Add component `SunburstChart`
  and support the `sunburst` chart type in components `Chart`, `ChartWidget`, and `DashboardWidget`
- Add troubleshooting guides for common issues

### Changed
- Mark `drilldownOptions` as `@deprecated` in `ChartWidgetProps` – use `DrilldownWidget` instead
- Support `onBeforeExecute` callback in `ExecuteQuery`, `ExecuteQueryByWidgetId`,
  `useExecuteQuery`, and `useExecuteQueryByWidgetId` to allow modifying the JAQL query before it is executed
- Support highlight filters of selected points on `ChartWidget`

## [0.12.1] - 2023-10-26

### Changed
- Increase `maxAllowedMembers` in `BasicMemberFilterTile` from 1000 to 2000
- Fix build of `sdk-ui-angular` by adding missed devDependencies

## [0.12.0] - 2023-10-24

### Added
- Add `i18n` module based on the `i18next` package to support internationalization
- Add React hooks `useGetDashboardModel` and `useGetDashboardModels` to retrieve dashboards
  from the Sisense instance

### Changed
- Fix invalid URL constructed for SSO authenticator
- Enable y2-axis (right axis) in style options by default for Cartesian charts.
  It is visible only when there is a value assigned to it
- Adjust REST client methods to return `undefined` when the status code is `204 (No Content)` or
  `304 (Not Modified)` or when the response body is empty
- Switch default value of `filtersMergeStrategy` from `widgetFirst` to `codeFirst`
  in component `ExecuteQueryByWidgetId`, hook `useExecuteQueryByWidgetId`, and component `DashboardWidget`
- Limit the allowed number of categories and values in the `dataOptions` of Categorical charts (Pie, Funnel, and Treemap)

## [0.11.3] - 2023-10-16

### Changed
- Switch GitHub CI to publish to NPM instead of GitHub Packages
- Allow override of breadcrumb position in component `DrilldownWidget`

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
  and support the `treemap` chart type in components `Chart`, `ChartWidget`, and `DashboardWidget`
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
