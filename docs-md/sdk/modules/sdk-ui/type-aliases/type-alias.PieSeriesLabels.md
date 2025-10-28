---
title: PieSeriesLabels
---

# Type alias PieSeriesLabels

> **PieSeriesLabels**: `Omit`\< [`SeriesLabels`](type-alias.SeriesLabels.md), `"align"` \| `"alignInside"` \| `"showPercentDecimals"` \| `"showPercentage"` \| `"verticalAlign"` \> & \{
  `percentageLabels`: [`PiePercentageLabels`](type-alias.PiePercentageLabels.md);
  `showCategory`: `boolean`;
  `textStyle`: `Omit`\< [`TextStyle`](type-alias.TextStyle.md), `"pointerEvents"` \| `"textOverflow"` \>;
 }

> ## `PieSeriesLabels.percentageLabels`
>
> **percentageLabels**?: [`PiePercentageLabels`](type-alias.PiePercentageLabels.md)
>
> Configuration for percentage labels
> Percentage labels are shown on top of series slices
> Styling from series labels are not applied to percentage labels
>
> ## `PieSeriesLabels.showCategory`
>
> **showCategory**?: `boolean`
>
> Boolean flag that defines if the category should be shown
>
> ### Default
>
> `true`
>
> ## `PieSeriesLabels.textStyle`
>
> **textStyle**?: `Omit`\< [`TextStyle`](type-alias.TextStyle.md), `"pointerEvents"` \| `"textOverflow"` \>
>
> Styling for labels text
>
>
