---
title: ExecuteQueryByWidgetId
---

# Function ExecuteQueryByWidgetId <Badge type="fusionEmbed" text="Fusion Embed" />

> **ExecuteQueryByWidgetId**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

Executes a query over the existing widget and renders a function as child component.
The child component is passed the state of the query as defined in [QueryByWidgetIdState](../type-aliases/type-alias.QueryByWidgetIdState.md).

This component takes the Children Prop Pattern and
offers an alternative approach to the [useExecuteQueryByWidgetId](function.useExecuteQueryByWidgetId.md) hook.

**Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ExecuteQueryByWidgetIdProps`](../interfaces/interface.ExecuteQueryByWidgetIdProps.md) | ExecuteQueryByWidgetId properties |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

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
