---
title: exclude
---

# Function exclude

> **exclude**(
  `filter`,
  `input`?,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter that excludes items matching the given filter
from all items or from items matching the optional input filter.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`Filter`](../../../interfaces/interface.Filter.md) | Filter to exclude |
| `input`? | [`Filter`](../../../interfaces/interface.Filter.md) | Input filter to exclude from, on the same attribute. If not provided, the filter excludes from all items. |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter representing an exclusion of the given filter
from all attribute members or from the optional input filter

## Example

Filter for items where the country name does not contain the letter 'A'
from the Sample ECommerce data model.
```ts
filterFactory.exclude(filterFactory.contains(DM.Country.Country, 'A'))
```

Filter for items where the country name starts with the letter 'B' but does not contain the letter 'A'
from the Sample ECommerce data model. This filter will match countries like 'Belgium', but will not
match countries like 'Bermuda'.
```ts
filterFactory.exclude(
  filterFactory.contains(DM.Country.Country, 'A'),
  filterFactory.startsWith(DM.Country.Country, 'B')
)
```
