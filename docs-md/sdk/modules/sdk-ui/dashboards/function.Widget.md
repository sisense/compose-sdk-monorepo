---
title: Widget
---

# Function Widget

> **Widget**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

Facade component that renders a widget within a dashboard based on the widget type.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`

## Example

```ts
import { measureFactory } from '@sisense/sdk-data';
import { Widget, WidgetProps } from '@sisense/sdk-ui';
import * as DM from './sample-ecommerce';

const widgetProps: WidgetProps = {
  id: 'widget-1',
  widgetType: 'chart',
  chartType: 'indicator',
  dataOptions: { value: [measureFactory.sum(DM.Commerce.Cost)] },
};

const CodeExample = () => <Widget {...widgetProps} />;

export default CodeExample;
```
