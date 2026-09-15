---
title: boxWhiskerProcessResult
---

# Function boxWhiskerProcessResult

> **boxWhiskerProcessResult**(
  `boxWhiskerData`,
  `outliersData`,
  `dataOptions`?): [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md)

Processes box whisker data and outliers data to combine them into a single data set.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `boxWhiskerData` | [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) | The data for the box whisker. |
| `outliersData` | [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) | The data for the outliers. |
| `dataOptions`? | [`BoxplotChartCustomDataOptions`](../type-aliases/type-alias.BoxplotChartCustomDataOptions.md) | Optional data options for customizing data processing. |

## Returns

[`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md)

The combined data with outliers included in the box whisker plot.

## Example

Without custom `dataOptions`, the category is expected at column index 0, and the whisker
min/max at columns 4 and 5, matching the query shape used internally by
[`BoxplotChart`](../../sdk-ui/charts/function.BoxplotChart.md).

```ts
import { boxWhiskerProcessResult } from '@sisense/sdk-ui';

const boxWhiskerData = {
  columns: [
    { name: 'Category' },
    { name: 'Median' },
    { name: 'Q1' },
    { name: 'Q3' },
    { name: 'Min' },
    { name: 'Max' },
  ],
  rows: [[{ data: 'A' }, { data: 30 }, { data: 20 }, { data: 40 }, { data: 10 }, { data: 50 }]],
};
const outliersData = {
  columns: [{ name: 'Category' }, { name: 'Value' }],
  rows: [[{ data: 'A' }, { data: 75 }]],
};

// Each result row gains an extra cell listing outlier values outside the whisker range.
const combined = boxWhiskerProcessResult(boxWhiskerData, outliersData);
```
