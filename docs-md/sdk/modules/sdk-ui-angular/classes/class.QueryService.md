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

Executes a data query.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md) | Query parameters<br />return Query result |

#### Returns

`Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
 } \>

***

### executeQueryByWidgetId

> **executeQueryByWidgetId**(`params`): `Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
  `query`: `Omit`\< [`ExecuteQueryParams`](../../sdk-ui/interfaces/interface.ExecuteQueryParams.md), `"filters"` \> & \{
    `filters`: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[];
  };
 } \>

Executes a data query extracted from an existing widget in the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ExecuteQueryByWidgetIdParams`](../interfaces/interface.ExecuteQueryByWidgetIdParams.md) | Parameters to identify the target widget |

#### Returns

`Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
  `query`: `Omit`\< [`ExecuteQueryParams`](../../sdk-ui/interfaces/interface.ExecuteQueryParams.md), `"filters"` \> & \{
    `filters`: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[];
  };
 } \>

Query result
