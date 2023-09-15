---
title: ExecuteQuery
---

# Function ExecuteQuery

> **ExecuteQuery**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

Executes a query and renders a function as child component. The child
component is passed the results of the query.

This component takes the Children Prop Pattern and
offers an alternative approach to the [useExecuteQuery](function.useExecuteQuery.md) hook.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ExecuteQueryProps`](../interfaces/interface.ExecuteQueryProps.md) | ExecuteQuery properties |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

ExecuteQuery component

## Example

Example of using the component to query the `Sample ECommerce` data source:
```ts
<ExecuteQuery
  dataSource={DM.DataSource}
  dimensions={[DM.Commerce.AgeRange]}
  measures={[measures.sum(DM.Commerce.Revenue)]}
  filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
>
{
  (data) => {
    if (data) {
      console.log(data);
      return <div>{`Total Rows: ${data.rows.length}`}</div>;
    }
  }
}
</ExecuteQuery>
```
