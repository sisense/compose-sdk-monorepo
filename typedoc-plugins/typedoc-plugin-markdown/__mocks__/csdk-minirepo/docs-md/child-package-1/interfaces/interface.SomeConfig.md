---
title: SomeConfig
---

# Interface SomeConfig

Some config

## Default

```ts
[]
```

## Properties

### callbacks

> **callbacks**?: [`SomeProps`](../group-1/interface.SomeProps.md) & \{
  `authorized`: (`params`) => `string`;
 }

Comments

> #### `callbacks.authorized`
>
> **authorized**?: (`params`) => `string`
>
> ##### Parameters
>
>
> | Parameter | Type |
> | :------ | :------ |
> | `params` | `object` |
> | `params.auth` | `string` |
> | `params.request` | `boolean` |
>
>
> ##### Returns
>
> `string`
>
>
>
>

***

### prop1

> **`readonly`** **prop1**: `string`

***

### prop2

> **prop2**: `string`

***

### prop3

> **prop3**: `string`

***

### sortType

> **sortType**?: [`PivotRowsSort`](../type-aliases/type-alias.PivotRowsSort.md) \| [`SortDirection`](../type-aliases/type-alias.SortDirection.md)

Sorting configuration that represents either [SortDirection](../type-aliases/type-alias.SortDirection.md) or [PivotRowsSort](../type-aliases/type-alias.PivotRowsSort.md) for the pivot table
