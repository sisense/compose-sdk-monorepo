---
title: sdk-ui-vue
---

# Module sdk-ui-vue

## Charts

Vue components and utilities for working with charts

- [AreaChart](charts/class.AreaChart.md)
- [AreamapChart](charts/class.AreamapChart.md)
- [AreaRangeChart](charts/class.AreaRangeChart.md)
- [BarChart](charts/class.BarChart.md)
- [BoxplotChart](charts/class.BoxplotChart.md)
- [boxWhiskerProcessResult](charts/function.boxWhiskerProcessResult.md) - Utility function that combines box whisker data and outliers data
- [Chart](charts/class.Chart.md) - Common component for rendering charts of different types including table
- [ColumnChart](charts/class.ColumnChart.md)
- [FunnelChart](charts/class.FunnelChart.md)
- [IndicatorChart](charts/class.IndicatorChart.md)
- [LineChart](charts/class.LineChart.md)
- [PieChart](charts/class.PieChart.md)
- [PolarChart](charts/class.PolarChart.md)
- [ScatterChart](charts/class.ScatterChart.md)
- [ScattermapChart](charts/class.ScattermapChart.md)
- [SunburstChart](charts/class.SunburstChart.md)
- [TreemapChart](charts/class.TreemapChart.md)

## Data Grids

Vue components for data grids

- [PivotTable](data-grids/class.PivotTable.md) <Badge type="beta" text="Beta" />
- [Table](data-grids/class.Table.md)

## Drilldown

Vue components for creating drilldown experiences

- [ContextMenu](drilldown/class.ContextMenu.md)
- [DrilldownBreadcrumbs](drilldown/class.DrilldownBreadcrumbs.md)
- [DrilldownWidget](drilldown/class.DrilldownWidget.md)

## Filter Tiles

Vue filter tile components

- [CriteriaFilterTile](filter-tiles/class.CriteriaFilterTile.md)
- [DateRangeFilterTile](filter-tiles/class.DateRangeFilterTile.md)
- [FilterTile](filter-tiles/class.FilterTile.md) - Facade component rendering a filter tile based on filter type
- [MemberFilterTile](filter-tiles/class.MemberFilterTile.md)
- [RelativeDateFilterTile](filter-tiles/class.RelativeDateFilterTile.md)

## Contexts

Vue context components

- [SisenseContextProvider](contexts/class.SisenseContextProvider.md)
- [ThemeProvider](contexts/class.ThemeProvider.md)

## Queries

Vue composables for working with queries

- [useExecuteCsvQuery](queries/function.useExecuteCsvQuery.md)
- [useExecuteQuery](queries/function.useExecuteQuery.md)

## Dashboards

Vue components and utilities for working with dashboards

- [ChartWidget](dashboards/class.ChartWidget.md)
- [Dashboard](dashboards/class.Dashboard.md)
- [dashboardHelpers](dashboards/namespace.dashboardHelpers/index.md) - Utility functions to manipulate dashboard elements
- [useComposedDashboard](dashboards/function.useComposedDashboard.md)
- [Widget](dashboards/class.Widget.md)

## Fusion Assets

Vue components, composables and utilities for working with Fusion dashboards, widgets, queries, and formulas

- [DashboardById](fusion-assets/class.DashboardById.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [DashboardModel](fusion-assets/interface.DashboardModel.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [dashboardModelTranslator](fusion-assets/namespace.dashboardModelTranslator/index.md) <Badge type="fusionEmbed" text="Fusion Embed" /> - Utility functions to translate a Fusion dashboard model from and to other dashboard data structures
- [useExecuteQueryByWidgetId](fusion-assets/function.useExecuteQueryByWidgetId.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useFetch](fusion-assets/function.useFetch.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useGetDashboardModel](fusion-assets/function.useGetDashboardModel.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useGetDashboardModels](fusion-assets/function.useGetDashboardModels.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useGetHierarchyModels](fusion-assets/function.useGetHierarchyModels.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useGetSharedFormula](fusion-assets/function.useGetSharedFormula.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [useGetWidgetModel](fusion-assets/function.useGetWidgetModel.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [WidgetById](fusion-assets/class.WidgetById.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [WidgetModel](fusion-assets/interface.WidgetModel.md) <Badge type="fusionEmbed" text="Fusion Embed" />
- [widgetModelTranslator](fusion-assets/namespace.widgetModelTranslator/index.md) <Badge type="fusionEmbed" text="Fusion Embed" /> - Utility functions to translate a Fusion widget model from and to other widget data structures

## Generative AI

Vue components and composables for working with Generative AI features provided by Sisense Fusion
::: tip Note
For more information on requirements for enabling Generative AI features, please refer to the [Generative AI documentation](https://docs.sisense.com/main/SisenseLinux/genai.htm)
:::

- [AiContextProvider](generative-ai/class.AiContextProvider.md)
- [Chatbot](generative-ai/class.Chatbot.md)
- [GetNlgInsights](generative-ai/class.GetNlgInsights.md)
- [useGetNlgInsights](generative-ai/function.useGetNlgInsights.md)
- [useGetNlqResult](generative-ai/function.useGetNlqResult.md) <Badge type="beta" text="Beta" />
- [useGetQueryRecommendations](generative-ai/function.useGetQueryRecommendations.md) <Badge type="beta" text="Beta" />
