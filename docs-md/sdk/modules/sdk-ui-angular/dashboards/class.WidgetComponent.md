---
title: WidgetComponent
---

# Class WidgetComponent

Facade component that renders a widget within a dashboard based on the widget type.

## Example

```html
<!--Component HTML template in example.component.html-->
<csdk-widget
 [id]="widgetProps.id"
 [title]="widgetProps.title"
 [widgetType]="widgetProps.widgetType"
 [chartType]="widgetProps.chartType"
 [dataSource]="widgetProps.dataSource"
 [dataOptions]="widgetProps.dataOptions"
/>
```

```ts
// Component behavior in example.component.ts
import { Component } from '@angular/core';
import { type WidgetProps } from '@sisense/sdk-ui-angular';

@Component({
 selector: 'example',
 templateUrl: './example.component.html',
 styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
 widgetProps: WidgetProps = {
   id: 'widget-id',
   widgetType: 'chart',
   chartType: 'column',
   title: 'Widget Title',
   dataSource: DM.DataSource,
   dataOptions: {
     category: [DM.Divisions.Divison_name],
     value: [measureFactory.sum(DM.Admissions.Cost_of_admission)],
     breakBy: [],
   },
 };
}
```
<img src="../../../img/angular-chart-widget-example.png" width="500px" />

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new WidgetComponent**(`sisenseContextService`, `themeService`): [`WidgetComponent`](class.WidgetComponent.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) |

#### Returns

[`WidgetComponent`](class.WidgetComponent.md)

## Properties

### Data

#### dataSource

> **dataSource**: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md) \| `undefined`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

#### filters

> **filters**: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| `undefined`

Filters that will slice query results

***

#### highlights

> **highlights**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| `undefined`

Highlight filters that will highlight results that pass filter criteria

### Chart

#### chartType

> **chartType**: [`ChartType`](../type-aliases/type-alias.ChartType.md) \| `undefined`

Default chart type of each series

***

#### dataOptions

> **dataOptions**: [`ChartDataOptions`](../type-aliases/type-alias.ChartDataOptions.md) \| [`GenericDataOptions`](../../sdk-ui/type-aliases/type-alias.GenericDataOptions.md) \| [`PivotTableDataOptions`](../interfaces/interface.PivotTableDataOptions.md) \| `undefined`

Configurations for how to interpret and present the data passed to the chart

### Widget

#### description

> **description**: `string` \| `undefined`

Description of the widget

***

#### drilldownOptions

> **drilldownOptions**: [`DrilldownOptions`](../type-aliases/type-alias.DrilldownOptions.md) \| `undefined`

List of categories to allow drilldowns on

***

#### id

> **id**: `string`

Unique identifier of the widget

***

#### pluginType

> **pluginType**: `string` \| `undefined`

Plugin type. This is typically the name/ID of the plugin.

***

#### styleOptions

> **styleOptions**: [`ChartWidgetStyleOptions`](../type-aliases/type-alias.ChartWidgetStyleOptions.md) \| [`PivotTableWidgetStyleOptions`](../type-aliases/type-alias.PivotTableWidgetStyleOptions.md) \| [`PluginWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.PluginWidgetStyleOptions.md) \| [`TextWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.TextWidgetStyleOptions.md) \| `undefined`

Style options for both the chart and widget including the widget header

***

#### title

> **title**: `string` \| `undefined`

Title of the widget

***

#### widgetType

> **widgetType**: `"chart"` \| `"pivot"` \| `"plugin"` \| `"text"`

Widget type

### Callbacks

#### beforeRender

> **beforeRender**: [`BeforeRenderHandler`](../type-aliases/type-alias.BeforeRenderHandler.md) \| [`IndicatorBeforeRenderHandler`](../type-aliases/type-alias.IndicatorBeforeRenderHandler.md) \| `undefined`

A callback that allows you to customize the underlying chart element before it is rendered. The returned options are then used when rendering the chart.

This callback is not supported for Areamap Chart, Scattermap Chart, Table, and PivotTable.

***

#### dataPointClick

> **dataPointClick**: `EventEmitter`\< [`ChartDataPointClickEvent`](../type-aliases/type-alias.ChartDataPointClickEvent.md) \>

Click handler callback for a data point

***

#### dataPointContextMenu

> **dataPointContextMenu**: `EventEmitter`\< [`ChartDataPointContextMenuEvent`](../type-aliases/type-alias.ChartDataPointContextMenuEvent.md) \>

Context menu handler callback for a data point

***

#### dataPointsSelect

> **dataPointsSelect**: `EventEmitter`\< [`ChartDataPointsEvent`](../type-aliases/type-alias.ChartDataPointsEvent.md) \>

Handler callback for selection of multiple data points

***

#### dataReady

> **dataReady**: (`data`) => [`Data`](../../sdk-data/interfaces/interface.Data.md) \| `undefined`

A callback that allows to modify data immediately after it has been retrieved.
Can be used to inject modification of queried data.
