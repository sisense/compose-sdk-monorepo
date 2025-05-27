# Changelog

## [2.2.0] - 2025-05-27

### Added
- Add editable dashboard layout for internal testing:
  - Add drag-and-drop and resizing capabilities for widgets
  - Add layout history management UI in dashboard toolbar
  - Support persistence of dashboard layout to Fusion

### Changed
- Extend the `onError` handler in `SisenseContextProviderProps` to support custom error box visualization
- Fix a rendering issue that may occur from runtime errors happening while `showRuntimeErrors` is disabled in `SisenseContextProviderProps`
- Migrate CSDK packages from version ranges to fixed versions to prevent internal dependency mismatches

## [2.1.0] - 2025-05-13

### Added
- Add `titleFontSize` property to `WidgetThemeSettings.header` for configuring widget header font size

### Changed
- Apply timezone from the date configuration correctly
- Enable `TabberWidget` by default for better user experience
- Fix `PivotTableWidget` height when `isAutoHeight` option is enabled
- Prevent horizontal scrollbar from appearing on `Table` with auto column width
- Fix bar chart labels overlap issue


## [2.0.0] - 2025-04-30

### Added
- Add Angular and Vue support for `useComposedDashboard` hook
- Add `Widget` component support for Angular and Vue
- Add `FilterTile` component for Angular and Vue
- Move the following features to General Availability (GA):
  - `DashboardById` persistency
  - `useComposedDashboard` hook
  - `Widget` component
  - AI components and hooks
  - `AreaRangeChart` component
  - `FilterTile` component
  - `SisenseContextProviderProps.enableSilentPreAuth`
  - `Chart.onDataReady`
  - `ExecuteQueryProps.ungroup`
  - `AppConfig.translationConfig`
- Apply `composeCode` to `measureFactory` and `filterFactory`
- Implement embed code for `Dashboard`

### Changed
- **Breaking:** The minimum supported version of Angular is now v17
- **Breaking:** The minimum supported version of React is now v17
- **Breaking:** Remove deprecated methods from `WidgetModel` API
- **Breaking:** Remove deprecated `DashboardWidget` component
- **Breaking:** Separate CSDK `WidgetType` and `FusionWidgetType`
- **Breaking:** Remove deprecated `PivotGrandTotals.title` prop
- **Breaking:** Remove other deprecated props and methods
- **Breaking:** Improve types for Vue and Angular components
> _See [migration guide](./guides/migration-guide-2.0.0.md) for more details._
- Fix widgets not showing when switching dashboards when using tabber
- Fixed border issue for filter tiles
- Return only valid color format conditions
- Improve pivot rendering performance
- Improved handling of keys in `seriesToColorMap`
- Align Vue component props validation with corresponding types
- Improve component handler types in Angular
- Highlight selected days correctly during multi-selection in date selector


## [1.34.0] - 2025-04-15

### Added
- Add cascading filters editing support by extending `FilterTile` and `FilterEditorPopover` components
- Add `executeCsvQuery` method to `queryService` for Angular
- Add `useExecuteCsvQuery` composable for Vue
- Add filters creation and editing possibilities into `Dashboard` and `DashboardById` components in Angular and Vue for internal testing

### Changed
- Improve `FilterEditorPopover`: fix incorrect members for datetime "day" granularity filter, add missing default "from" value for numeric filter, clear previous condition value for textual filter, allow updating filter with deactivated members only
- Improve `AddFilterPopover`: restrict filter creation on an attribute if one already exists in the dashboard, add caching for datasource fields loading, handle missing datasource cases, fix search field focus outline
- Improve `Table`: fix non-functional `StyledColumn.sortType` sorting configuration
- Fix broken forecast and trend for measures with `count` aggregation over textual attributes
- Improve testing: cover filter model logic in `sdk-data` package with unit tests

## [1.33.0] - 2025-04-01

### Added
- Add filters creation and editing possibilities into `Dashboard`, `DashboardById` and `FiltersPanel` components
- Add `PivotTableWidgetComponent` for Angular
- Add `executePivotQuery` method to `queryService` in the Angular package
- Add `widgetModelTranslator`, `dashboardModelTranslator` and `dashboardHelpers` for Angular and Vue
- Add `config` property in the `Dashboard` and `DashboardById` components
- Add responsive widget layout support to the `Dashboard` and `DashboardById`
- Add AI and `Chatbot` functionality support for Vue

### Changed
- Improve `FilterEditorPopover`: add deactivated members and unsupported filters handling, add theming support
- Improve `AddFilterPopover`: add theming support, add search and lazy loading
- Improve docs: update broken links
- Improve accessibility: add noticeable outline to focusable elements
- Fix dashboard layout for cells with no height or numeric hight
- Move the `persist` property of `DashboardById` into its config
- Improve tests: add filter edit and filter creation visual tests, update dark theme screenshots

