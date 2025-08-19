---
title: CustomWidgetComponentProps
---

# Interface CustomWidgetComponentProps`<DataOptions, StyleOptions>`

Props passed to a user-defined custom widget component.

## Type parameters

| Parameter | Default |
| :------ | :------ |
| `DataOptions` | [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md) |
| `StyleOptions` | `any` |

## Properties

### dataOptions

> **dataOptions**: `DataOptions`

***

### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

***

### description

> **description**?: `string`

***

### filters

> **filters**?: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### styleOptions

> **styleOptions**: `StyleOptions` & \{
  `height`: `number`;
  `width`: `number`;
 }

> #### `styleOptions.height`
>
> **height**?: `number`
>
> The height of the custom widget component.
>
> #### `styleOptions.width`
>
> **width**?: `number`
>
> The width of the custom widget component.
>
>
