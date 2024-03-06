---
title: DashboardWidgetComponent
---

# Class DashboardWidgetComponent

The Dashboard Widget component, which is a thin wrapper on [ChartWidgetComponent](class.ChartWidgetComponent.md),
is used to render a widget created in a Sisense Fusion instance.

To learn more about using Sisense Fusion Widgets in Compose SDK, see
[Sisense Fusion Widgets](https://sisense.dev/guides/sdk/guides/charts/guide-fusion-widgets.html).

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new DashboardWidgetComponent**(`sisenseContextService`, `themeService`): [`DashboardWidgetComponent`](class.DashboardWidgetComponent.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](class.SisenseContextService.md) |
| `themeService` | [`ThemeService`](class.ThemeService.md) |

#### Returns

[`DashboardWidgetComponent`](class.DashboardWidgetComponent.md)

## Properties

### Data

#### filters

> **filters**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters to apply to a chart’s data using one of the following options.

(1) Array of filters returned from filter factory functions, such as
[`greaterThan()`](../../sdk-data/namespaces/namespace.filterFactory/functions/function.greaterThan.md) and [`members()`](../../sdk-data/namespaces/namespace.filterFactory/functions/function.members.md).

Use this option for filters that do not require a UI to set them
or for filters where you will supply your own UI using non-Sisense components.

To learn more about using filter factory functions to create filters, see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-functions).

(2) Array of filters controlled by Sisense filter components.

Use this option for filters that you want your users to set using Sisense UI components.

To learn more about using filter components to create filters, see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-components).

### Widget

#### styleOptions

> **styleOptions**: `undefined` \| [`DashboardWidgetStyleOptions`](../interfaces/interface.DashboardWidgetStyleOptions.md)

Style options for the widget including the widget container and the chart or table inside.

### Other

#### dashboardOid

> **dashboardOid**: `string`

***

#### description

> **description**: `undefined` \| `string`

***

#### filtersMergeStrategy

> **filtersMergeStrategy**: `undefined` \| `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

***

#### highlightSelectionDisabled

> **highlightSelectionDisabled**: `undefined` \| `boolean`

***

#### highlights

> **highlights**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

#### includeDashboardFilters

> **includeDashboardFilters**: `undefined` \| `boolean`

***

#### title

> **title**: `undefined` \| `string`

***

#### widgetOid

> **widgetOid**: `string`
