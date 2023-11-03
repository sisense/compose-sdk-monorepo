---
title: TableProps
---

# Interface TableProps

Props of the [Table](../functions/function.Table.md) component.

## Properties

### Data

#### dataSet

> **dataSet**?: `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal [ExecuteQuery](../functions/function.ExecuteQuery.md) connect to the data source
and load the data as specified in [dataOptions](interface.TableProps.md#dataoptions), [filters](interface.TableProps.md#filters), and [highlights](interface.ChartProps.md#highlights).

OR

(2) Explicit [Data](../../sdk-data/interfaces/interface.Data.md), which is made up of
an array of [columns](../../sdk-data/interfaces/interface.Column.md)
and a two-dimensional array of data [cells](../../sdk-data/interfaces/interface.Cell.md).
This allows the chart component to be used
with user-provided data.

If neither option is specified,
the chart will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../functions/function.SisenseContextProvider.md) component.

***

#### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

### Representation

#### dataOptions

> **dataOptions**: [`TableDataOptions`](../type-aliases/type-alias.TableDataOptions.md)

Configurations for how to interpret and present the data passed to the component

***

#### styleOptions

> **styleOptions**?: [`TableStyleOptions`](interface.TableStyleOptions.md)

Configurations that define functional style of the various table elements
