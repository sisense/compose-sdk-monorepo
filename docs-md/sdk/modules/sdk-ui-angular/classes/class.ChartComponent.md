---
title: ChartComponent
---

# Class ChartComponent

An Angular component used for easily switching chart types or rendering multiple series of different chart types.

## Example

An example of using the `Chart` component to
plot a column chart of the Sample Healthcare data source hosted in a Sisense instance:
```ts
// Component behavior in .component.ts
chart = {
  chartType: 'column' as ChartType,
  dataSet: DM.DataSource,
  dataOptions: {
    category: [DM.Admissions.Admission_Time.Months],
    value: [measures.count(DM.Admissions.Patient_ID, 'Total Patients')],
    breakBy: [],
  },
  filters: [filterFactory.members(DM.Doctors.Specialty, ['Oncology', 'Cardiology'])],
  styleOptions: {
    width: 800,
    height: 500,
    xAxis: {
      title: {
        text: 'Months',
        enabled: true,
      },
    },
    yAxis: {
      title: {
        text: 'Total Patients',
        enabled: true,
      },
    },
  },
};
```
```html
<!--Component HTML template in .component.html-->
<csdk-chart
  [chartType]="chart.chartType"
  [dataSet]="chart.dataSet"
  [dataOptions]="chart.dataOptions"
  [filters]="chart.filters"
  [styleOptions]="chart.styleOptions"
/>
```

<img src="../../../img/angular-chart-data-source-example-1.png" width="800px" />

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new ChartComponent**(`sisenseContextService`, `themeService`): [`ChartComponent`](class.ChartComponent.md)

Constructor for the `Chart` component.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](class.SisenseContextService.md) | Sisense context service |
| `themeService` | [`ThemeService`](class.ThemeService.md) | Theme service |

#### Returns

[`ChartComponent`](class.ChartComponent.md)

## Properties

### Data

#### dataSet

> **dataSet**: `undefined` \| `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal [ExecuteQuery](../../sdk-ui/functions/function.ExecuteQuery.md) connect to the data source
and load the data as specified in [dataOptions](class.ChartComponent.md#dataoptions), [filters](class.ChartComponent.md#filters), and [highlights](class.ChartComponent.md#highlights).

OR

(2) Explicit [Data](../../sdk-data/interfaces/interface.Data.md), which is made up of
an array of [columns](../../sdk-data/interfaces/interface.Column.md)
and a two-dimensional array of data [cells](../../sdk-data/interfaces/interface.Cell.md).
This allows the chart component to be used
with user-provided data.

If neither option is specified,
the chart will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../../sdk-ui/functions/function.SisenseContextProvider.md) component.

***

#### filters

> **filters**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

***

#### highlights

> **highlights**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

### Chart

#### chartType

> **chartType**: [`ChartType`](../../sdk-ui/type-aliases/type-alias.ChartType.md)

Default chart type of each series.

***

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

### Constructor

#### sisenseContextService

> **sisenseContextService**: [`SisenseContextService`](class.SisenseContextService.md)

Sisense context service

***

#### themeService

> **themeService**: [`ThemeService`](class.ThemeService.md)

Theme service
