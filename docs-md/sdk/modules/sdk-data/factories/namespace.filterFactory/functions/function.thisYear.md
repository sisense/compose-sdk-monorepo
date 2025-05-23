---
title: thisYear
---

# Function thisYear

> **thisYear**(`dimension`, `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate items with a date dimension value in the current calendar year.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dimension` | [`DateDimension`](../../../interfaces/interface.DateDimension.md) | Date dimension to filter |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items where the date is in the current calendar year in the Sample ECommerce data model.
```ts
filterFactory.thisYear(DM.Commerce.Date)
```
