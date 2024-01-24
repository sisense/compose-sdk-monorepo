---
title: TableComponent
---

# Class TableComponent

Table with aggregation and pagination.

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

> **dataOptions**: [`TableDataOptions`](../interfaces/interface.TableDataOptions.md)

Configurations for how to interpret and present the data passed to the component

***

#### dataSet

> **dataSet**: `undefined` \| `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal query connect to the data source
and load the data as specified in [dataOptions](class.TableComponent.md#dataoptions), [filters](class.TableComponent.md#filters), and [highlights](../../sdk-ui/interfaces/interface.ChartProps.md#highlights).

OR

(2) Explicit [Data](../../sdk-data/interfaces/interface.Data.md), which is made up of
an array of [columns](../../sdk-data/interfaces/interface.Column.md)
and a two-dimensional array of data [cells](../../sdk-data/interfaces/interface.Cell.md).
This allows the chart component to be used
with user-provided data.

If neither option is specified,
the chart will use the `defaultDataSource` specified in the parent Sisense Context.

***

#### filters

> **filters**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelation`](../../sdk-data/interfaces/interface.FilterRelation.md)

Filters that will slice query results

### Representation

#### styleOptions

> **styleOptions**: `undefined` \| [`TableStyleOptions`](../interfaces/interface.TableStyleOptions.md)

Configurations that define functional style of the various table elements
