---
title: CustomVisualization
---

# Type alias CustomVisualization <Badge type="beta" text="Beta" />`<Props>`

> **CustomVisualization**: <`Props`> (`props`) => `ReactNode`

Defines a user-defined custom visualization component.
Can be any visual representation of data — chart, table, map, etc.

## Example

```ts
import { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';

const MyChart: CustomVisualization<CustomVisualizationProps> = ({ dataOptions, styleOptions }) => {
  return <div className="my-chart">{JSON.stringify(dataOptions)}</div>;
};
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `Props` | [`CustomVisualizationProps`](interface.CustomVisualizationProps.md) | The props type for the custom visualization component, extending [CustomVisualizationProps](interface.CustomVisualizationProps.md). |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | `Props` | Props injected by the dashboard, including `dataOptions`, `styleOptions`, `filters`, and event handlers. |

## Returns

`ReactNode`

A React node representing the rendered visualization.
