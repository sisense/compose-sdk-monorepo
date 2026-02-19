---
title: toWidgetProps
---

# Function toWidgetProps

> **toWidgetProps**(`widgetModel`): [`WidgetProps`](../../../type-aliases/type-alias.WidgetProps.md)

Translates [WidgetModel](../../interface.WidgetModel.md) to [WidgetProps](../../../type-aliases/type-alias.WidgetProps.md).

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`WidgetProps`](../../../type-aliases/type-alias.WidgetProps.md)

## Example

```ts
<Widget {...widgetModelTranslator.toWidgetProps(widgetModel)} />
```
