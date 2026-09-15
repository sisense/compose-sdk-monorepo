---
title: extractDimensionsAndMeasures
---

# Function extractDimensionsAndMeasures

> **extractDimensionsAndMeasures**(`dataOptions`): `object`

Utility function for converting data options to parameters for executing a query.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `dataOptions` | [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md) |

## Returns

### `dimensions`

**dimensions**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

### `measures`

**measures**: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

## Example

```ts
import { extractDimensionsAndMeasures } from '@sisense/sdk-ui';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce';

const { dimensions, measures } = extractDimensionsAndMeasures({
  category: [DM.Commerce.Condition],
  value: [measureFactory.sum(DM.Commerce.Revenue)],
});
```
