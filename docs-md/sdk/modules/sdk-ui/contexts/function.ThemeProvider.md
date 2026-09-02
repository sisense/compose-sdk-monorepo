---
title: ThemeProvider
---

# Function ThemeProvider

> **ThemeProvider**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

Theme provider, which allows you to adjust the look and feel of child components.

Components not wrapped in a theme provider use the current theme from the connected Fusion instance by default.

When `theme` is a theme OID that cannot be loaded — for example, a theme that does not exist in
the connected Sisense instance — the provider keeps rendering its children with the inherited
theme settings and reports the failure as a console warning.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ThemeProviderProps`](../type-aliases/type-alias.ThemeProviderProps.md) | Theme provider props |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`

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
