---
title: useCustomWidgets
---

# Function useCustomWidgets

> **useCustomWidgets**(): `object`

Hook that provides API for configuring custom widgets.

## Returns

### `getCustomWidget`

**getCustomWidget**: (`customWidgetType`) => [`CustomWidgetComponent`](../type-aliases/type-alias.CustomWidgetComponent.md)\< `any` \> \| `undefined`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `customWidgetType` | `string` |

#### Returns

[`CustomWidgetComponent`](../type-aliases/type-alias.CustomWidgetComponent.md)\< `any` \> \| `undefined`

### `hasCustomWidget`

**hasCustomWidget**: (`customWidgetType`) => `boolean`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `customWidgetType` | `string` |

#### Returns

`boolean`

### `registerCustomWidget`

**registerCustomWidget**: <`T`>(`customWidgetType`, `customWidget`) => `void`

#### Type parameters

| Parameter | Default |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `customWidgetType` | `string` |
| `customWidget` | [`CustomWidgetComponent`](../type-aliases/type-alias.CustomWidgetComponent.md)\< `T` \> |

#### Returns

`void`

## Example

Example of registering a custom widget in a dashboard:
```ts
import { useCustomWidgets, DashboardById } from '@sisense/sdk-ui';
import CustomHistogramWidget from './custom-histogram-widget';

const Example = () => {
  const { registerCustomWidget } = useCustomWidgets();
  registerCustomWidget('histogramwidget', CustomHistogramWidget);

  return <DashboardById dashboardOid="your-dashboard-oid" />;
}
```
