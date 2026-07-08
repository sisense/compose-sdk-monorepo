---
title: FormulaFilterMatcher
---

# Type alias FormulaFilterMatcher <Badge type="beta" text="Beta" />

> **FormulaFilterMatcher**: [`Attribute`](../interfaces/interface.Attribute.md) \| [`Filter`](../interfaces/interface.Filter.md) \| (`filter`, `key`) => `boolean`

Describes how to target a filter inside a formula's context.

- [Filter](../interfaces/interface.Filter.md) — matches the same filter instance (by `config.guid`), falling
  back to any filter on the same attribute.
- [Attribute](../interfaces/interface.Attribute.md) — matches any filter on that attribute.
- predicate — receives each filter and its bracketed context key and returns
  `true` for a match.
