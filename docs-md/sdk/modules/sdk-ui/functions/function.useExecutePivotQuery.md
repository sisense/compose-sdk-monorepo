---
title: useExecutePivotQuery
---

# Function useExecutePivotQuery <Badge type="alpha" text="Alpha" />

> **useExecutePivotQuery**(...`args`): [`PivotQueryState`](../type-aliases/type-alias.PivotQueryState.md)

React hook that executes a data query for a pivot table.
This approach is similar to React Query's `useQuery` hook.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`ExecutePivotQueryParams`](../interfaces/interface.ExecutePivotQueryParams.md)] |

## Returns

[`PivotQueryState`](../type-aliases/type-alias.PivotQueryState.md)

Query state that contains the status of the query execution, the result data, or the error if any occurred

## Example

```ts
  const { data, isLoading, isError } = useExecutePivotQuery({
    dataSource: DM.DataSource,
    rows: [
      { attribute: DM.Category.Category, includeSubTotals: true },
      { attribute: DM.Brand.Brand, includeSubTotals: true },
      DM.Commerce.Condition,
    ],
    columns: [DM.Commerce.Gender],
    values: [
      { measure: measures.sum(DM.Commerce.Revenue, 'Total Revenue'), totalsCalculation: 'sum' },
      { measure: measures.sum(DM.Commerce.Quantity, 'Total Quantity'), totalsCalculation: 'min' },
    ],
    grandTotals: {title: 'Grand Totals', rows: true, columns: true},
    filters: [filters.members(DM.Commerce.Gender, ['Female', 'Male'])],
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (data) {
    return <div>[Render pivot table with returned data]</div>;
  }
  return null;
 ```
See also hook [useExecuteQuery](function.useExecuteQuery.md), which execute a generic data query.
