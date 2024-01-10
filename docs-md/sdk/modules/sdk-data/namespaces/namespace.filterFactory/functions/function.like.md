---
title: like
---

# Function like

> **like**(`attribute`, `value`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values that match a specified string pattern.

The pattern can include the following wildcard characters:

+ `_`: Matches a single character
+ `%`: Matches multiple characters

To search for a literal underscore (`_`) or percent symbol (`%`), use the backslash (``) escape
character.

Matching is case insensitive.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Text attribute to filter on |
| `value` | `string` | Value to filter by |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for countries from the Sample ECommerce data model where the country name starts with an
'A' and ends with an 'a'. This filter matches countries like 'Argentina' and 'Australia'.
```ts
filterFactory.like(DM.Country.Country, 'A%a')
```
