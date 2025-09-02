# How Highcharts-Based Charts Work

## Overview

Highcharts-based charts in the restructured charts architecture provide a streamlined way to create new chart types that leverage the Highcharts library. This approach combines the power of Highcharts with the type safety and modularity of the restructured charts system.

## Core Concepts

### What are Highcharts-Based Charts?

Highcharts-based charts are chart types that use Highcharts as their rendering engine. Currently supported types include:

- `area` - Area charts
- `column` - Column charts
- `bar` - Bar charts
- `line` - Line charts

These charts follow the same restructured chart architecture but have additional infrastructure specifically designed for Highcharts integration.

### Architecture Overview

The Highcharts-based chart system consists of:

1. **HighchartsOptionsBuilder** - Defines how to construct Highcharts configuration
2. **Common Renderer** - Manages the Highcharts lifecycle and React integration
3. **Build Pipeline** - Orchestrates the transformation of data into Highcharts options
4. **Shared Helpers** - Reusable utilities for common chart patterns

## The HighchartsOptionsBuilder Interface

The `HighchartsOptionsBuilder<CT>` interface is the core contract for defining how a chart type constructs its Highcharts configuration:

```typescript
type HighchartsOptionsBuilder<CT> = {
  getChart: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['chart'];
  getSeries: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['series'];
  getAxes: (ctx: BuildContext<CT>) => {
    xAxis: HighchartsOptionsInternal['xAxis'];
    yAxis: HighchartsOptionsInternal['yAxis'];
  };
  getLegend: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['legend'];
  getPlotOptions: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['plotOptions'];
  getTooltip: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['tooltip'];
  getExtras: (ctx: BuildContext<CT>) => Partial<HighchartsOptionsInternal>;
};
```

### Build Context

Each method receives a `BuildContext` containing all the information needed to construct the options:

```typescript
type BuildContext<CT> = {
  chartData: TypedChartData<CT>; // Processed chart data
  dataOptions: TypedDataOptionsInternal<CT>; // Internal data configuration
  designOptions: TypedDesignOptions<CT>; // Visual styling options
  extraConfig: {
    translate: TFunction; // Translation function
    themeSettings: CompleteThemeSettings; // Theme configuration
    dateFormatter: (date: Date, format: string) => string;
    accessibilityEnabled: boolean;
  };
};
```

## Options Building Pipeline

The `buildHighchartsOptions` function orchestrates the construction of final Highcharts options through a functional pipeline:

```typescript
flow(
  withCommonHighchartsOptions(themeSettings, accessibilityEnabled),
  withEventHandlers(dataOptions, dataPointsEventHandlers),
  withThemeOptions(themeSettings),
  withUserCustomizations(onBeforeRender),
)({
  chart: builder.getChart(builderContext),
  series: builder.getSeries(builderContext),
  ...builder.getAxes(builderContext),
  legend: builder.getLegend(builderContext),
  plotOptions: builder.getPlotOptions(builderContext),
  tooltip: builder.getTooltip(builderContext),
  ...builder.getExtras(builderContext),
});
```

### Pipeline Steps

1. **Initial Options**: The builder methods create the base Highcharts configuration
2. **Common Options**: Applies standard settings (credits disabled, exporting configuration, etc.)
3. **Event Handlers**: Attaches click, context menu, and selection handlers
4. **Theme Application**: Applies theme-specific colors, fonts, and styling
5. **User Customizations**: Allows users to modify options via `onBeforeRender`

## The Common Renderer Component

The `createHighchartsBasedChartRenderer()` factory creates a React component that already has all the necessary infrastructure to render a Highcharts-based chart and encapsulates chart-specific highcharts options building pipeline.

### Usage

```typescript
const MyChartRenderer = createHighchartsBasedChartRenderer({
  highchartsOptionsBuilder: myChartOptionsBuilder, // inject your specific options builder here
  getAlerts: (ctx) => [], // inject your specific alerts builder here
});
```

## Shared Helpers

The infrastructure provides numerous helpers organized in a hierarchical structure based on chart families. This organization allows for maximum code reuse while maintaining specificity where needed.

### Chart Family Hierarchy

Highcharts-based charts are organized into families that share common characteristics:

