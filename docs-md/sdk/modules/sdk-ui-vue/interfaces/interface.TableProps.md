---
title: TableProps
---

# Interface TableProps

Props of the [Table](../data-grids/class.Table.md) component.

## Properties

### Data

#### dataSet

> **dataSet**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md) \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for a chart using one of the following options. If neither option is specified, the chart
will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../contexts/class.SisenseContextProvider.md)
component.

(1) Sisense data source name as a string. For example, `'Sample ECommerce'`. Typically, you
retrieve the data source name from a data model you create using the `get-data-model`
[command](https://sisense.dev/guides/sdk/guides/cli.html) of the Compose SDK CLI. Under the hood, the chart
connects to the data source, executes a query, and loads the data as specified in
[dataOptions](interface.TableProps.md#dataoptions), [filters](interface.TableProps.md#filters), and [highlights](interface.AreaChartProps.md#highlights).

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

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

Filters that will slice query results

### Representation

#### dataOptions

> **dataOptions**: [`TableDataOptions`](interface.TableDataOptions.md)

Configurations for how to interpret and present the data passed to the component

***

#### styleOptions

> **styleOptions**?: [`TableStyleOptions`](interface.TableStyleOptions.md)

Configurations for how to style and present a table's data.
