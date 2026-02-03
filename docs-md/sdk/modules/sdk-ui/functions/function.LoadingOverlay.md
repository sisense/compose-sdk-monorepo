---
title: LoadingOverlay
---

# Function LoadingOverlay

> **LoadingOverlay**(`props`): `Element`

Component that displays a loading overlay.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`LoadingOverlayProps`](../type-aliases/type-alias.LoadingOverlayProps.md) | Loading overlay props. |

## Returns

`Element`

Child component wrapped in dynamic overlay.

## Example

Example of a loading overlay:
```ts
<LoadingOverlay isVisible={isLoading}>
  <Chart {...chartOptions} />
</LoadingOverlay>
```
