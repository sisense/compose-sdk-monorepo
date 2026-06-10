---
title: formatNumber
---

# Function formatNumber

> **formatNumber**(`value`, `config`?): `string`

Formats a single numeric value using the provided [NumberFormatConfig](../type-aliases/type-alias.NumberFormatConfig.md).

Missing config falls back to defaults:
Numbers type, auto decimal scale, thousand separator enabled, all abbreviations (K/M/B/T) enabled.

Returns an empty string when `value` is `NaN`.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `number` | The numeric value to format. |
| `config`? | [`NumberFormatConfig`](../type-aliases/type-alias.NumberFormatConfig.md) | Formatting configuration. |

## Returns

`string`

Formatted string representation of the value.

## Example

```ts
formatNumber(1234567);
// returns '1.23M'

formatNumber(0.42, { name: 'Percent', decimalScale: 1 });
// returns '42.0%'

formatNumber(1500, { name: 'Currency', symbol: '€', prefix: true });
// returns '€1.5K'
```
