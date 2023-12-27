---
title: exclude
---

# Function exclude

> **exclude**(`filter`, `input`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter representing an exclusion of the given filter
from all attribute members or from the optional input filter.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`Filter`](../../../interfaces/interface.Filter.md) | Filter to exclude |
| `input`? | [`Filter`](../../../interfaces/interface.Filter.md) | Input filter to exclude from (optional) |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter representing an exclusion of the given filter
from all attribute members or from the optional input filter
