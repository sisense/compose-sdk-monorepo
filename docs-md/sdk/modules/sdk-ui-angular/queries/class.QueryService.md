---
title: QueryService
---

# Class QueryService

Service for executing data queries.

## Constructors

### constructor

> **new QueryService**(`sisenseContextService`): [`QueryService`](class.QueryService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |

#### Returns

[`QueryService`](class.QueryService.md)

## Methods

### executePivotQuery <Badge type="beta" text="Beta" />

> **executePivotQuery**(`params`): `Promise`\< \{
  `data`: [`PivotQueryResultData`](../../sdk-data/interfaces/interface.PivotQueryResultData.md);
 } \>

Executes a data query for a pivot table.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ExecutePivotQueryParams`](../interfaces/interface.ExecutePivotQueryParams.md) | Pivot query parameters |

#### Returns

`Promise`\< \{
  `data`: [`PivotQueryResultData`](../../sdk-data/interfaces/interface.PivotQueryResultData.md);
 } \>

Pivot query result

***

### executeQuery

> **executeQuery**(`params`): `Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
 } \>

Executes a data query. If you want to display the query results, you can use
them to populate Compose SDK UI elements or third party UI elements.

To learn how to populate third party UI elements with query results, see the
[External Charts Guide](/guides/sdk/guides/charts/guide-external-charts.html#query)

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md) | Query parameters |

#### Returns

`Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
 } \>

Query result

***

### executeQueryByWidgetId

> **executeQueryByWidgetId**(`params`): `Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
 } & [`QueryByWidgetIdQueryParams`](../../sdk-ui/type-aliases/type-alias.QueryByWidgetIdQueryParams.md) \>

Executes a data query extracted from an existing widget in the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ExecuteQueryByWidgetIdParams`](../interfaces/interface.ExecuteQueryByWidgetIdParams.md) | Parameters to identify the target widget |

#### Returns

`Promise`\< \{
  `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
 } & [`QueryByWidgetIdQueryParams`](../../sdk-ui/type-aliases/type-alias.QueryByWidgetIdQueryParams.md) \>

Query result
