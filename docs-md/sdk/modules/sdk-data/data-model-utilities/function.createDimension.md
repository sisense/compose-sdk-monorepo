---
title: createDimension
---

# Function createDimension

> **createDimension**(`json`): [`Dimension`](../interfaces/interface.Dimension.md)

Creates a new Dimension instance from the given JSON object.

This function is used in the generated data model code to create dimensions for an input data source.

See also functions [createDateDimension](function.createDateDimension.md) and [createAttribute](function.createAttribute.md).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `json` | `any` | JSON object representing the Dimension |

## Returns

[`Dimension`](../interfaces/interface.Dimension.md)

A new Dimension instance

## Example

```ts
import { createAttribute, createDimension } from '@sisense/sdk-data';

const Category = createDimension({
  name: 'Category',
  Category: createAttribute({
    name: 'Category',
    type: 'text-attribute',
    expression: '[Category.Category]',
  }),
  CategoryID: createAttribute({
    name: 'Category ID',
    type: 'numeric-attribute',
    expression: '[Category.Category ID]',
  }),
});
```
