---
title: FilterTileProps
---

# Interface FilterTileProps

Props of the [`FilterTile`](../filter-tiles/class.FilterTile.md) component.

## Properties

### defaultDataSource

> **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Default data source used for filter tiles

***

### filter

> **filter**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Filter to display

***

### onChange

> **onChange**: (`filter`) => `void`

Callback to handle filter change

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) \| `null` |

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

> **onEdit**?: (`levelIndex`?) => `void`

Filter edit callback

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `levelIndex`? | `number` | Index of the filter level that triggers the onEdit action (in the case of a CascadingFilter) |

#### Returns

`void`
