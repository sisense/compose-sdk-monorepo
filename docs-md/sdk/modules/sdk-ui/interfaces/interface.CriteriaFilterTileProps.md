---
title: CriteriaFilterTileProps
---

# Interface CriteriaFilterTileProps

Props for [CriteriaFilterTile](../functions/function.CriteriaFilterTile.md)

## Properties

### arrangement

> **arrangement**?: [`FilterVariant`](../type-aliases/type-alias.FilterVariant.md)

Arrangement of the filter inputs. Use vertical for standard filter tiles and horizontal for toolbars

***

### filter

> **filter**: [`CriteriaFilterType`](../type-aliases/type-alias.CriteriaFilterType.md)

Text or numeric filter object to initialize filter type and default values

***

### onUpdate

> **onUpdate**: (`filter`) => `void`

Callback returning filter object, or null for failure

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | `null` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md) |

#### Returns

`void`

***

### title

> **title**: `string`

Title for the filter tile, which is rendered into the header
