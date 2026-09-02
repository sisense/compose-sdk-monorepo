---
title: RelativeDateFilterTileProps
---

# Interface RelativeDateFilterTileProps

Props of the [RelativeDateFilterTileComponent](../filter-tiles/class.RelativeDateFilterTileComponent.md).

## Properties

### arrangement

> **arrangement**?: [`FilterVariant`](../type-aliases/type-alias.FilterVariant.md)

Arrangement of the filter inputs. Use vertical for standard filter tiles and horizontal for toolbars

***

### config

> **config**?: [`FilterTileConfig`](interface.FilterTileConfig.md)

Configuration for the filter tile.

The tile menu — both the built-in lock item and any custom items — lives in the tile header,
which this component renders only when `arrangement` is `'vertical'`. Set `arrangement`
accordingly to use `config.header.menu` or `config.actions.lockFilter` here.

***

### filter

> **filter**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Relative date filter.

***

### filterChange

> **filterChange**?: (`filter`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) |

#### Returns

`void`

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

### title

> **title**: `string`

Filter tile title
