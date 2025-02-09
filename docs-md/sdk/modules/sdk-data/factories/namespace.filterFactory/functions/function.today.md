---
title: today
---

# Function today

> **today**(`dimension`, `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate items with a date dimension value of the current date.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dimension` | [`DateDimension`](../../../interfaces/interface.DateDimension.md) | date dimension to filter |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items where the date is today in the Sample ECommerce data model.
```ts
filterFactory.today(DM.Commerce.Date)
```
