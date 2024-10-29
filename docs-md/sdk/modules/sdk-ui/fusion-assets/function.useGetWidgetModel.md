---
title: useGetWidgetModel
---

# Function useGetWidgetModel <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetWidgetModel**(...`args`): [`WidgetModelState`](../type-aliases/type-alias.WidgetModelState.md)

React hook that retrieves an existing widget model from a Fusion instance.

**Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.

## Example

Retrieve a widget model and use it to populate a `Chart` component

<iframe
 src='https://csdk-playground.sisense.com/?example=fusion-assets%2Fuse-get-widget-model&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

Additional `useGetWidgetModel` examples:

- [Modify Chart Type](https://www.sisense.com/platform/compose-sdk/playground/?example=fusion-assets%2Fuse-get-widget-model-change-chart-type)

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`GetWidgetModelParams`](../interfaces/interface.GetWidgetModelParams.md)] |

## Returns

[`WidgetModelState`](../type-aliases/type-alias.WidgetModelState.md)

Widget load state that contains the status of the execution, the result widget model, or the error if one has occurred
