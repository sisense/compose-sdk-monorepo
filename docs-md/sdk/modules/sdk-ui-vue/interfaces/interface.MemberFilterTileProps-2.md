---
title: MemberFilterTileProps
---

# Interface MemberFilterTileProps

Props for [MemberFilterTile](../classes/class.MemberFilterTile-2.md)

## Properties

### attribute

> **attribute**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Attribute to filter on. A query will run to fetch all this attribute's members

***

### dataSource

> **dataSource**?: `string`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

### filter

> **filter**: `null` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Source filter object. Caller is responsible for keeping track of filter state

***

### onChange

> **onChange**: (`filter`) => `void`

Callback indicating when the source member filter object should be updated

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | `null` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md) |

#### Returns

`void`

***

### parentFilters

> **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

List of filters this filter is dependent on

***

### title

> **title**: `string`

Title for the filter tile, which is rendered into the header
