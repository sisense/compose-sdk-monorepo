---
title: DashboardWidgetComponent
---

# Class DashboardWidgetComponent

Dashboard Widget Component

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

### Chart

#### styleOptions

> **styleOptions**: `undefined` \| \{
  `height`: `number`;
  `width`: `number`;
 }

Style options union across chart types.

### Other

#### dashboardOid

> **dashboardOid**: `string`

***

#### description

> **description**: `undefined` \| `string`

***

#### drilldownOptions

> **drilldownOptions**: `undefined` \| [`DrilldownOptions`](../../sdk-ui/type-aliases/type-alias.DrilldownOptions.md)

***

#### filtersMergeStrategy

> **filtersMergeStrategy**: `undefined` \| `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

***

#### highlights

> **highlights**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

#### title

> **title**: `undefined` \| `string`

***

#### widgetOid

> **widgetOid**: `string`

***

#### widgetStyleOptions

> **widgetStyleOptions**: `undefined` \| [`WidgetStyleOptions`](../../sdk-ui/interfaces/interface.WidgetStyleOptions.md)
