---
title: WidgetModel
---

# Class WidgetModel <Badge type="fusionEmbed" text="Fusion Embed" />

Model of Sisense widget defined in the abstractions of Compose SDK.

## Methods

### getChartProps

> **getChartProps**(): [`ChartProps`](../../sdk-ui/interfaces/interface.ChartProps.md)

Returns the props to be used for rendering a chart.

#### Returns

[`ChartProps`](../../sdk-ui/interfaces/interface.ChartProps.md)

#### Example

```ts
<Chart {...widget.getChartProps()} />
```

Note: this method is not supported for tabular widgets.
Use [getTableProps](class.WidgetModel.md#gettableprops) instead for getting props for the `<Table>`  component.
Use [getPivotTableProps](class.WidgetModel.md#getpivottableprops) instead for getting props for the `<PivotTable>`  component.

***

### getChartWidgetProps

> **getChartWidgetProps**(): [`ChartWidgetProps`](../../sdk-ui/interfaces/interface.ChartWidgetProps.md)

Returns the props to be used for rendering a chart widget.

#### Returns

[`ChartWidgetProps`](../../sdk-ui/interfaces/interface.ChartWidgetProps.md)

#### Example

```ts
<ChartWidget {...widget.getChartWidgetProps()} />
```

Note: this method is not supported for pivot widgets.

***

### getExecutePivotQueryParams

> **getExecutePivotQueryParams**(): [`ExecutePivotQueryParams`](../../sdk-ui/interfaces/interface.ExecutePivotQueryParams.md)

Returns the parameters to be used for executing a query for the pivot widget.

#### Returns

[`ExecutePivotQueryParams`](../../sdk-ui/interfaces/interface.ExecutePivotQueryParams.md)

#### Example

```ts
const {data, isLoading, isError} = useExecutePivotQuery(widget.getExecutePivotQueryParams());
```

Note: this method is supported only for getting pivot query.
Use [getExecuteQueryParams](class.WidgetModel.md#getexecutequeryparams) instead for getting query parameters for non-pivot widgets.

***

### getExecuteQueryParams

> **getExecuteQueryParams**(): [`ExecuteQueryParams`](../../sdk-ui/interfaces/interface.ExecuteQueryParams.md)

Returns the parameters to be used for executing a query for the widget.

#### Returns

[`ExecuteQueryParams`](../../sdk-ui/interfaces/interface.ExecuteQueryParams.md)

#### Example

```ts
const {data, isLoading, isError} = useExecuteQuery(widget.getExecuteQueryParams());
```

Note: this method is not supported for getting pivot query.
Use [getExecutePivotQueryParams](class.WidgetModel.md#getexecutepivotqueryparams) instead for getting query parameters for the pivot widget.

***

### getPivotTableProps

> **getPivotTableProps**(): [`PivotTableProps`](../../sdk-ui/interfaces/interface.PivotTableProps.md)

Returns the props to be used for rendering a pivot table.

#### Returns

[`PivotTableProps`](../../sdk-ui/interfaces/interface.PivotTableProps.md)

#### Example

```ts
<PivotTable {...widget.getPivotTableProps()} />
```

Note: this method is not supported for chart or table widgets.
Use [getChartProps](class.WidgetModel.md#getchartprops) instead for getting props for the `<Chart>`  component.
Use [getTableProps](class.WidgetModel.md#gettableprops) instead for getting props for the `<Table>`  component.

***

### getTableProps

> **getTableProps**(): [`TableProps`](../../sdk-ui/interfaces/interface.TableProps.md)

Returns the props to be used for rendering a table.

#### Returns

[`TableProps`](../../sdk-ui/interfaces/interface.TableProps.md)

#### Example

```ts
<Table {...widget.getTableProps()} />
```

Note: this method is not supported for chart and pivot widgets.
Use [getChartProps](class.WidgetModel.md#getchartprops) instead for getting props for the `<Chart>`  component.
Use [getPivotTableProps](class.WidgetModel.md#getpivottableprops) instead for getting props for the `<PivotTable>`  component.

## Properties

### chartType

> **chartType**?: [`ChartType`](../type-aliases/type-alias.ChartType.md)

Widget chart type.

***

### dataOptions

> **dataOptions**: [`WidgetDataOptions`](../type-aliases/type-alias.WidgetDataOptions.md)

Widget data options.

***

### dataSource

> **dataSource**: `string`

Full name of the widget data source.

***

### description

> **description**: `string`

Widget description.

***

### drilldownOptions

> **drilldownOptions**: [`DrilldownOptions`](../type-aliases/type-alias.DrilldownOptions.md)

Widget drilldown options.

***

### filters

> **filters**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Widget filters.

***

### highlights

> **highlights**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Widget highlights.

***

### oid

> **oid**: `string`

Unique identifier of the widget.

***

### styleOptions

> **styleOptions**: [`WidgetStyleOptions`](../type-aliases/type-alias.WidgetStyleOptions.md)

Widget style options.

***

### title

> **title**: `string`

Widget title.

***

### widgetType

> **widgetType**: [`WidgetType`](../type-aliases/type-alias.WidgetType.md)

Widget type.
