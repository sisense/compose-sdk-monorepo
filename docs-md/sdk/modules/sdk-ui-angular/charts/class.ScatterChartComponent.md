---
title: ScatterChartComponent
---

# Class ScatterChartComponent

A component displaying the distribution of two variables on an X-Axis, Y-Axis,
and two additional fields of data that are shown as colored circles scattered across the chart.

**Point**: A field that for each of its members a scatter point is drawn. The maximum amount of data points is 500.

**Size**: An optional field represented by the size of the circles.
If omitted, all scatter points are equal in size. If used, the circle sizes are relative to their values.

See [Scatter Chart](https://docs.sisense.com/main/SisenseLinux/scatter-chart.htm) for more information.

## Example

```html
   <csdk-scatter-chart
     [dataSet]="scatter.dataSet"
     [dataOptions]="scatter.dataOptions"
     [highlights]="filters"
     [beforeRender]="onBeforeRender"
     (dataPointClick)="logArguments($event)"
     (dataPointContextMenu)="logArguments($event)"
     (dataPointsSelect)="logArguments($event)"
   />
```
```ts
import { Component } from '@angular/core';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';

@Component({
 selector: 'app-analytics',
 templateUrl: './analytics.component.html',
 styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
 DM = DM;
 filters = [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])];
 scatter = {
   dataSet: DM.DataSource,
   dataOptions: {
     x: DM.Admissions.Room_ID,
     y: measureFactory.sum(DM.Admissions.Cost_of_admission),
   },
 };

 onBeforeRender(options: any) {
   console.log('beforeRender');
   console.log(options);
   return options;
 }

 logArguments(...args: any[]) {
   console.log(args);
 }
}
```
<img src="../../../img/angular-scatter-chart-example.png" width="800px" />

## Constructors

### constructor

> **new ScatterChartComponent**(): [`ScatterChartComponent`](class.ScatterChartComponent.md)

#### Returns

[`ScatterChartComponent`](class.ScatterChartComponent.md)

## Properties

### Data

#### dataOptions

> **dataOptions**: [`ScatterChartDataOptions`](../interfaces/interface.ScatterChartDataOptions.md)

Highlights based on filter criteria to apply to a chart using one of the following options.

Note that the filter dimensions used in highlights must match those defined in the
[dataOptions](class.ScatterChartComponent.md#dataoptions) of the chart.

(1) Array of filters returned from filter factory functions, such as
[`greaterThan()`](../../sdk-data/factories/namespace.filterFactory/functions/function.greaterThan.md) and [`members()`](../../sdk-data/factories/namespace.filterFactory/functions/function.members.md).

Use this option for highlights that do not require a UI to set them
or for highlights where you will supply your own UI using non-Sisense components.

To learn more about using filter factory functions to create highlights, see the
[Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-functions-for-highlighting).

(2) Array of filters controlled by Sisense filter components.

Use this option for highlights that you want your users to set using Sisense UI components.

To learn more about using filter components to create highlights, see the
[Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-components-for-highlighting).

***

#### dataSet

> **dataSet**: `undefined` \| [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md) \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for a chart using one of the following options. If neither option is specified, the chart
will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../../sdk-ui/contexts/function.SisenseContextProvider.md)
component.

(1) Sisense data source name as a string. For example, `'Sample ECommerce'`. Typically, you
retrieve the data source name from a data model you create using the `get-data-model`
[command](../../sdk-cli/type-aliases/type-alias.Command.md) of the Compose SDK CLI. Under the hood, the chart
connects to the data source, executes a query, and loads the data as specified in
[dataOptions](class.ScatterChartComponent.md#dataoptions), [filters](class.ScatterChartComponent.md#filters), and [highlights](class.ScatterChartComponent.md#highlights).

To learn more about using data from a Sisense data source, see the
[Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#sisense-data).

OR

(2) Explicit [`Data`](../../sdk-data/interfaces/interface.Data.md), which is made up of an array of
[`Column`](../../sdk-data/interfaces/interface.Column.md) objects and a two-dimensional array of row data. This approach
allows the chart component to be used with any data you provide.

To learn more about using data from an external data source, see the
[Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#explicit-data).

Example data in the proper format:

```ts
const sampleData = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['2019', 5500, 1500],
    ['2020', 4471, 7000],
    ['2021', 1812, 5000],
    ['2022', 5001, 6000],
    ['2023', 2045, 4000],
  ],
};
```

***

#### filters

> **filters**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

Filters to apply to a chart’s data using one of the following options.

(1) Array of filters returned from filter factory functions, such as
[`greaterThan()`](../../sdk-data/factories/namespace.filterFactory/functions/function.greaterThan.md) and [`members()`](../../sdk-data/factories/namespace.filterFactory/functions/function.members.md).

Use this option for filters that do not require a UI to set them
or for filters where you will supply your own UI using non-Sisense components.

To learn more about using filter factory functions to create filters, see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-functions).

(2) Array of filters controlled by Sisense filter components.

Use this option for filters that you want your users to set using Sisense UI components.

To learn more about using filter components to create filters, see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-components).

***

#### highlights

> **highlights**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlights based on filter criteria to apply to a chart using one of the following options.

Note that the filter dimensions used in highlights must match those defined in the
[dataOptions](class.ScatterChartComponent.md#dataoptions) of the chart.

(1) Array of filters returned from filter factory functions, such as
[`greaterThan()`](../../sdk-data/factories/namespace.filterFactory/functions/function.greaterThan.md) and [`members()`](../../sdk-data/factories/namespace.filterFactory/functions/function.members.md).

Use this option for highlights that do not require a UI to set them
or for highlights where you will supply your own UI using non-Sisense components.

To learn more about using filter factory functions to create highlights, see the
[Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-functions-for-highlighting).

(2) Array of filters controlled by Sisense filter components.

Use this option for highlights that you want your users to set using Sisense UI components.

To learn more about using filter components to create highlights, see the
[Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-components-for-highlighting).

### Chart

#### styleOptions

> **styleOptions**: `undefined` \| [`ScatterStyleOptions`](../interfaces/interface.ScatterStyleOptions.md)

Configurations for how to style and present a chart's data.

### Callbacks

#### beforeRender

> **beforeRender**: `undefined` \| [`BeforeRenderHandler`](../type-aliases/type-alias.BeforeRenderHandler.md)

A callback that allows you to customize the underlying chart element before it is rendered.
Use the `highchartsOptions` object that is passed to the callback to change
[options values](https://api.highcharts.com/highcharts/) and then return the modified options
object. The returned options are then used when rendering the chart.

This callback is not supported for Indicator Chart, Areamap Chart, and Scattermap Chart.

For an example of how the `onBeforeRender` callback can be used, see the
[Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#callbacks).

***

#### dataPointClick

> **dataPointClick**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md), [`"point"`, `"nativeEvent"`] \> \>

Click handler callback for a data point

***

#### dataPointContextMenu

> **dataPointContextMenu**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md), [`"point"`, `"nativeEvent"`] \> \>

Context menu handler callback for a data point

***

#### dataPointsSelect

> **dataPointsSelect**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`ScatterDataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointsEventHandler.md), [`"points"`, `"nativeEvent"`] \> \>

Handler callback for selection of multiple data points
