---
title: KpiComparisonInfo
---

# Type alias KpiComparisonInfo

> **KpiComparisonInfo**: \{
  `baseline`: `number`;
  `deltaPercent?`: `number`;
  `deltaValue`: `number`;
  `label`: `string`;
  `type`: `"previous-period"`;
 } \| \{
  `baseline`: `number`;
  `deltaPercent?`: `number`;
  `deltaValue`: `number`;
  `label`: `string`;
  `type`: `"delta"`;
 } \| \{
  `label`: `string`;
  `percentOfTarget?`: `number`;
  `target`: `number`;
  `toGo`: `number`;
  `type`: `"target"`;
 } \| \{
  `label`: `string`;
  `type`: `"value"`;
  `value`: `number`;
 }

Computed comparison shown on a KPI card. Mirrors the [KpiComparison](type-alias.KpiComparison.md) input,
with all math resolved: the variant here matches the variant configured there, and every
derived figure the card displays is already calculated.

Every variant carries a `label` — the caption rendered next to the readout. Alongside it:

- `previous-period` — `baseline` (the bucket before the last one), `deltaValue` (last bucket
  minus `baseline`), and `deltaPercent`. Always measured between the last two buckets, so a
  `valueMode: 'total'` headline does not shift it.
- `delta` — the same three figures, with `baseline` read from the comparison measure rather
  than from the preceding bucket.
- `target` — `target` (the fixed number, or the target measure's value), `percentOfTarget`, and
  `toGo`: `target` minus the headline value, going negative once the goal is beaten.
- `value` — a single `value`, the comparison measure's own number, with no delta math applied.

`deltaPercent` and `percentOfTarget` are expressed in percentage points — `12.5` means 12.5%.
Each is undefined when its denominator (`baseline` and `target` respectively) is `0`, where the
ratio has no meaning.
