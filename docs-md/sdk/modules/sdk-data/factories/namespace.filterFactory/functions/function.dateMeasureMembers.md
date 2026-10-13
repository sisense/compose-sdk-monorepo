---
title: dateMeasureMembers
---

# Function dateMeasureMembers

> **dateMeasureMembers**(
  `measure`,
  `level`,
  `members`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate items whose measure value matches one of the given dates.

The `level` is the level the members are matched at, and it is not the level inside the measure.
A `max` over days answers with a day, so filtering it to whole years needs a years level here.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to filter by. |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date [LevelAttribute](../../../interfaces/interface.LevelAttribute.md) the members are matched at. |
| `members` | (`Date` \| `string`)[] | Members to match, as `yyyy-MM-ddTHH:mm:ss` strings or `Date` objects. |
| `config`? | [`MembersFilterConfig`](../../../interfaces/interface.MembersFilterConfig.md) | Optional configuration, where `excludeMembers` negates the filter. |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance.

## Example

Filter for categories whose last order was in 2012 or 2013 in the Sample ECommerce data model.
```ts
filterFactory.dateMeasureMembers(
  measureFactory.max(DM.Commerce.Date.Days, 'Last Order'),
  DM.Commerce.Date.Years,
  ['2012-01-01T00:00:00', '2013-01-01T00:00:00'],
)
```

## Example

The same filter negated, keeping every category whose last order was NOT in 2013.
```ts
filterFactory.dateMeasureMembers(
  measureFactory.max(DM.Commerce.Date.Days, 'Last Order'),
  DM.Commerce.Date.Years,
  ['2013-01-01T00:00:00'],
  { excludeMembers: true },
)
```
