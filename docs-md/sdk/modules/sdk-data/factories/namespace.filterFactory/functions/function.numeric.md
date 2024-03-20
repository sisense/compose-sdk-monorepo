---
title: numeric
---

# Function numeric

> **numeric**(
  `attribute`,
  `operatorA`?,
  `valueA`?,
  `operatorB`?,
  `valueB`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a custom numeric filter that filters for given attribute values.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Numeric attribute to filter |
| `operatorA`? | `string` | First operator |
| `valueA`? | `number` | First value |
| `operatorB`? | `string` | Second operator |
| `valueB`? | `number` | Second value |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A custom numeric filter of the given attribute

## Example

Filter for items where the cost is greater than 100 and less than 200
from the Sample ECommerce data model.
```ts
filterFactory.numeric(
  DM.Commerce.Cost,
  NumericOperators.From,
  100,
  NumericOperators.To,
  200
)
```
