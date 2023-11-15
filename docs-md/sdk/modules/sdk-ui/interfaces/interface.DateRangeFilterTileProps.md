---
title: DateRangeFilterTileProps
---

# Interface DateRangeFilterTileProps

## Properties

### attribute

> **attribute**: [`LevelAttribute`](../../sdk-data/interfaces/interface.LevelAttribute.md)

Date level attribute the filter is based on

***

### dataSource

> **dataSource**?: `string`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

### earliestDate

> **earliestDate**?: `string`

Earliest valid date in date range select. If not specified a query will run.

***

### filter

> **filter**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Date range filter.

***

### lastDate

> **lastDate**?: `string`

Last valid date in date range select. If not specified a query will run.

***

### onChange

> **onChange**: (`filter`) => `void`

Callback function that is called when the date range filter object should be updated.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) | Date range filter |

#### Returns

`void`

***

### title

> **title**: `string`

Title of the filter tile
