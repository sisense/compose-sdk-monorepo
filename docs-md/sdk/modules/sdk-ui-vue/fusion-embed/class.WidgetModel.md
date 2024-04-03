---
title: WidgetModel
---

# Class WidgetModel <Badge type="fusionEmbed" text="Fusion Embed" />

Model of Sisense widget defined in the abstractions of Compose SDK.

## Methods

### getChartProps

> **getChartProps**(): [`ChartProps`](../interfaces/interface.ChartProps.md)

Returns the props to be used for rendering a chart.

#### Returns

[`ChartProps`](../interfaces/interface.ChartProps.md)

#### Example

```ts
<Chart {...widget.getChartProps()} />
```

Note: this method is not supported for tabular widgets.
Use [getTableProps](class.WidgetModel.md#gettableprops) instead for getting props for the `<Table>`  component.

***

### getChartWidgetProps

> **getChartWidgetProps**(): [`ChartWidgetProps`](../interfaces/interface.ChartWidgetProps.md)

Returns the props to be used for rendering a chart widget.

#### Returns

[`ChartWidgetProps`](../interfaces/interface.ChartWidgetProps.md)

#### Example

```ts
<ChartWidget {...widget.getChartWidgetProps()} />
```

Note: this method is not supported for tabular widgets.

***

### getExecuteQueryParams

> **getExecuteQueryParams**(): [`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md)

Returns the parameters to be used for executing a query for the widget.

#### Returns

[`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md)

#### Example

```ts
const {data, isLoading, isError} = useExecuteQuery(widget.getExecuteQueryParams());
```

***

### getTableProps

> **getTableProps**(): [`TableProps`](../interfaces/interface.TableProps.md)

Returns the props to be used for rendering a table.

#### Returns

[`TableProps`](../interfaces/interface.TableProps.md)

#### Example

```ts
<Table {...widget.getTableProps()} />
```

Note: this method is not supported for chart widgets.
Use [getChartProps](class.WidgetModel.md#getchartprops) instead for getting props for the `<Chart>`  component.

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

> **styleOptions**: [`TableStyleOptions`](../interfaces/interface.TableStyleOptions.md) \| [`ChartStyleOptions`](../type-aliases/type-alias.ChartStyleOptions.md)

Widget style options.

***

### title

> **title**: `string`

Widget title.

***

### widgetType

> **widgetType**: [`WidgetType`](../type-aliases/type-alias.WidgetType.md)

Widget type.
