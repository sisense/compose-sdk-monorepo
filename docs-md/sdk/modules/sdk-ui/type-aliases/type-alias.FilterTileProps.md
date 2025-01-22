---
title: FilterTileProps
---

# Type alias FilterTileProps

> **FilterTileProps**: `object`

Props of the [FilterTile](../filter-tiles/function.FilterTile.md) component

## Type declaration

### `defaultDataSource`

**defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Default data source used for filter tiles

***

### `filter`

**filter**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Filter to display

***

### `onChange`

**onChange**: (`filter`) => `void`

Callback to handle filter change

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) \| `null` |

#### Returns

`void`

***

### `onDelete`

**onDelete**?: () => `void`

Filter delete callback

#### Returns

`void`

***

### `onEdit`

**onEdit**?: () => `void`

Filter edit callback

#### Returns

`void`
