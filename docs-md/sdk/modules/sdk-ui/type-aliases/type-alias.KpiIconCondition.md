---
title: KpiIconCondition
---

# Type alias KpiIconCondition <Badge type="beta" text="Beta" />

> **KpiIconCondition**: `object`

Icon shown next to the KPI headline value when its condition matches.
Conditions are evaluated in order; the first match wins.

## Type declaration

### `color`

**color**?: `string`

Icon color. Defaults to the headline value color.

***

### `expression`

**expression**: `string`

Value to compare against, expressed as a string.

***

### `icon`

**icon**: `string`

Unicode symbol or short text rendered when the condition matches, for example '⚠' or '✓'.

***

### `operator`

**operator**: [`DataColorCondition`](type-alias.DataColorCondition.md)[`"operator"`]

Comparison operator, same convention as [DataColorCondition](type-alias.DataColorCondition.md).
