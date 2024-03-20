---
title: ThemeProvider
---

# Function ThemeProvider

> **ThemeProvider**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

Theme provider, which allows you to adjust the look and feel of child components.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ThemeProviderProps`](../type-aliases/type-alias.ThemeProviderProps.md) | Theme provider props |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

A Theme Provider component

## Example

Example of a theme provider, which changes the colors and font of the nested indicator chart:
```ts
<ThemeProvider
  theme={{
    chart: {
      backgroundColor: '#333333',
      textColor: 'orange',
      secondaryTextColor: 'purple',
    },
    typography: {
      fontFamily: 'impact',
    },
  }}
>
  <IndicatorChart {...chartOptions} />
</ThemeProvider>
```

Indicator chart with custom theme settings:

<img src="../../../img/indicator-chart-example-2.png" width="400px" />

For comparison, indicator chart with default theme settings:

<img src="../../../img/indicator-chart-example-1.png" width="400px" />

## See

[ThemeSettings](../interfaces/interface.ThemeSettings.md) and IndicatorChart
