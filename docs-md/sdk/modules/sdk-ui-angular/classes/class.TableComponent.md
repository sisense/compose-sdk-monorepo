---
title: TableComponent
---

# Class TableComponent

Table Component

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new TableComponent**(`sisenseContextService`, `themeService`): [`TableComponent`](class.TableComponent.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](class.SisenseContextService.md) |
| `themeService` | [`ThemeService`](class.ThemeService.md) |

#### Returns

[`TableComponent`](class.TableComponent.md)

## Properties

### Data

#### dataOptions

> **dataOptions**: [`TableDataOptions`](../../sdk-ui/type-aliases/type-alias.TableDataOptions.md)

Highlight filters that will highlight results that pass filter criteria

***

#### dataSet

> **dataSet**: `undefined` \| `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal [ExecuteQuery](../../sdk-ui/functions/function.ExecuteQuery.md) connect to the data source
and load the data as specified in [dataOptions](class.TableComponent.md#dataoptions), [filters](class.TableComponent.md#filters), and [highlights](../../sdk-ui/interfaces/interface.ChartProps.md#highlights).

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

### Representation

#### styleOptions

> **styleOptions**: `undefined` \| [`TableStyleOptions`](../../sdk-ui/interfaces/interface.TableStyleOptions.md)

Style options union across chart types.
