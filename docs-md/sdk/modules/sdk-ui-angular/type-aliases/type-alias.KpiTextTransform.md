---
title: KpiTextTransform
---

# Type alias KpiTextTransform

> **KpiTextTransform**: `"capitalize"` \| `"lowercase"` \| `"none"` \| `"uppercase"`

Text case transformation applied to a KPI card text element.

## Example

Render the card title in sentence case instead of the default uppercase:
```ts
styleOptions: { title: { textStyle: { textTransform: 'none' } } }
```
