---
title: KpiIcon
---

# Type alias KpiIcon

> **KpiIcon**: \{
  `color?`: `string`;
  `type`: `"text"`;
  `value`: `string`;
 } \| \{
  `color?`: `string`;
  `name`: [`KpiIconName`](type-alias.KpiIconName.md);
  `type`: `"built-in"`;
 } \| \{
  `color?`: `string`;
  `d`: `string`;
  `type`: `"svg-path"`;
  `viewBox?`: `string`;
 }

Defines the icon shown next to the KPI headline value or comparison readout when its
[KpiIconCondition](type-alias.KpiIconCondition.md) matches.

Variants:
- `text` — a custom unicode glyph, emoji, or short text.
- `built-in` — a curated SVG icon bundled with the SDK, selected by typed name.
- `svg-path` — arbitrary SVG geometry: the `d` attribute of a single `<path>` element,
  e.g. copied from an icon set or a Figma export. Drawn on a 24x24 grid unless `viewBox`
  says otherwise, and rendered filled with the icon color.

Every variant accepts an optional `color`; when omitted, the icon inherits the headline
value color (or the comparison readout color, for comparison icons).

## Example

```ts
conditionalIcons: [
  { icon: { type: 'built-in', name: 'check', color: '#2ea44f' }, expression: '1000000', operator: '>' },
  { icon: { type: 'text', value: '⚠', color: '#cf222e' }, expression: '1000000', operator: '<=' },
]
```
