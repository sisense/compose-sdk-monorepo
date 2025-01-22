---
title: cascading
---

# Function cascading

> **cascading**(`filters`, `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter that contains a list of dependent/cascading filters,
where each filter depends on the results or state of the previous ones in the array.

Each filter in the array operates in the context of its predecessors, and the
cascading behavior ensures that all filters are applied sequentially.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filters` | [`Filter`](../../../interfaces/interface.Filter.md)[] | Array of dependent filters |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

```ts
// Create a cascading filter for gender and age range
const cascadingFilter = filterFactory.cascading(
  [
    filterFactory.members(DM.Commerce.Gender, ['Male', 'Female']),
    filterFactory.members(DM.Commerce.AgeRange, ['0-18']),
  ],
  { disabled: true }, // Optional configuration to disable the cascading filter
);
```
