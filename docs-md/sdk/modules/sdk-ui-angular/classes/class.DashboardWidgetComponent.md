---
title: DashboardWidgetComponent
---

# Class DashboardWidgetComponent

The Dashboard Widget component, which is a thin wrapper on [ChartWidgetComponent](class.ChartWidgetComponent.md),
used to render a widget created in the Sisense instance.

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

Filters that will slice query results

### Widget

#### styleOptions

> **styleOptions**: `undefined` \| [`DashboardWidgetStyleOptions`](../interfaces/interface.DashboardWidgetStyleOptions.md)

Style options for the the widget including the widget container and the chart or table inside.

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
