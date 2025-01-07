---
title: RelativeDateFilterTileProps
---

# Interface RelativeDateFilterTileProps

Props for [RelativeDateFilterTile](../filter-tiles/function.RelativeDateFilterTile.md)

## Properties

### arrangement

> **arrangement**?: [`FilterVariant`](../type-aliases/type-alias.FilterVariant.md)

Arrangement of the filter inputs. Use vertical for standard filter tiles and horizontal for toolbars

***

### filter

> **filter**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Relative date filter.

***

### limit

> **limit**?: `object`

Limit of the date range that can be selected.

#### Type declaration

> ##### `limit.maxDate`
>
> **maxDate**: `string`
>
> ##### `limit.minDate`
>
> **minDate**: `string`
>
>

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

### onUpdate

> **onUpdate**: (`filter`) => `void`

Callback function that is called when the relative date filter object should be updated.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) | Relative date filter |

#### Returns

`void`

***

### title

> **title**: `string`

Filter tile title
