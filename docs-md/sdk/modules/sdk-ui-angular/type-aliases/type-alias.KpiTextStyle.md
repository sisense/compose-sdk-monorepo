---
title: KpiTextStyle
---

# Type alias KpiTextStyle

> **KpiTextStyle**: `Pick`\< [`TextStyle`](../../sdk-ui/type-aliases/type-alias.TextStyle.md), `"fontFamily"` \| `"fontStyle"` \| `"fontWeight"` \> & \{
  `textTransform?`: [`KpiTextTransform`](type-alias.KpiTextTransform.md);
 }

Typography of a KPI card text element.

Sizing is not part of it: the headline value is sized by `textSize` on
[KpiValueStyleOptions](type-alias.KpiValueStyleOptions.md), and the other elements have fixed sizes relative to the card.
Color is not part of it either: the value is colored through its measure (see
[KpiChartDataOptions.value](../interfaces/interface.KpiChartDataOptions.md#value)) and the comparison through `color` on
[KpiComparisonStyleOptions](type-alias.KpiComparisonStyleOptions.md).

`fontFamily` defaults to the theme's `typography.fontFamily`.

## Example

Turn off the default uppercase title and lighten the headline value:
```ts
styleOptions: {
  title: { textStyle: { textTransform: 'none' } },
  value: { textStyle: { fontWeight: '400' } },
}
```

> ## `KpiTextStyle.textTransform`
>
> **textTransform**?: [`KpiTextTransform`](type-alias.KpiTextTransform.md)
>
> Text case transformation.
>
>
