---
title: ExecuteQuery
---

# Function ExecuteQuery

> **ExecuteQuery**(`props`): `null` \| `ReactElement`\< `any`, `any` \>

Executes a query and renders a function as child component. The child
component is passed the state of the query as defined in [QueryState](../type-aliases/type-alias.QueryState.md).

This component takes the Children Prop Pattern and
offers an alternative approach to the [useExecuteQuery](function.useExecuteQuery.md) hook.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ExecuteQueryProps`](../interfaces/interface.ExecuteQueryProps.md) | ExecuteQuery properties |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

ExecuteQuery component

## Example

Example of using the component to query the `Sample ECommerce` data source:
```ts
<ExecuteQuery
  dataSource={DM.DataSource}
  dimensions={[DM.Commerce.AgeRange]}
  measures={[measureFactory.sum(DM.Commerce.Revenue)]}
  filters={[filterFactory.greaterThan(DM.Commerce.Revenue, 1000)]}
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
</ExecuteQuery>
```
