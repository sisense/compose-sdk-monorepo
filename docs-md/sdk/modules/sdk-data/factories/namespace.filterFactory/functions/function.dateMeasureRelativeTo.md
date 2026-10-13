---
title: dateMeasureRelativeTo
---

# Function dateMeasureRelativeTo

> **dateMeasureRelativeTo**(
  `measure`,
  `level`,
  `offset`,
  `count`,
  `anchor`?,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate items whose measure value falls in a period before an anchor.

An `offset` of `0` includes the anchor's own period; `1` excludes it and ends at the one before.
The `level` is the level the period is counted in, and it is not the level inside the measure.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to filter by. |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date [LevelAttribute](../../../interfaces/interface.LevelAttribute.md) the period is counted in. |
| `offset` | `number` | Periods to skip from the anchor; `0` includes the anchor's own period and `1` excludes it. |
| `count` | `number` | Number of periods to include. |
| `anchor`? | `Date` \| `string` | Date to count to as `yyyy-MM-dd` or a `Date`, defaults to the current day. |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter. |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance.

## Example

Filter for categories whose last order was in the year up to and including 1 June 2013.
```ts
filterFactory.dateMeasureRelativeTo(
  measureFactory.max(DM.Commerce.Date.Days, 'Last Order'),
  DM.Commerce.Date.Years,
  0,
  1,
  '2013-06-01',
)
```