## [1.32.0] - 2025-03-18

### Added
- Add AI and `Chatbot` functionality into Angular
- Add support for columns and rows in "Break By"
- Add search for `FilterEditorPopover` members lists for internal testing
- Add datetime fields support in `FilterEditorPopover` component for internal testing
- Add Tabber widget support for internal testing
- Add basic `GroupedItemsBrowser` and `DimensionsBrowser` components for internal testing

### Changed
- Update the `MembersFilterTile` UI to reflect the `enableMultiSelection` filter option
- Fixed triggering of the component/hook init tracking event when the app initializes
- Improve Widget Embed Code: update code templates
- Improve charts: align text widget spacing with other widgets and unify tooltip formatting
- Improve accessibility: add labels to links that open in a new tab for assistive technology
- Improve testing: update visual tests to match new Fusion theme color, update unit test for Table chart

## [1.31.0] - 2025-03-04

### Added
- Add numeric filters support in `FilterEditorPopover` for internal testing
- Add lazy loading for `FilterEditorPopover` members lists for internal testing

### Changed
- **Breaking:** Make `chartRecommendations` in `NlqResponseData` internal
- Update `FilterEditorPopover` selects to use `Popper` instead of `Popover`
- Change prefix for CSS variables in Tailwind to avoid conflicts (`--tw` → `--csdk-tw`)
- Fix chart re-rendering when a trend/forecast fails after a props change
- Improve charts: fix `Pivot` pagination panel visibility after changing the results per page, fix invalid axis points related to navigator
- Improve Widget Embed Code: add `StyledColumn` and `StyledMeasureColumn` support, fix missing filters prop
- Improve testing: add `Chart` component mocking with user interactions, add more pie chart cases to visual tests

## [1.30.0] - 2025-02-18

### Added
- Add pivot cell coloring and conditional styling
- Add `dataReady` property support for Angular charts and widgets
- Add an option to control the verbosity of the NLG summarization
- Add theming support on `FilterEditorPopover` component for internal testing

### Changed
- Improve charts: fix missing formatting for pivot, number formatting for trend/forecast features, enhance pivot performance
- Improve types of `CriteriaFilterTile` component's props
- Deprecate `PivotGrandTotals.title` prop
- Improve testing: added pivot visual-regression tests, cover textual filter editing with unit tests
- Improve code-templates in analitycs-composer
- Improve AI `Chatbot` with context details
- Fix compatibility with old React versions

## [1.29.0] - 2025-02-04

### Added
- Add total and percentage value labels support in `ColumnChart`, `BarChart` and `AreaChart`
- Add filter relations support to `BoxplotChart`
- Add prop types for Angular components
- Add `FilterEditorPopover` component for internal testing

### Changed
- Extend `useGetQueryRecommendations` hook to support `enabled` flag
- Fix `useExecuteQueryByWidgetId` hook and `ExecuteQueryByWidgetId` component to support pivot query with rows only
- Fix error handling in forecast and trend when chart has no data
- Fix missing title in `WidgetById` component for Angular and Vue
- Improve dashboard: align scatter chart cross-filtering behavior with Fusion, minor style improvements
- Improve `PivotTable`: improve formatting of grand-total and sub-total header cells
- Improve theming: apply theme fonts to dashboard filters panel and filter tiles
- Improve AI `Chatbot`: add new error messages, pass through error codes from the Sisense REST API
- Extend Widget Embed Code to populate code representation for dimensions and measures
- Move filter utilities to `sdk-data` package

## [1.28.0] - 2025-01-21

### Added
- Add React hook for nlq `useGetNlqResult` (beta)
- Implement React hook for retrieving filter members, `useGetFilterMembers` (beta)
- Add `filterFactory.cascading()` to create a Cascading Filter instance

### Changed
- **Breaking:** Rename beta hook `useGetNlgQueryResult` and `GetNlgQueryResult` to `useGetNlgInsights` and `GetNlgInsights`, respectively
- Extend hook `useGetQueryRecommendations` (beta) to return `WidgetProps` additionally
- Refactor `MemberFilterTile` to use hook `useGetFilterMembers` internally
- Move React component `FilterTile` from internal to beta
- Refactor `CascadingFilterTileProps.filter` from class `CascadingFilter` to interface `Filter`
- Improve `PivotTable`: fix `rowsPerPage` to work with `isAutoHeight` option
- Improve charts: add number format config extraction for count aggregations, extend the `Popover` mask to fill the full page
- Improve testing: polyfill `document.fonts` for unit tests environment
- Improve Widget Embed Code: improve extra imports