```
highchart-based-charts/
├── cartesians/           # Charts with X/Y axes
│   ├── helpers/          # Common cartesian functionality
│   ├── line-chart/       # Line charts (non-stackable)
│   └── stackable/        # Charts that support stacking
│       ├── helpers/      # Common stackable functionality
│       ├── area-chart/   # Area charts with stacking support
│       ├── column-chart/ # Column charts with stacking support
│       └── bar-chart/    # Bar charts with stacking support
```

### Benefits of Hierarchical Organization

1. **Incremental Specialization**: Each level adds more specific functionality while inheriting from parent levels
2. **Code Reuse**: Common patterns are abstracted at the appropriate level of the hierarchy
3. **Maintainability**: Changes to shared logic automatically benefit all charts in the family
4. **Extensibility**: New chart families can be added without affecting existing ones

## Creating a New Highcharts-Based Chart

### Step 1: Define the Options Builder

```typescript
// my-chart/highcharts-options-builder.ts
import { HighchartsOptionsBuilder } from '../types';

export const myChartHighchartsOptionsBuilder: HighchartsOptionsBuilder<'mychart'> = {
  getChart: (ctx) => ({
    type: 'mychart',
    backgroundColor: ctx.designOptions.backgroundColor,
    // Other chart-specific configuration
  }),

  getSeries: (ctx) => {
    // Transform ctx.chartData into Highcharts series format
    return ctx.chartData.series.map((series) => ({
      type: 'mychart',
      name: series.name,
      data: series.data,
      // Series-specific options
    }));
  },

  getAxes: (ctx) => ({
    xAxis: {
      categories: ctx.chartData.categories,
      title: { text: ctx.dataOptions.x.title },
      // X-axis configuration
    },
    yAxis: {
      title: { text: ctx.dataOptions.y.title },
      // Y-axis configuration
    },
  }),

  getLegend: (ctx) => ({
    enabled: ctx.designOptions.legend.enabled,
    // Legend configuration
  }),

  getPlotOptions: (ctx) => ({
    mychart: {
      // Chart type specific plot options
    },
  }),

  getTooltip: (ctx) => ({
    formatter: function () {
      // Custom tooltip formatting
    },
  }),

  getExtras: (ctx) => ({
    // Any additional Highcharts options
  }),
};
```

### Step 2: Create the Chart Builder

Following the same pattern as described in the [Creating a New Chart Type](../how-it-works.md#creating-a-new-chart-type) section, create your chart builder:

```typescript
// my-chart/my-chart-builder.ts
import { ChartBuilder } from '../types';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../highcharts-based-chart-renderer';
import { myChartHighchartsOptionsBuilder } from './highcharts-options-builder';

export const myChartBuilder: ChartBuilder<'mychart'> = {
  dataOptions: {
    // Implement data options methods
  },
  data: {
    // Implement data loading and processing
  },
  designOptions: {
    // Implement design options translation
  },
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: myChartHighchartsOptionsBuilder,
      getAlerts: (ctx) => {
        const alerts = [];
        // Add any data validation alerts
        if (ctx.chartData.series.length === 0) {
          alerts.push('No data to display');
        }
        return alerts;
      },
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
```

### Step 3: Update the Chart Type Registry

Before registering your chart, you need to update the `isHighchartsBasedChart` function to include your new chart type:

```typescript
// highcharts-based-chart-renderer/utils.ts
export const isHighchartsBasedChart = (
  chartType: ChartType,
): chartType is HighchartBasedChartTypes => {
  return ['column', 'bar', 'line', 'area', 'mychart'].includes(chartType);
  //                                    ^^^^^^^^^ Add your new chart type here
};
```

This function is used by the system to determine which charts should use the Highcharts-based rendering pipeline.

### Step 4: Register the Chart

Add your chart builder to the chart builder factory to make it available in the system.

## Best Practices

1. **Leverage Existing Helpers**: Before implementing custom logic, check if shared helpers can be reused. Check the chart family hierarchy to see if your chart belongs to a family that already has shared helpers. Feel free to refactor shared helpers if needed or create new ones.
2. **Type Safety**: Ensure all methods properly handle the typed context.

## Benefits

- **Consistency**: All Highcharts-based charts follow the same pattern
- **Type Safety**: Full TypeScript support throughout the pipeline
- **Reusability**: Shared infrastructure reduces code duplication
- **Flexibility**: Each chart can customize any aspect of Highcharts options
- **Integration**: Seamless integration with the broader restructured charts system
