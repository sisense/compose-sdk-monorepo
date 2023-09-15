---
title: ExecuteQueryByWidgetId
---

# Function ExecuteQueryByWidgetId

> **ExecuteQueryByWidgetId**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

Executes a query over the existing widget and renders a function as child component.
The child component is passed the results of the query.

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
  (data, query) => {
    if (data) {
      return <div>{`Total Rows: ${data.rows.length}`}</div>;
    }
  }
}
</ExecuteQueryByWidgetId>
```
