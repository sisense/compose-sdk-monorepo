---
title: useCustomWidgets
---

# Function useCustomWidgets

> **useCustomWidgets**(): [`UseCustomWidgetsResult`](../type-aliases/type-alias.UseCustomWidgetsResult.md)

Hook that provides API for configuring custom widgets.

## Returns

[`UseCustomWidgetsResult`](../type-aliases/type-alias.UseCustomWidgetsResult.md)

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
