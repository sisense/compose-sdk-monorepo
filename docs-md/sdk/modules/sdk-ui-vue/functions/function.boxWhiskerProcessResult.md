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
