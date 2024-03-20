---
title: TableComponent
---

# Class TableComponent

Table with aggregation and pagination.

## Example

```html
 <csdk-table [dataSet]="table.dataSet" [dataOptions]="table.dataOptions" [filters]="filters" />
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
 table = {
   dataSet: DM.DataSource,
   dataOptions: {
     columns: [DM.Admissions.Patient_ID, measureFactory.sum(DM.Admissions.Cost_of_admission)],
   },
 };

}
```
<img src="../../../img/angular-table-chart-example.png" width="800px" />

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
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) |

#### Returns

[`TableComponent`](class.TableComponent.md)

## Properties

### Data

#### dataOptions

> **dataOptions**: [`TableDataOptions`](../interfaces/interface.TableDataOptions.md)

Configurations for how to interpret and present the data passed to the component

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
[dataOptions](class.TableComponent.md#dataoptions), [filters](class.TableComponent.md#filters), and [highlights](../../sdk-ui/interfaces/interface.ChartProps.md#highlights).

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

Filters that will slice query results

### Representation

#### styleOptions

> **styleOptions**: `undefined` \| [`TableStyleOptions`](../interfaces/interface.TableStyleOptions.md)

Configurations for how to style and present a table's data.
