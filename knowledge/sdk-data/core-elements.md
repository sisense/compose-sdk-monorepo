---
type: Module
title: Element model & JAQL serialization
description: The base class hierarchy of dimensional-model elements and the jaql() contract by which every element serializes itself into a JAQL query payload.
resource: packages/sdk-data/src/dimensional-model
tags: [sdk-data, module, dimensional-model]
---

# Purpose

Defines the common shape of every dimensional-model element (attribute, dimension, measure, filter) and the two serialization channels each element supports: `jaql()` for query execution and `serialize()`/`toJSON()` for persistence. Reach for it when adding a new element kind, parsing raw JAQL back into elements, or debugging what a query payload looks like.

# Entry point

| What                 | Where                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interface            | `Element` — packages/sdk-data/src/dimensional-model/interfaces.ts:19                                                                                 |
| Base class           | `DimensionalElement` — packages/sdk-data/src/dimensional-model/base.ts:10                                                                            |
| Constants            | `MetadataTypes` — packages/sdk-data/src/dimensional-model/types.ts:98                                                                                |
| Constants            | `AggregationTypes` — packages/sdk-data/src/dimensional-model/types.ts:26                                                                             |
| Constant             | `CALCULATED_DIMENSION_JAQL_TYPE = 'calculated_dimension'` — packages/sdk-data/src/dimensional-model/types.ts:91                                      |
| Pass-through wrapper | `JaqlElement` — packages/sdk-data/src/dimensional-model/jaql-element.ts:36                                                                           |
| Factory              | `createDimensionalElementFromMetadataItem` — packages/sdk-data/src/dimensional-model/jaql-element.ts:139                                             |
| Helpers              | `normalizeName` — packages/sdk-data/src/dimensional-model/base.ts:157, `resolveElementNames` — base.ts:144, `wrapIfNeedsNormalization` — base.ts:202 |
| JAQL type shapes     | `BaseJaql` — types.ts:506, `FormulaJaql` — types.ts:543, `MetadataItem` — types.ts:712, `MetadataItemJaql` — types.ts:761                            |
| Query-result types   | `QueryResultData` — packages/sdk-data/src/interfaces.ts:228, `DataSource` — src/interfaces.ts:209 (union of string \| `DataSourceInfo`)              |

# Contract

The hierarchy: `Element` (interface) → `DimensionalElement` (abstract) → `DimensionalAttribute` / `DimensionalDimension` / `AbstractMeasure` / filter classes. Interface layering: `Attribute extends Element` (interfaces.ts:366), `LevelAttribute extends Attribute` (interfaces.ts:392), `Measure extends Element` (interfaces.ts:117), `Dimension extends Element, Attribute` (interfaces.ts:267).

Every element implements (interfaces.ts:19-110): `name` (identity), `title` (display label), `type`, `id`, `__serializable` (class discriminator string used by all `is*` type guards), `serialize(): JSONObject`, `toJSON()`, and:

```ts
jaql(nested?: boolean): any;
```

The `jaql()` contract: called with `nested === true` it returns the bare inner JAQL object (`{ title, dim, datatype, ... }`) for embedding inside a parent (e.g. a calculated measure's `context`); called without arguments it returns the root metadata-item wrapper `{ jaql: {...}, format?, panel? }`. `DimensionalElement.toString()` delegates to `jaql()` (base.ts:131).

`MetadataTypes` (types.ts:98) holds the canonical type strings, verbatim:

```ts
Measure: 'measure', MeasureTemplate: 'measuretemplate', BaseMeasure: 'basemeasure',
CalculatedMeasure: 'calculatedmeasure',
Dimension: 'dimension', DateDimension: 'datedimension', TextDimension: 'textdimension',
NumericDimension: 'numericdimension',
DateLevel: 'datelevel', Attribute: 'attribute', TextAttribute: 'text-attribute',
NumericAttribute: 'numeric-attribute', CalculatedAttribute: 'calculatedattribute',
Filter: 'filter', DimensionFilter: 'dimensionfilter', MeasureFilter: 'measurefilter',
```

plus duck-typing guards `isMeasure`, `isBaseMeasure`, `isCalculatedMeasure`, `isCalculatedAttribute`, `isDimension`, `isAttribute`, `isFilter` (types.ts:125-385) that accept either a type string or an object shape (raw JAQL included).

`JaqlElement` (jaql-element.ts:36) wraps a raw `MetadataItem` with no interpretation — its `jaql()` returns the stored item as-is and it sets `skipValidation = true`. Used for JAQL that comes from a Fusion instance (widget DTOs, NLQ) and is assumed correct. `createDimensionalElementFromMetadataItem` (jaql-element.ts:139) prefers building a real measure/attribute (formula → calculated measure; `agg`+`dim` → measure; `dim` → attribute) and only falls back to `JaqlElement`.

# How it connects

- Subclassed by [attributes & dimensions](./attributes-and-dimensions.md) and [measures](./measures.md); filter classes in `dimensional-model/filters/` implement the same `Element` contract ([filters](./filters.md)).
- `sdk-ui` / `sdk-query-client` build query payloads by calling `jaql()` on each element; `MetadataItem`/`MetadataItemJaql` (types.ts:712/761) are the wire shapes they exchange.
- `composeCode` (base.ts:105) carries the CSDK source-code representation of an element — see [compose-code](./compose-code.md).
- `serialize()`/`__serializable` round-trip elements through JSON; `create()` in `dimensional-model/factory.ts:29` rebuilds elements from serialized JSON.
- Query-result shapes (`QueryResultData`, `Data`, `Cell`) live at the package root, packages/sdk-data/src/interfaces.ts.

# Invariants and traps

1. `name` is identity, `title` is display. Measures emit `title: this.name` in JAQL (not `this.title`) so sdk-ui's per-measure aliasing round-trips — see [measures](./measures.md). Attributes emit `title: this.title`.
2. Elements are immutable in practice: `sort()`, `format()` etc. must return a new instance, never mutate.
3. A new element class must set a unique `__serializable` string; all `isDimensional*` type guards match on it, not on `instanceof` (survives cross-realm/serialized objects).
4. `MetadataTypes.isCalculatedMeasure` explicitly excludes calculated attributes — both have `{ formula, context }`, distinguished by `type: 'calculated_dimension'` (types.ts:210-257). Any new formula-shaped element must keep these guards mutually exclusive.
5. `resolveElementNames` (base.ts:144) accepts legacy `title`-only JSON (title becomes identity when `name` is missing); every `create*` JSON factory must go through it.
6. `normalizeName` (base.ts:157) strips non-`[a-zA-Z0-9_.]` chars, maps `.` to `_`, and prefixes a leading digit with `_` — the rule behind generated data-model property names and formula context keys.

# Related

- [Attributes & dimensions](./attributes-and-dimensions.md) - concrete attribute/dimension subclasses and their jaql() outputs
- [Measures & measureFactory](./measures.md) - measure subclasses and formula JAQL
- [Filters](./filters.md) - filter elements built on the same Element contract
- [Compose code](./compose-code.md) - the composeCode field carried by every element
- [Translation](./translation.md) - converting Fusion DTOs to/from these elements