## [1.27.1] - 2025-01-14

### Changed
- Fix internal `Filter.isScope` by default for correct filters comparison
- Add tooltip to pivot headers in case of truncated text
- Replace shared components in `sdk-pivot-client` by components `sdk-shared-ui`

## [1.27.0] - 2025-01-07

### Added
- Add AI module `SdkAiModule` to Angular. This module will soon contain Chatbot.
- Add `onBeforeRender` callback to Indicator chart
- Add component `FilterRelationsTile` for internal use by `Dashboard` and `DashboardById` components

### Changed
- Improve change detection for complex calculated measures
- Improve charts and theming: hide errors related to insights in NLQ chart, remove redundant zero value label for cartesian charts with 2 categories, move number abbreviations to translation files, improve waiting of fonts loading
- Improve filter tiles: add Edit button and `onEdit` callback, add empty `FilterEditorPopover` component for internal testing, refactor common filter tile display

## [1.26.0] - 2024-12-23

### Added
- Add shared formulas support
- Display "No results" for charts without defined dimensions
- Extend Widget Embed Code to support pivot widget type

### Changed
- Extract shared UI components from `sdk-pivot-client` to `sdk-shared-ui`
- Restrict chatbot data topics to only those from the current tenant
- Add dashboard filters to the chatbot insights requests
- Resolve issue with `scrollerLocation` for disabled navigator

## [1.25.0] - 2024-12-09

### Added
- Support persistence of filters for embedded Fusion dashboards using flag `DashboardByIdProps.persist` (alpha)
- Add `FilterRelations` support for dashboards
- Add package `@sisense/sdk-shared-ui`

### Changed
- Extend `filterFactory` functions to support the `config` param
- Support alternative API calls for dashboard and widgets fetch with WAT
- Use translation language for date locale
- Extend Widget Embed Code to support code snippets for execute query
- Fix date format in `MemberFilterTile`
- Handle losing widgets' inner state on the update of `DashboardProps`
- Improve testing: visual tests with new Sisense theme, tests for execute query
- Improve pivot table: correct the display of `rowsPerPage`, adjust the last row sorting, handle `isAutoHeight` in Dashboard layout and "No Results" case
- Improve AI `Chatbot`: allow disabling query recommendations, show all data models queryable, apply filters to `NlqChartWidget`

## [1.24.0] - 2024-11-25

### Added
- Add internal `sdk-shared-ui` library
- Implement `HierarchyService.getHierarchyModels` in Angular
- Implement composable `useGetHierarchyModels` in Vue
- Implement `RelativeDateFilterTileComponent` in Angular

### Changed
- Make `FiltersPanel` collapsable initially in the `Dashboard` component via API
- Support delete button on the filter tiles
- Enable copying text in `Chatbox`
- Improve error handling and `ErrorBoundary`
- Add callback `onDataReady` to `TableProps` and `NlqChartWidgetProps` for internal testing
- Handle date offset in `RelativeDateFilterTile` correctly
- Improve Widget Embed Code in Fusion: unsupported chart type
- Improve charts: `TreemapChart` tooltip with translations, display of labels on `PieChart`
- Improve advanced charts: display of errors in widget header


## [1.23.0] - 2024-11-12

### Added
- Add component `NlqChartWidget` for internal testing
- Add `fromChartWidgetProps()` and  `toWidgetDto()` to `widgetModelTranslator` for internal testing
- Implement `typedoc-plugin-diff-packages` to check feature parity across UI frameworks

### Changed
- Deprecate component `DashboardWidget` – use component `WidgetById` instead
- Implement new `DrilldownWidget.drilldownPaths` in Angular and Vue
- Extend `MembersFilter` and `MemberFilterTile` to support single and multi selection
- Refactor `analytics-composer/ModelTranslator` to `widgetComposer` and `dashboardComposer`
- Refactor component `ChartMessage` (internal) to use `widgetComposer.toWidgetProps`
- Fix wrong drilldown menu items on a dashboard
- Fix error boxes showing control in `ErrorBoundary`
- Improve pivot tables: fix pivot url without trailing slash, add the 'csrf' validation event and trigger the 'register' event in the correct sequence
- Improve CI pipeline: move build artifacts to cache and add more nx adaptation
- Update code templates for Widget Embed Code in Fusion

## [1.22.0] - 2024-10-28

