---
type: Module
title: Compose code round-trip
description: Generates executable factory-call code strings ("compose code") on dimensional elements and parses them back into a structured FunctionCall AST.
resource: packages/sdk-data/src/dimensional-model
tags: [sdk-data, module, compose-code]
---

# Purpose

Every factory-created element carries `composeCode` — the exact factory-call source string that recreates it (e.g. `filterFactory.members(DM.Country.Country, ['USA'])`). This module stamps that string at creation time (compose-code-utils.ts) and parses it back into a `FunctionCall` AST (parse-compose-code.ts) so code generators and NLQ translators can round-trip elements as code.

# Entry point

| What     | Where                                                                                                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Function | `parseComposeCodeToFunctionCall` — packages/sdk-data/src/dimensional-model/parse-compose-code.ts:241 (barrel: packages/sdk-data/src/index.ts:23)                              |
| Type     | `FunctionCall` — packages/sdk-data/src/dimensional-model/parse-compose-code.ts:35                                                                                             |
| Type     | `ArgValue` / `Arg` — packages/sdk-data/src/dimensional-model/parse-compose-code.ts:15 / :29                                                                                   |
| Helpers  | `splitAtDepthZero` / `findMatchingCloseParen` — packages/sdk-data/src/dimensional-model/parse-compose-code.ts:49 / :155                                                       |
| Function | `stringifyHelper` (arg → code string) — packages/sdk-data/src/dimensional-model/compose-code-utils.ts:13                                                                      |
| HOFs     | `withComposeCodeForFilter` / `withComposeCodeForFilterRelations` — packages/sdk-data/src/dimensional-model/compose-code-utils.ts:106 / :119                                   |
| HOFs     | `withComposeCodeForMeasure` / `withComposeCodeForAttribute` / `withComposeCodeForAnalytics` — packages/sdk-data/src/dimensional-model/compose-code-utils.ts:147 / :161 / :133 |
| Field    | `composeCode` lives on `DimensionalElement` (set at compose-code-utils.ts:93)                                                                                                 |

# Contract

```ts
export interface FunctionCall {
  function: string; // e.g. 'filterFactory.members'
  args: ReadonlyArray<Arg>; // string | number | boolean | null | undefined
} // | FunctionCall | ArgArray | ArgObject
```

Factory-name prefixes baked into the generated code (compose-code-utils.ts:110-165) — parsers dispatch on these verbatim strings:

```text
filterFactory.<fn>(...)        filterFactory.logic.<fn>(...)
measureFactory.<fn>(...)       attributeFactory.<fn>(...)      analyticsFactory.<fn>(...)
```

Generation rules (`withComposeCode`, compose-code-utils.ts:74): trailing `undefined` args are trimmed; a trailing `''`/`{}`/`undefined`/`null` arg is dropped; `guid` keys are excluded from stringified objects (:83); nested elements contribute their own `composeCode` verbatim (:36-38); `Date` becomes `new Date('<iso>')` (:27); the explicit `funcName` argument exists because minification breaks `func.name`.

Parsing rules: `DM.*` references stay strings even when they contain parentheses (parse-compose-code.ts:354); other `(`-containing values parse as nested `FunctionCall`s (:359); string literals accept both `\'` and `''` escapes (:221); splitting respects `()[]{}` nesting and quoted strings (:49).

# How it connects

- Both factory HOF wrappers are applied in packages/sdk-data/src/dimensional-model/filters/factory.ts, measures/factory.ts, attributes/factory.ts, and analytics/factory.ts — every public factory function returns an element with `composeCode` set.
- Consumed by the sdk-ui analytics-composer NLQ translator, which parses elements' `composeCode` back to JSON — e.g. packages/sdk-ui/src/modules/analytics-composer/nlq-v3-translator/constructs/filters/translate-filters-to-json.ts:51 (same pattern for measures, dimensions, and query).
- `AbstractFilter.serialize()` persists `composeCode` ([filters](./filters.md)); `FilterRelations.composeCode` is stamped by `logic.and`/`or` ([filter-relations](./filter-relations.md)).

# Invariants and traps

1. `composeCode` must remain an executable factory call — parsers resolve `FunctionCall.function` against the factory namespaces above, so renaming or re-nesting a public factory function breaks round-tripping of previously persisted code.
2. Always pass the explicit `funcName` when wrapping a factory function; relying on `func.name` breaks under minified builds (compose-code-utils.ts:71).
3. `composeCode` describes the element AT CREATION. Any transformation must clear or regenerate it — formula-filter transformers drop it deliberately (see [filters](./filters.md)); stale code silently regenerates the old element.
4. `parseComposeCodeToFunctionCall` throws on non-string, empty, or non-call input (:242-:256) — callers must guard elements that never had `composeCode` (e.g. deserialized from JAQL).
5. `parseObject` drops entries whose value parses to `null` (:395); `guid` never appears in generated object args, so parsed configs are guid-less by design.
6. `null`/`undefined`/`true`/`false` and bare numbers are parsed as values, not strings (:294-:315); everything unrecognized falls back to a plain string (:364).

# Related

- [Filters & filterFactory](./filters.md) - largest producer of compose code
- [Measures](./measures.md) - measureFactory compose code
- [Filter relations](./filter-relations.md) - `filterFactory.logic.*` compose code on relation trees
