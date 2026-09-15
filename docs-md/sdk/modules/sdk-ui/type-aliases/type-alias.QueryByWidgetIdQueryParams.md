---
title: QueryByWidgetIdQueryParams
---

# Type alias QueryByWidgetIdQueryParams

> **QueryByWidgetIdQueryParams**: `object`

Query parameters constructed over either a chart widget or pivot table widget. This is returned as part of the query state [QueryByWidgetIdState](type-alias.QueryByWidgetIdState.md).

## Example

```ts
import { useExecuteQueryByWidgetId } from '@sisense/sdk-ui';

const CodeExample = () => {
  const { query, pivotQuery } = useExecuteQueryByWidgetId({
    widgetOid: '64473e07dac1920034bce77f',
    dashboardOid: '6441e728dac1920034bce737',
  });

  // `query` is populated for chart widgets, `pivotQuery` for pivot table widgets.
  const selectedQuery = query ?? pivotQuery;
  if (!selectedQuery) return null;

  return <pre>{JSON.stringify(selectedQuery, null, 2)}</pre>;
};

export default CodeExample;
```

## Type declaration

### `pivotQuery`

**pivotQuery**: [`ExecutePivotQueryParams`](../interfaces/interface.ExecutePivotQueryParams.md) \| `undefined`

Query parameters constructed over the pivot table widget

***

### `query`

**query**: [`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md) \| `undefined`

Query parameters constructed over the chart widget