### Added
- Add hook `useComposedDashboard` (alpha) for flexible dashboard composition in React
- Add hook `useDashboardTheme` for internal testing
- Support persistence of dashboard for internal testing
- Add callback `onDataReady` to `ChartProps` for internal testing
- Add custom translations loader for internal testing
- Extend CLI `get-data-model` command to include attribute's data source into resulting data model
- Add CommonJS builds to the packages of `sdk-common`, `sdk-modeling`, `sdk-query-client`, `sdk-rest-client`, `sdk-tracking`, and `sdk-preact` to support Jest compatibility

### Changed
- Remove internal `enableTracking` property in `SisenseContextProviderProps`
- Make `ErrorBox` not show by default
- Fix empty pivot due to incorrect socket namespace for custom tenant
- Use absolute y-values for pie charts
- Align “select/unselect” cross-filtering behavior with Fusion
- Migrate `ChartWidget` to use a new internal `useWithDrilldown` hook


## [1.21.0] - 2024-10-15

### Added
- Add utility methods for manipulating filters of `DashboardProps`
- Implement component `CriteriaFilerTile` in Angular
- Implement component `RelativeDateFilterTile` in Vue

### Changed
- Show filter attribute title in unsupported filter tiles
- Make filter panel collapsible in `DashboardById` and `Dashboard` components
- Fix error caused by CSS named colors in `ThemeProvider`
- Enable forecast and trend in Fusion widgets

## [1.20.0] - 2024-10-01

### Added
- Add `widgetModelTranslator` for translating between a widget model and related component props
- Add `dashboardModelTranslator` for translating between a dashboard model and related component props
- Add hook `useExecutePluginQuery` (alpha) for use in plugin components
- Implement custom context menu and sub-menu for dashboard cross-filtering and drilldown
- Add internal change detection props and hook to coordinate cross filtering and drilldown
- Support drilldown hierarchies (including predefined date hierarchies) for `ChartWidget`, `DrilldownWidget` for internal testing
- Add hook `useGetHierarchyModels` that retrieves existing hierarchy models from Fusion
- Add plugin `highcharts-rounded-corners` for Highcharts (internal charting library)


### Changed
- **Breaking:** Restructure `DashboardProps` for beta release: `widgets` to using `WidgetProps[]`, instead of `WidgetModel[]`, `layout`  to `layoutOptions`, `widgetFilterOptions` to `widgetOptions`
- Deprecate `get*Props()` on `WidgetModel` – use utility functions of `widgetModelTranslator` instead
- Move components `DashboardById` and `Dashboard` to beta for React, Angular, and Vue
- Support dashboards of multiple data sources
- Handle Fusion date formats from locale
- Extend data point entries with `displayValue`
- Consolidate interface for custom chart plugins
- Improve filters: translation of `doesn't equal` filter, update of `CriteriaFilterTile`, formula in ranked filter
- Replace `fetch-intercept` with an isolated in-house implementation
- Extend CLI `get-data-model` to support perspectives
- Improve charts: "No Results" overlay added to all charts, data options validation for trend or forecast, polar chart stacking and value labels disabling
- Improve pivot tables: container size, additional visual tests

## [1.19.0] - 2024-09-17

### Added
- Support loading of fonts from Fusion
- Support dashboard rendering of text widgets and chart plugins for internal testing

### Changed
- Fix missing spaces in headings for `MemberFilterTile`, `Table`, and `PivotTable`
- Extend `DataPoint` types with metadata
- Fix rendering of charts without values to match Fusion
- Fix pivot table error due to invalid datetime formatting
- Improve type guards for narrowing filter types

## [1.18.1] - 2024-09-04

### Added

- Disable forecast and trend in Fusion widgets temporarily to troubleshoot authorization-related issues

## [1.18.0] - 2024-09-03

### Added

- Add auto zoom feature to `DashboardWidget`

### Changed

- Improve `SisenseContextProvider`: support of Fusion authentication
- Extend `measureFactory.customFormula` to support filters
- Improve `PivotTable`: proper handling of web socket readiness
- Fix `DashboardWidget` with filter relations and highlights
- Improve tooltips for forecast and trend
- Improve charts: palette colors of `BoxplotChart`, refactoring `ThemeSettings.chart.panelBackgroundColor`, making `color` column optional in `AreamapChart`, support of thousands separator from old `numberFormat` config, axis labels for stacked percent charts
- Improve infrastructure: visual tests of dashboard assets of diffent widget types, replacement of CommonJS dependencies (e.g., lodash)

## [1.17.1] - 2024-08-22

### Changed
- Improve error handling of WAT authentication
- Fix an issue in `Table` so user-provided data are sorted in their entirety, instead of per page
- Apply widget description as `accessibility.description` for `ChartWidget`

## [1.17.0] - 2024-08-20

