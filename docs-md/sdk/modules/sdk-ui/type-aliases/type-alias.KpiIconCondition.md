---
title: KpiIconCondition
---

# Type alias KpiIconCondition <Badge type="beta" text="Beta" />

> **KpiIconCondition**: `object`

Condition that shows a [KpiIcon](type-alias.KpiIcon.md) next to the KPI headline value or comparison readout
when it matches. Conditions are evaluated in order; the first match wins.

## Type declaration

### `expression`

**expression**: `string`

Value to compare against, expressed as a string.

***

### `icon`

**icon**: [`KpiIcon`](type-alias.KpiIcon.md)

Icon rendered when the condition matches.

***

### `operator`

**operator**: [`DataColorCondition`](type-alias.DataColorCondition.md)[`"operator"`]

Comparison operator, same convention as [DataColorCondition](type-alias.DataColorCondition.md).
