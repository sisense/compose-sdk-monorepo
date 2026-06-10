---
title: formatDataSet
---

# Function formatDataSet

> **formatDataSet**<`DataSet`>(
  `data`,
  `dataOptions`,
  `options` = `{}`): `DataSet`

Formats a data set by applying the number and date formatting declared in `dataOptions` to a data set.
Writes the formatted result into each affected cell's `text` property.

## Type parameters

| Parameter |
| :------ |
| `DataSet` *extends* [`Data`](../../sdk-data/interfaces/interface.Data.md) \| [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `data` | `DataSet` | Query result or user-provided data set. |
| `dataOptions` | [`CommonDataOptions`](../type-aliases/type-alias.CommonDataOptions.md) | Any chart, pivot, or custom-widget data options. |
| `options` | [`FormatDateOptions`](../type-aliases/type-alias.FormatDateOptions.md) | Formatting options. |

## Returns

`DataSet`

A new data set with formatted `text` values on affected cells.

## Example

```ts
const formattedData = formatDataSet(data, dataOptions);
```
