---
title: createDateDimension
---

# Function createDateDimension

> **createDateDimension**(`json`): [`DateDimension`](../interfaces/interface.DateDimension.md)

Creates a new Date Dimension instance from the given JSON object.

This function is used in the generated data model code to create date dimensions for an input data source.

See also functions [createDimension](function.createDimension.md) and [createAttribute](function.createAttribute.md).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `json` | `any` | JSON object representing the Date Dimension |

## Returns

[`DateDimension`](../interfaces/interface.DateDimension.md)

A new Date Dimension instance

## Example

```ts
import { createDateDimension } from '@sisense/sdk-data';

const Date = createDateDimension({
  name: 'Date',
  expression: '[Commerce.Date (Calendar)]',
});

// Access a specific granularity level as a dimension in a query.
const years = Date.Years;
```
