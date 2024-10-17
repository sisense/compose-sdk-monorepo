---
title: CriteriaFilterTileProps
---

# Interface CriteriaFilterTileProps

Props for [CriteriaFilterTile](../filter-tiles/class.CriteriaFilterTile.md)

## Properties

### arrangement

> **arrangement**?: [`FilterVariant`](../type-aliases/type-alias.FilterVariant.md)

Arrangement of the filter inputs. Use vertical for standard filter tiles and horizontal for toolbars

***

### filter

> **filter**: [`CriteriaFilterType`](../type-aliases/type-alias.CriteriaFilterType.md)

Text or numeric filter object to initialize filter type and default values

***

### measures

> **measures**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

List of available measures to rank by. Required only for ranking filters.

***

### onUpdate

> **onUpdate**: (`filter`) => `void`

Callback returning filter object, or null for failure

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) \| `null` |

#### Returns

`void`

***

### title

> **title**: `string`

Title for the filter tile, which is rendered into the header
