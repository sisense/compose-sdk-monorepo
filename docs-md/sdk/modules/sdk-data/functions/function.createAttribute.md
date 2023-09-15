---
title: createAttribute
---

# Function createAttribute

> **createAttribute**(`json`): [`Attribute`](../interfaces/interface.Attribute.md)

Creates an Attribute instance from the given JSON object.
If the JSON object contains a granularity property, a [LevelAttribute](../interfaces/interface.LevelAttribute.md) instance is created.

This function is used in the generated data model code to create dimension attributes from an input data source.

See also functions [createDimension](function.createDimension.md) and [createDateDimension](function.createDateDimension.md).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `json` | `any` | JSON object representing the attribute |

## Returns

[`Attribute`](../interfaces/interface.Attribute.md)

An Attribute instance
