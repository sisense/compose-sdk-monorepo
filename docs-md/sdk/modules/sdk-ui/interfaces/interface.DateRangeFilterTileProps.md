---
title: DateRangeFilterTileProps
---

# Interface DateRangeFilterTileProps

Props of the [DateRangeFilterTile](../filter-tiles/function.DateRangeFilterTile.md) component.

## Properties

### attribute

> **attribute**: [`LevelAttribute`](../../sdk-data/interfaces/interface.LevelAttribute.md)

Date level attribute the filter is based on

***

### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

### earliestDate

> **earliestDate**?: `string`

Earliest allowed date for selection.

If not specified, the earliest date of the target date-level attribute will be used.

***

### filter

> **filter**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Date range filter.

***

### lastDate

> **lastDate**?: `string`

Latest allowed date for selection.

If not specified, the latest date of the target date-level attribute will be used.

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

### onDelete

> **onDelete**?: () => `void`

Filter delete callback

#### Returns

`void`

***

### onEdit

> **onEdit**?: () => `void`

Filter edit callback

#### Returns

`void`

***

### parentFilters

> **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

List of filters this filter is dependent on.

***

### title

> **title**: `string`

Filter tile title
