---
title: ExecuteQueryByWidgetId
---

# Function ExecuteQueryByWidgetId

> **ExecuteQueryByWidgetId**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

Executes a query over the existing widget and renders a function as child component.
The child component is passed the state of the query as defined in [QueryByWidgetIdState](../type-aliases/type-alias.QueryByWidgetIdState.md).

This component takes the Children Prop Pattern and
offers an alternative approach to the [useExecuteQueryByWidgetId](function.useExecuteQueryByWidgetId.md) hook.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ExecuteQueryByWidgetIdProps`](../interfaces/interface.ExecuteQueryByWidgetIdProps.md) | ExecuteQueryByWidgetId properties |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

ExecuteQueryByWidgetId component

## Example

The example below executes a query over the existing dashboard widget with the specified widget and dashboard OIDs.
```ts
<ExecuteQueryByWidgetId
  widgetOid={'64473e07dac1920034bce77f'}
  dashboardOid={'6441e728dac1920034bce737'}
>
{
  ({data, isLoading, isError}) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (isError) {
      return <div>Error</div>;
    }
    if (data) {
      console.log(data);
      return <div>{`Total Rows: ${data.rows.length}`}</div>;
    }
    return null;
  }
}
</ExecuteQueryByWidgetId>
```
