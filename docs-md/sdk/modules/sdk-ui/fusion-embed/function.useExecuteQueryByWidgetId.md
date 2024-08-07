---
title: useExecuteQueryByWidgetId
---

# Function useExecuteQueryByWidgetId <Badge type="fusionEmbed" text="Fusion Embed" />

> **useExecuteQueryByWidgetId**(...`args`): [`QueryByWidgetIdState`](../type-aliases/type-alias.QueryByWidgetIdState.md)

React hook that executes a data query extracted from an existing widget in the Sisense instance.

This approach, which offers an alternative to [ExecuteQueryByWidgetId](function.ExecuteQueryByWidgetId.md) component, is similar to React Query's `useQuery` hook.

**Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`ExecuteQueryByWidgetIdParams`](../interfaces/interface.ExecuteQueryByWidgetIdParams.md)] |

## Returns

[`QueryByWidgetIdState`](../type-aliases/type-alias.QueryByWidgetIdState.md)

Query state that contains the status of the query execution, the result data, the constructed query parameters, or the error if any occurred

## Example

The example below executes a query over the existing dashboard widget with the specified widget and dashboard OIDs.
```ts
 const { data, isLoading, isError } = useExecuteQueryByWidgetId({
   widgetOid: '64473e07dac1920034bce77f',
   dashboardOid: '6441e728dac1920034bce737'
 });
 if (isLoading) {
   return <div>Loading...</div>;
 }
 if (isError) {
   return <div>Error</div>;
 }
 if (data) {
   return <div>{`Total Rows: ${data.rows.length}`}</div>;
 }
 return null;
```
See also hook [useExecuteQuery](../queries/function.useExecuteQuery.md), which execute a query specified in code.
