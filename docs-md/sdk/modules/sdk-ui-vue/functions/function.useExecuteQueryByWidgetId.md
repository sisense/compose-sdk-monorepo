---
title: useExecuteQueryByWidgetId
---

# Function useExecuteQueryByWidgetId

> **useExecuteQueryByWidgetId**(`params`): `Promise`\< \{
  `data`: \{
    `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
    `query`: `Omit`\< [`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md), `"filters"` \> & \{
      `filters`: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[];
    };
  };
 } \>

## Parameters

| Parameter | Type |
| :------ | :------ |
| `params` | [`ExecuteQueryByWidgetIdParams`](../interfaces/interface.ExecuteQueryByWidgetIdParams.md) |

## Returns

`Promise`\< \{
  `data`: \{
    `data`: [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md);
    `query`: `Omit`\< [`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md), `"filters"` \> & \{
      `filters`: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[];
    };
  };
 } \>
