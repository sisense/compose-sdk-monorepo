---
title: WidgetModel
---

# Interface WidgetModel <Badge type="fusionEmbed" text="Fusion Embed" />

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

Note: this method is not supported for pivot table widgets.
Use [getPivotTableProps](interface.WidgetModel.md#getpivottableprops) instead for getting props for the `<PivotTable>`  component.

::: warning Deprecated
Use [widgetModelTranslator.toChartProps](namespace.widgetModelTranslator/functions/function.toChartProps.md) instead
:::

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

::: warning Deprecated
Use [widgetModelTranslator.toChartWidgetProps](namespace.widgetModelTranslator/functions/function.toChartWidgetProps.md) instead
:::

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
Use [getExecuteQueryParams](interface.WidgetModel.md#getexecutequeryparams) instead for getting query parameters for non-pivot widgets.

::: warning Deprecated
Use [widgetModelTranslator.toExecutePivotQueryParams](namespace.widgetModelTranslator/functions/function.toExecutePivotQueryParams.md) instead
:::

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
Use [getExecutePivotQueryParams](interface.WidgetModel.md#getexecutepivotqueryparams) instead for getting query parameters for the pivot widget.

::: warning Deprecated
Use [widgetModelTranslator.toExecuteQueryParams](namespace.widgetModelTranslator/functions/function.toExecuteQueryParams.md) instead
:::

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
Use [getChartProps](interface.WidgetModel.md#getchartprops) instead for getting props for the `<Chart>`  component.
Use [getTableProps](interface.WidgetModel.md#gettableprops) instead for getting props for the `<Table>`  component.

::: warning Deprecated
Use [widgetModelTranslator.toPivotTableProps](namespace.widgetModelTranslator/functions/function.toPivotTableProps.md) instead
:::

***

### getPivotTableWidgetProps

> **getPivotTableWidgetProps**(): [`PivotTableWidgetProps`](../../sdk-ui/interfaces/interface.PivotTableWidgetProps.md)

Returns the props to be used for rendering a pivot table widget.

#### Returns

[`PivotTableWidgetProps`](../../sdk-ui/interfaces/interface.PivotTableWidgetProps.md)

#### Example

```ts
<PivotTableWidget {...widget.getPivotTableWidgetProps()} />
```

Note: this method is not supported for chart or table widgets.
Use [getChartWidgetProps](interface.WidgetModel.md#getchartwidgetprops) instead for getting props for the `<ChartWidget>`  component.

::: warning Deprecated
Use [widgetModelTranslator.toPivotTableWidgetProps](namespace.widgetModelTranslator/functions/function.toPivotTableWidgetProps.md) instead
:::

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
Use [getChartProps](interface.WidgetModel.md#getchartprops) instead for getting props for the `<Chart>`  component.
Use [getPivotTableProps](interface.WidgetModel.md#getpivottableprops) instead for getting props for the `<PivotTable>`  component.

::: warning Deprecated
Use [widgetModelTranslator.toTableProps](namespace.widgetModelTranslator/functions/function.toTableProps.md) instead
:::

***

### getTextWidgetProps

> **getTextWidgetProps**(): [`TextWidgetProps`](../interfaces/interface.TextWidgetProps.md)

Returns the props to be used for rendering a text widget.

#### Returns

[`TextWidgetProps`](../interfaces/interface.TextWidgetProps.md)

#### Example

```ts
<TextWidget {...widget.getTextWidgetProps()} />
```

Note: this method is not supported for chart or pivot widgets.
Use [getChartWidgetProps](interface.WidgetModel.md#getchartwidgetprops) instead for getting props for the `<ChartWidget>`  component.
Use [getPivotTableWidgetProps](interface.WidgetModel.md#getpivottablewidgetprops) instead for getting props for the `<PivotTableWidget>`  component.

::: warning Deprecated
Use [widgetModelTranslator.toTextWidgetProps](namespace.widgetModelTranslator/functions/function.toTextWidgetProps.md) instead
:::

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

> **dataSource**: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

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

> **`readonly`** **oid**: `string`

Unique identifier of the widget.

***

### pluginType

> **pluginType**: `string`

Plugin type. Only present for plugin widgets.

If this is a plugin widget, this is typically the name/ID of the plugin.

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

::: warning Deprecated
Use [widgetModelTranslator](namespace.widgetModelTranslator/index.md) methods instead
:::
