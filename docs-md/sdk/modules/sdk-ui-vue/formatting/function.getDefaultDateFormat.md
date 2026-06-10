---
title: getDefaultDateFormat
---

# Function getDefaultDateFormat

> **getDefaultDateFormat**(`granularity`?): `string`

Returns a default date-format mask for a given granularity level from [`DateLevels`](../../sdk-data/variables/variable.DateLevels.md)

Falls back to default `'fullDate'` for unknown or absent granularities.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `granularity`? | `string` | Optional granularity string. |

## Returns

`string`

A date-format mask string.

## Example

```ts
getDefaultDateFormat('months'); // 'MM/yyyy'
getDefaultDateFormat('years');  // 'yyyy'
getDefaultDateFormat('days');   // 'shortDate'
```
