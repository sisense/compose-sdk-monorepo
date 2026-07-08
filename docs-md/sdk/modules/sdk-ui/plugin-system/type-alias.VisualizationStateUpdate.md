---
title: VisualizationStateUpdate
---

# Type alias VisualizationStateUpdate <Badge type="beta" text="Beta" />`<StyleOptions, CustomOptions>`

> **VisualizationStateUpdate**: <`StyleOptions`, `CustomOptions`> `object`

Partial persistable state a custom visualization can push back to the
persistence layer. Carries the same props vocabulary the plugin already reads
from.

Both fields are deeply partial and are deep-merged into the current widget
state: nested plain objects merge recursively at any depth, so a plugin
passes only the leaf values that changed — e.g.
`{ styleOptions: { pagination: { currentPage: 3 } } }` updates `currentPage`
while preserving the sibling `pagination` keys. Arrays and primitives are
replaced wholesale (last-write-wins). Keys cannot be deleted via merge —
overwrite with an explicit value (e.g. `null`) instead.

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `StyleOptions` | [`CustomVisualizationStyleOptions`](interface.CustomVisualizationStyleOptions.md) | The shape of style options for the custom visualization. |
| `CustomOptions` | `Record`\< `string`, `unknown` \> | The shape of arbitrary plugin-specific runtime state. |

## Type declaration

### `customOptions`

**customOptions**?: `DeepPartial`\< `CustomOptions` \>

***

### `styleOptions`

**styleOptions**?: `DeepPartial`\< `StyleOptions` \>