### Added
- Move components `DashboardById` and `Dashboard` to internal alpha for React, Angular, and Vue
- Support external usage tracking callback configured through `trackingConfig.onTrackingEvent` of the `AppConfig`
- Refactor `ChartWidget` to reuse `DrilldownWidget` internally
- Support drill down for scatter chart widgets

### Changed
- Deprecate internal `enableTracking` property in `SisenseContextProviderProps` – use `trackingConfig.enabled` of the `AppConfig` instead
- Extend `ThemeSettings` to support animation-related config
- Improve dashboard rendering: locked filters in cross filtering, resetting levels of `CascadingFilterTile`, highlight of all categories in cartesian charts, dashboard theme setting, matching theme for widget header info panel
- Refactor component `Table` to reduce computations and re-renders
- Fix issues of charts: legend position of funnel chart, number formatting for indicator's secondary value
- Improve `SisenseContextProvider` in React: support of pending `token` or `wat` for delayed authentication and custom error handling
- Improve testing: disabling animation for e2e tests

## [1.16.0] - 2024-08-06

### Added
- Extend cartesian charts to support trends and forecast for internal testing
- Extend `ThemeSettings` to support widget theme settings
- Support widget design styling on fetched dashboards
- Support dashboard color palette
- Extend `useExecuteQueryByWidgetId` hook to support pivot tables
- Add embed code logic in `@sisense/sdk-ui/analytics-composer` namespace for internal testing

### Changed
- Improve query validation logic for query hooks and components
- Improve dashboard rendering: conversion of cascading filters between dashboard level and widget level, supporting collapsibility of `CascadingFilter` levels, fixing filter tile borders, fixing "Include All" highlights causing interference with filters
- Improve charts: styling of scatter charts including data labels and legends, fixing lazy loading of table's page count,
- Fix issues of pivot table: endless rendering due to updated style options, the theme of pagination panel, "No Results" overlay, pivot sorting and redundant pivot queries
- Improve testing: visual-regression tests infra and stability, adding tests of different `Indicator` use cases, tests for `useTableData`

## [1.15.1] - 2024-07-15

### Changed
- Fix an issue with `Include All` members filter

## [1.15.0] - 2024-07-15

### Added
- Extend component `MemberFilterTile` to support excluded members

### Changed
- Make improvements to dashboard rendering: fixing UI issues of `DateRangeFilter`, improve fallback jaql filter
- Improve support for Common JS in `sdk-data` package

## [1.14.0] - 2024-07-10

### Added
- Implement additional components and hooks for dashboard rendering (internal testing): background filters, locked filters
- Implement components `DashboardById` and `Dashboard` in Angular and Vue for internal testing
- Add visual regression testing infrastructure and basic tests

### Changed
- Support additional datetime levels for Live models: 'seconds' and 'minutes'
- Make improvements to charts and pivot table: tooltips of `AreaRangeChart`, default line thickness to bold for `LineChart`, hidden pagination panel for single page result of `PivotTable`, handling of data options update for `TableChart`
- Make improvements to dashboard rendering: supporting `CustomFilter` in `CascadingFilterTile`
- Make improvements for `Chatbot` component: list of data topics
- Improve performance by lowering priority of tracking API calls
- Handle properly empty returns of network calls

## [1.13.0] - 2024-06-26

### Added
- Implement additional components and hooks for dashboard rendering (internal testing): component `CustomFilterTile`, component `CascadingFilterTile`, hook `useCommonFilters`
- Make component `LoadingOverlay` available for internal usage
- Implement component `AreaRangeChart` (beta) for Angular and Vue

### Changed
- Extend `AreaRangeChart` to support smooth line
- Change query cache key to work for all jaql elements
- Make improvements to charts: fixing broken charts when switching chart type, clearing point state on selection, parsing of ISO date strings with or without timezone offsets, fixing numeric values as string (highcharts error), tooltip of measure name for range charts
- Improve the translation of filter JAQL to `Filter` objects: exclude member filter, top/bottom ranking on measure, translation of deactivated members for `MembersFilter`
- Make improvements to dashboard rendering: numeric members in `MemberFilterTile`, dynamic resizing of `FiltersPanel`, theming for `DashboardById`
- Make improvements for `Chatbot` component: viewer role, scroll to bottom, input box autofocus, input length limit, hide history config

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
- Make minor tweaks and UI improvements for `Chatbot` component
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
- **Breaking:** Refactor `ScattermapChartDataOptions.geo` (beta) to use `StyledColumn`, instead of `ScattermapColumn` (removed).
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

> _See [migration guide](./guides/migration-guide-1.0.0.md) for more details._

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
