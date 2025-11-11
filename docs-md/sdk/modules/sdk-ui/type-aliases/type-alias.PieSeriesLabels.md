---
title: PieSeriesLabels
---

# Type alias PieSeriesLabels

> **PieSeriesLabels**: [`SeriesLabelsBase`](type-alias.SeriesLabelsBase.md) & \{
  `percentageLabels`: [`PiePercentageLabels`](type-alias.PiePercentageLabels.md);
  `showCategory`: `boolean`;
  `showValue`: `boolean`;
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
> ## `PieSeriesLabels.showValue`
>
> **showValue**?: `boolean`
>
> Boolean flag that defines if value should be shown in series labels
> (if not specified, default is determined by chart type)
>
> ## `PieSeriesLabels.textStyle`
>
> **textStyle**?: `Omit`\< [`TextStyle`](type-alias.TextStyle.md), `"pointerEvents"` \| `"textOverflow"` \>
>
> Styling for labels text
>
>
