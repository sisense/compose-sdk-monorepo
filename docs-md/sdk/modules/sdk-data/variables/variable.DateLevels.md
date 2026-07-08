---
title: DateLevels
---

# Variable DateLevels

> **`const`** **DateLevels**: `object`

Levels for [DateDimension](../interfaces/interface.DateDimension.md)

## Type declaration

### `AggHours`

**`readonly`** **AggHours**: `"AggHours"` = `'AggHours'`

***

### `AggMinutesRoundTo1`

**`readonly`** **AggMinutesRoundTo1**: `"AggMinutesRoundTo1"` = `'AggMinutesRoundTo1'`

***

### `AggMinutesRoundTo15`

**`readonly`** **AggMinutesRoundTo15**: `"AggMinutesRoundTo15"` = `'AggMinutesRoundTo15'`

***

### `AggMinutesRoundTo30`

**`readonly`** **AggMinutesRoundTo30**: `"AggMinutesRoundTo30"` = `'AggMinutesRoundTo30'`

***

### `Days`

**`readonly`** **Days**: `"Days"` = `'Days'`

***

### `Hours`

**`readonly`** **Hours**: `"Hours"` = `'Hours'`

***

### `Minutes`

**`readonly`** **Minutes**: `"Minutes"` = `'Minutes'`

***

### `MinutesRoundTo15`

**`readonly`** **MinutesRoundTo15**: `"MinutesRoundTo15"` = `'MinutesRoundTo15'`

***

### `MinutesRoundTo30`

**`readonly`** **MinutesRoundTo30**: `"MinutesRoundTo30"` = `'MinutesRoundTo30'`

***

### `Months`

**`readonly`** **Months**: `"Months"` = `'Months'`

***

### `Quarters`

**`readonly`** **Quarters**: `"Quarters"` = `'Quarters'`

***

### `Seconds`

**`readonly`** **Seconds**: `"Seconds"` = `'Seconds'`

***

### `WeekOfYear`

**`readonly`** **WeekOfYear**: `"WeekOfYear"` = `'WeekOfYear'`

Groups by the **week-of-year ordinal** (1–53), collapsing across years — e.g. all
"week 5" values across every year are grouped together. Emitted as the JAQL
`dateTimePart` field (a date-*part* extraction).

Differs from DateLevels.Weeks, which truncates to each distinct calendar week
on the timeline (e.g. the week of 2024-01-01, then 2024-01-08, …) and is emitted as a
`level`.

#### Remarks

Requires an Analytical Engine that supports date-part grouping (the
`TIME_HANDLING_ENHANCEMENT` feature, i.e. the `dateTimePart` JAQL property).
Older Fusion / AE versions reject it.

***

### `Weeks`

**`readonly`** **Weeks**: `"Weeks"` = `'Weeks'`

***

### `Years`

**`readonly`** **Years**: `"Years"` = `'Years'`
