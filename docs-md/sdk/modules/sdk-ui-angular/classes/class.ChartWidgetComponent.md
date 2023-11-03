---
title: ChartWidgetComponent
---

# Class ChartWidgetComponent

Chart Widget Component

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new ChartWidgetComponent**(`sisenseContextService`, `themeService`): [`ChartWidgetComponent`](class.ChartWidgetComponent.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](class.SisenseContextService.md) |
| `themeService` | [`ThemeService`](class.ThemeService.md) |

#### Returns

[`ChartWidgetComponent`](class.ChartWidgetComponent.md)

## Properties

### Data

#### filters

> **filters**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

### Chart

#### dataOptions

> **dataOptions**: [`ChartDataOptions`](../../sdk-ui/type-aliases/type-alias.ChartDataOptions.md)

Configurations for how to interpret and present data passed to the chart.

***

#### styleOptions

> **styleOptions**: `undefined` \| [`StyleOptions`](../../sdk-ui/type-aliases/type-alias.StyleOptions.md)

Style options union across chart types.

### Callbacks

#### beforeRender

> **beforeRender**: `undefined` \| [`BeforeRenderHandler`](../../sdk-ui/type-aliases/type-alias.BeforeRenderHandler.md)

Before render handler callback that allows adjusting
detail chart options prior to render

This callback is not yet supported for [IndicatorChart](../../sdk-ui/functions/function.IndicatorChart.md)

***

#### dataPointClick

> **dataPointClick**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md), [`"point"`, `"nativeEvent"`] \> \>

Click handler callback for a data point

***

#### dataPointContextMenu

> **dataPointContextMenu**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md), [`"point"`, `"nativeEvent"`] \> \>

Context menu handler callback for a data point

***

#### dataPointsSelect

> **dataPointsSelect**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`DataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointsEventHandler.md) \| [`ScatterDataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointsEventHandler.md), [`"points"`, `"nativeEvent"`] \> \>

Handler callback for selection of multiple data points

### Other

#### chartType

> **chartType**: [`ChartType`](../../sdk-ui/type-aliases/type-alias.ChartType.md)

***

#### dataSource

> **dataSource**: `undefined` \| `string`

***

#### description

> **description**: `undefined` \| `string`

***

#### drilldownOptions

> **drilldownOptions**: `undefined` \| [`DrilldownOptions`](../../sdk-ui/type-aliases/type-alias.DrilldownOptions.md)

***

#### highlights

> **highlights**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

#### title

> **title**: `undefined` \| `string`

***

#### widgetStyleOptions

> **widgetStyleOptions**: `undefined` \| [`WidgetStyleOptions`](../../sdk-ui/interfaces/interface.WidgetStyleOptions.md)
