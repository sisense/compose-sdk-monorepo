---
title: KpiComparisonInfo
---

# Type alias KpiComparisonInfo <Badge type="beta" text="Beta" />

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
with all math resolved.
