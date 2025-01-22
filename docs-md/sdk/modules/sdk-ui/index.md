---
title: sdk-ui
---

# Module sdk-ui

## Charts

React components and utilities for working with charts

- [AreaChart](charts/function.AreaChart.md)
- [AreamapChart](charts/function.AreamapChart.md)
- [AreaRangeChart](charts/function.AreaRangeChart.md) <Badge type="beta" text="Beta" />
- [BarChart](charts/function.BarChart.md)
- [BoxplotChart](charts/function.BoxplotChart.md)
- [boxWhiskerProcessResult](charts/function.boxWhiskerProcessResult.md) - Utility function that combines box whisker data and outliers data
- [Chart](charts/function.Chart.md) - Common component for rendering charts of different types including table
- [ColumnChart](charts/function.ColumnChart.md)
- [FunnelChart](charts/function.FunnelChart.md)
- [IndicatorChart](charts/function.IndicatorChart.md)
- [LineChart](charts/function.LineChart.md)
- [PieChart](charts/function.PieChart.md)
- [PolarChart](charts/function.PolarChart.md)
- [ScatterChart](charts/function.ScatterChart.md)
- [ScattermapChart](charts/function.ScattermapChart.md)
- [SunburstChart](charts/function.SunburstChart.md)
- [TreemapChart](charts/function.TreemapChart.md)

## Data Grids

React components for data grids

- [PivotTable](data-grids/function.PivotTable.md) <Badge type="beta" text="Beta" />
- [Table](data-grids/function.Table.md)

## Drilldown

React components for creating drilldown experiences

- [ContextMenu](drilldown/function.ContextMenu.md)
- [DrilldownBreadcrumbs](drilldown/function.DrilldownBreadcrumbs.md)
- [DrilldownWidget](drilldown/function.DrilldownWidget.md)

## Filter Tiles

React filter tile components

- [CriteriaFilterTile](filter-tiles/function.CriteriaFilterTile.md)
- [DateRangeFilterTile](filter-tiles/function.DateRangeFilterTile.md)
- [FiltersPanel](filter-tiles/function.FiltersPanel.md) <Badge type="alpha" text="Alpha" />
- [FilterTile](filter-tiles/function.FilterTile.md) <Badge type="beta" text="Beta" /> - Facade component rendering a filter tile based on filter type
- [MemberFilterTile](filter-tiles/function.MemberFilterTile.md)
- [RelativeDateFilterTile](filter-tiles/function.RelativeDateFilterTile.md)
- [useGetFilterMembers](filter-tiles/function.useGetFilterMembers.md) <Badge type="beta" text="Beta" /> - Hook to fetch members of a filter

## Contexts

React context components

- [SisenseContextProvider](contexts/function.SisenseContextProvider.md)
- [ThemeProvider](contexts/function.ThemeProvider.md)

## Queries

React components and hooks for working with queries

- [ExecuteQuery](queries/function.ExecuteQuery.md)
- [useExecuteCsvQuery](queries/function.useExecuteCsvQuery.md)
- [useExecutePivotQuery](queries/function.useExecutePivotQuery.md) <Badge type="beta" text="Beta" />
- [useExecuteQuery](queries/function.useExecuteQuery.md)
- [useQueryCache](queries/function.useQueryCache.md) <Badge type="alpha" text="Alpha" />

## Dashboards

React components and utilities for working with dashboards

- [ChartWidget](dashboards/function.ChartWidget.md)
- [Dashboard](dashboards/function.Dashboard.md)
- [dashboardHelpers](dashboards/namespace.dashboardHelpers/index.md) - Utility functions to manipulate dashboard elements
- [extractDimensionsAndMeasures](dashboards/function.extractDimensionsAndMeasures.md) <Badge type="alpha" text="Alpha" />
- [PivotTableWidget](dashboards/function.PivotTableWidget.md) <Badge type="beta" text="Beta" />
- [useComposedDashboard](dashboards/function.useComposedDashboard.md) <Badge type="alpha" text="Alpha" />
- [useExecutePluginQuery](dashboards/function.useExecutePluginQuery.md) <Badge type="alpha" text="Alpha" />
- [Widget](dashboards/function.Widget.md) <Badge type="alpha" text="Alpha" />

## Fusion Assets

React components, hooks, and utilities for working with Fusion dashboards, widgets, queries, and formulas

- [DashboardById](fusion-assets/function.DashboardById.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [DashboardModel](fusion-assets/interface.DashboardModel.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [dashboardModelTranslator](fusion-assets/namespace.dashboardModelTranslator/index.md) <Badge type="fusionEmbed" text="Fusion Embed" /> - Utility functions to translate a Fusion dashboard model from and to other dashboard data structures
- [DashboardWidget](fusion-assets/function.DashboardWidget.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [ExecuteQueryByWidgetId](fusion-assets/function.ExecuteQueryByWidgetId.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useExecuteQueryByWidgetId](fusion-assets/function.useExecuteQueryByWidgetId.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useFetch](fusion-assets/function.useFetch.md)
- [useGetDashboardModel](fusion-assets/function.useGetDashboardModel.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useGetDashboardModels](fusion-assets/function.useGetDashboardModels.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useGetHierarchyModels](fusion-assets/function.useGetHierarchyModels.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useGetSharedFormula](fusion-assets/function.useGetSharedFormula.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useGetWidgetModel](fusion-assets/function.useGetWidgetModel.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [WidgetById](fusion-assets/function.WidgetById.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [WidgetModel](fusion-assets/interface.WidgetModel.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [widgetModelTranslator](fusion-assets/namespace.widgetModelTranslator/index.md) <Badge type="fusionEmbed" text="Fusion Embed" /> - Utility functions to translate a Fusion widget model from and to other widget data structures

## Generative AI

React components and hooks for creating experiences using generative AI

- [AiContextProvider](generative-ai/function.AiContextProvider.md) <Badge type="beta" text="Beta" />
- [Chatbot](generative-ai/function.Chatbot.md) <Badge type="beta" text="Beta" />
- [GetNlgInsights](generative-ai/function.GetNlgInsights.md) <Badge type="beta" text="Beta" />
- [useGetNlgInsights](generative-ai/function.useGetNlgInsights.md) <Badge type="beta" text="Beta" />
- [useGetNlqResult](generative-ai/function.useGetNlqResult.md) <Badge type="beta" text="Beta" />
- [useGetQueryRecommendations](generative-ai/function.useGetQueryRecommendations.md) <Badge type="beta" text="Beta" />
