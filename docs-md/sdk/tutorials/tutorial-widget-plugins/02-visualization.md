---
title: 2 | Building a Visualization
hidden: true
---

# Building a Visualization

The visualization component is the core of your plugin. It receives structured props from the SDK and renders your custom UI.

## Component Signature

```tsx
import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  return <div>...</div>;
};
```

## Props Overview

Your component receives `VisualizationProps` (i.e. [`CustomVisualizationProps`](../../modules/sdk-ui/interfaces/interface.CustomVisualizationProps.md)`<DataOptions, StyleOptions>` — `DataPoint` defaults to `AbstractDataPointWithEntries`):

| Prop                     | Type                                                                                                                                                           | Description                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `dataSource`             | [`DataSource`](../../modules/sdk-data/type-aliases/type-alias.DataSource.md)                                                                                   | Data model to query. Pass to query hooks.                                     |
| `dataOptions`            | `DataOptions`                                                                                                                                                  | Structured data config matching your [data panel inputs](./04-data-panel.md). |
| `styleOptions`           | `StyleOptions`                                                                                                                                                 | Style config from the [design panel](./05-design-panel.md).                   |
| `filters`                | [`Filter[]`](../../modules/sdk-data/interfaces/interface.Filter.md) &#124; [`FilterRelations`](../../modules/sdk-data/interfaces/interface.FilterRelations.md) | Active filters from the dashboard context.                                    |
| `highlights`             | [`Filter[]`](../../modules/sdk-data/interfaces/interface.Filter.md)                                                                                            | Cross-widget highlight filters. Matching data is visually emphasized.         |
| `onDataPointClick`       | [`CustomVisualizationDataPointEventHandler`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualizationDataPointEventHandler.md)                          | Single data point click. See [Event Handling](./06-event-handling.md).        |
| `onDataPointContextMenu` | [`CustomVisualizationDataPointContextMenuHandler`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualizationDataPointContextMenuHandler.md)              | Right-click handler. See [Event Handling](./06-event-handling.md).            |
| `onDataPointsSelected`   | [`CustomVisualizationDataPointsEventHandler`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualizationDataPointsEventHandler.md)                       | Multi-selection handler. See [Event Handling](./06-event-handling.md).        |

Both `filters` and `highlights` are passed to query hooks when fetching data (covered in [Fetching Data](./03-fetching-data.md)).

Always define defaults for `styleOptions` so the widget renders correctly when no styles are configured:

```tsx
const Visualization: CustomVisualization<VisualizationProps> = ({ styleOptions }) => {
  const colorScheme = styleOptions?.colorScheme ?? 'warm';
  const showLegend = styleOptions?.showLegend ?? true;
  // ...
};
```

## Type Parameterization

[`CustomVisualizationProps`](../../modules/sdk-ui/interfaces/interface.CustomVisualizationProps.md) accepts three type parameters:

```tsx
CustomVisualizationProps<DataOptions, StyleOptions, DataPoint>;
```

| Parameter      | Default                                                                                                           | Description                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `DataOptions`  | [`GenericDataOptions`](../../modules/sdk-ui/type-aliases/type-alias.GenericDataOptions.md)                        | Shape of data options matching data panel inputs |
| `StyleOptions` | [`CustomVisualizationStyleOptions`](../../modules/sdk-ui/interfaces/interface.CustomVisualizationStyleOptions.md) | Shape of style options from design panel         |
| `DataPoint`    | [`AbstractDataPointWithEntries`](../../modules/sdk-ui/type-aliases/type-alias.AbstractDataPointWithEntries.md)    | Shape of data points in event handlers           |

## Rendering Environment

Your component renders inside:

1. **WidgetContainer** — title bar, description, export options, border styling
2. **DynamicSizeContainer** — responsive width/height based on the widget's allocated space
3. **ErrorBoundary** — catches rendering errors and shows fallback UI

Design your component to fill its container responsively. Handle expected errors gracefully:

```tsx
const Visualization: CustomVisualization<VisualizationProps> = ({ dataOptions }) => {
  if (!dataOptions.value?.length) {
    return <div style={{ padding: 16, color: '#666' }}>Add a measure to get started.</div>;
  }

  return <div>...</div>;
};
```

## Widget Configuration

Control widget-level behavior via `customWidget.config`:

```tsx
customWidget: {
  name: 'my-custom-chart',
  displayName: 'My Custom Chart',
  config: {
    header: {
      visible: false, // Hide the widget header (title bar)
    },
  },
  visualization: { Component: Visualization },
},
```

Set `header.visible: false` for full-bleed visualizations that don't need a title bar.

## Wrapping Built-In Charts

You can wrap an existing Compose SDK chart inside a plugin to reuse SDK rendering while customizing behavior:

```tsx
import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';
import { LineChart } from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types';

type MyCustomLineChartProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const MyCustomLineChart: CustomVisualization<MyCustomLineChartProps> = (props) => {
  const styleOptions = { ...props.styleOptions };
  return (
    <LineChart
      dataSet={props.dataSource}
      dataOptions={props.dataOptions}
      filters={props.filters}
      styleOptions={styleOptions}
    />
  );
};
```

When wrapping built-in charts:

- `StyledColumn[]` and `StyledMeasureColumn[]` can be passed directly — no manual `.map()` to
  `Attribute` needed; built-in charts accept styled columns
- Spread `styleOptions` into a new object so downstream style merging works correctly
- Use `Pick<LineStyleOptions, ...>` for your `StyleOptions` to expose only the properties
  your design panel controls

---

**Next lesson:** [Fetching Data](./03-fetching-data.md)
