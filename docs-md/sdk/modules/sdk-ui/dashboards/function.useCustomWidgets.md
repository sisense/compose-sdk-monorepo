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
import { useEffect } from 'react';
import { useCustomWidgets, DashboardById } from '@sisense/sdk-ui';
import CustomHistogramWidget from './custom-histogram-widget';

const Example = () => {
  const { registerCustomWidget, unregisterCustomWidget } = useCustomWidgets();

  useEffect(() => {
    registerCustomWidget('histogramwidget', CustomHistogramWidget);
    // Optionally unregister on unmount (e.g. if the widget should only be available within this component)
    return () => unregisterCustomWidget('histogramwidget');
  }, [registerCustomWidget, unregisterCustomWidget]);

  return <DashboardById dashboardOid="your-dashboard-oid" />;
}
```
