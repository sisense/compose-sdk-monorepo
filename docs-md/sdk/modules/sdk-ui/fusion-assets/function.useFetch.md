---
title: useFetch
---

# Function useFetch

> **useFetch**<`TData`, `TError`>(...`args`): [`UseQueryResult`](../type-aliases/type-alias.UseQueryResult.md)\< `TData`, `TError` \>

React hook that allows to make authorized fetch request to any Sisense API.

## Type parameters

| Parameter | Default |
| :------ | :------ |
| `TData` | `unknown` |
| `TError` | `unknown` |

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [`string`, `RequestInit`, \{<br />  `enabled`: `boolean`;<br />  `requestConfig`: [`RequestConfig`](../type-aliases/type-alias.RequestConfig.md);<br /> }] |

## Returns

[`UseQueryResult`](../type-aliases/type-alias.UseQueryResult.md)\< `TData`, `TError` \>

Query state that contains the status of the query execution, the result data, or the error if any occurred

## Example

```ts
 const { data, isLoading, error } = useFetch<unknown, Error>('api/v1/elasticubes/getElasticubes', {
   method: 'POST',
 });
```
