---
title: UseGetNlgQueryResultParams
---

# Interface UseGetNlgQueryResultParams

Parameters for [useGetNlgQueryResult](../functions/function.useGetNlgQueryResult.md) hook.

## Extends

- [`GetNlgQueryResultRequest`](interface.GetNlgQueryResultRequest.md)

## Properties

### enabled

> **enabled**?: `boolean`

Boolean flag to enable/disable API call by default

If not specified, the default value is `true`

***

### jaql

> **jaql**: `object`

#### Type declaration

> ##### `jaql.datasource`
>
> **datasource**: `object`
>
> The data source that the JAQL metadata targets - e.g. `Sample ECommerce`
>
> > ###### `datasource.title`
> >
> > **title**: `string`
> >
> >
>
> ##### `jaql.metadata`
>
> **metadata**: `unknown`[]
>
> The metadata that composes the JAQL to be analyzed
>
>

#### Inherited from

[`GetNlgQueryResultRequest`](interface.GetNlgQueryResultRequest.md).[`jaql`](interface.GetNlgQueryResultRequest.md#jaql)

***

### style

> **style**: `"Large"` \| `"Medium"` \| `"Small"`

#### Inherited from

[`GetNlgQueryResultRequest`](interface.GetNlgQueryResultRequest.md).[`style`](interface.GetNlgQueryResultRequest.md#style)
