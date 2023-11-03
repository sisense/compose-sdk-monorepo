---
title: QueryService
---

# Class QueryService

## Constructors

### constructor

> **new QueryService**(`sisenseContextService`): [`QueryService`](class.QueryService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](class.SisenseContextService.md) |

#### Returns

[`QueryService`](class.QueryService.md)

## Methods

### executeQuery

> **executeQuery**(`params`): `Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
 } \>

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `params` | [`ExecuteQueryParams`](../../sdk-ui/type-aliases/type-alias.ExecuteQueryParams.md) |

#### Returns

`Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
 } \>

***

### executeQueryByWidgetId

> **executeQueryByWidgetId**(`params`): `Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
  `query`: [`ExecuteQueryParams`](../../sdk-ui/type-aliases/type-alias.ExecuteQueryParams.md);
 } \>

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `params` | [`ExecuteQueryByWidgetIdParams`](../../sdk-ui/interfaces/interface.ExecuteQueryByWidgetIdParams.md) |

#### Returns

`Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
  `query`: [`ExecuteQueryParams`](../../sdk-ui/type-aliases/type-alias.ExecuteQueryParams.md);
 } \>
