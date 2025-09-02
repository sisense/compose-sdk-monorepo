# How Restructured Charts Work

## Overview

The restructured charts architecture is a modular, type-safe approach to implementing chart types in the Compose SDK. It provides a standardized way to add new chart types while maintaining strong TypeScript type safety throughout the entire data flow.

## Core Principles

### 1. **Separation of Concerns**

Each chart type is broken down into four distinct areas:

- **Data Options**: Handling and validation of chart configuration
- **Data Loading & Processing**: Fetching and transforming data
- **Design Options**: Styling and visual configuration
- **Rendering**: The actual chart component

### 2. **Type Safety**

The architecture uses TypeScript generics extensively to ensure type safety from data options through to rendering, eliminating runtime type errors and improving developer experience.

### 3. **Modularity**

Each chart type is self-contained with its own builder that implements the `ChartBuilder` interface, making it easy to add new chart types without modifying existing code.

## Architecture Components

### ChartBuilder Interface

The `ChartBuilder<CT>` interface is the core contract that every chart type must implement:

```typescript
interface ChartBuilder<CT extends SupportedChartType> {
  dataOptions: {
    translateDataOptionsToInternal: (options) => InternalOptions;
    getAttributes: (options) => Attribute[];
    getMeasures: (options) => Measure[];
    isCorrectDataOptions: TypeGuard;
    isCorrectDataOptionsInternal: TypeGuard;
  };
  data: {
    loadData: LoadDataFunction;
    getChartData: (options, dataTable) => ChartData;
  };
  designOptions: {
    translateStyleOptionsToDesignOptions: (style, data) => DesignOptions;
    isCorrectStyleOptions: TypeGuard;
  };
  renderer: {
    ChartRendererComponent: React.Component;
    isCorrectRendererProps: TypeGuard;
  };
}
```

### Chart Builder Factory

The factory pattern is used to register and retrieve chart builders:

```typescript
const chartBuildersMap = {
  areamap: areamapChartBuilder,
  area: areaChartBuilder,
  column: columnChartBuilder,
  bar: barChartBuilder,
  line: lineChartBuilder,
};

function getChartBuilder(chartType) {
  return chartBuildersMap[chartType];
}
```

## Integration Flow

The restructured charts integrate seamlessly with the existing chart rendering pipeline:

1. **Chart Type Detection**: `isRestructuredChartType()` checks if a chart type uses the new architecture
2. **Builder Retrieval**: `getChartBuilder()` fetches the appropriate builder
3. **Data Flow**: The builder's methods are used throughout the data pipeline
4. **Rendering**: The builder's renderer component is used to display the chart

## Creating a New Chart Type

### Step 1: Define Types

First, extend the `SupportedChartType` union and create type mappings:

```typescript
// In types.ts
export type SupportedChartType = 'areamap' | 'area' | 'column' | 'bar' | 'line' | 'mynewchart';

// Add type mappings for your chart
export type TypedChartDataOptions<CT> = CT extends 'mynewchart'
  ? MyNewChartDataOptions
  : // ... other mappings
```

### Step 2: Create Chart Builder Structure

Create a directory structure for your chart:

```
mynewchart/
├── types.ts              # Chart-specific types
├── data-options/         # Data options handling
│   └── index.ts
├── data/                 # Data loading and processing
│   └── index.ts
├── design-options/       # Style to design translation
│   └── index.ts
├── renderer/             # Chart component
│   └── index.ts
└── mynewchart-builder.ts # Main builder
```

### Step 3: Implement Data Options

```typescript
// data-options/index.ts
export const dataOptionsTranslators = {
  translateDataOptionsToInternal: (options) => {
    // Convert user-facing options to internal format
  },
  getAttributes: (options) => {
    // Extract dimension attributes
  },
  getMeasures: (options) => {
    // Extract measure attributes
  },
  isCorrectDataOptions: (options): options is MyNewChartDataOptions => {
    // Type guard for data options
  },
  isCorrectDataOptionsInternal: (options): options is MyNewChartDataOptionsInternal => {
    // Type guard for internal options
  },
};
```

### Step 4: Implement Data Processing

```typescript
// data/index.ts
export const dataTranslators = {
  loadData: loadDataBySingleQuery, // default implementation for single query execution, override if your chart has different data loading logic then a single JAQL query
  getChartData: (dataOptions, dataTable) => {
    // Transform data table to chart-specific format
  },
};
```

### Step 5: Implement Design Options

```typescript
// design-options/index.ts
export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions: (styleOptions, dataOptions) => {
    // Convert style options to design options
  },
  isCorrectStyleOptions: (options): options is MyNewChartStyleOptions => {
    // Type guard for style options
  },
};
```

### Step 6: Create Renderer Component

```typescript
// renderer/index.tsx
export const MyNewChart: React.FC<MyNewChartProps> = (props) => {
  // Implement chart rendering logic
};

export const isMyNewChartProps = (props): props is MyNewChartProps => {
  // Type guard for renderer props
};
```

### Step 7: Assemble the Builder

```typescript
// mynewchart-builder.ts
import { ChartBuilder } from '../types';

export const myNewChartBuilder: ChartBuilder<'mynewchart'> = {
  dataOptions: dataOptionsTranslators,
  data: dataTranslators,
  designOptions: designOptionsTranslators,
  renderer: {
    ChartRendererComponent: MyNewChart,
    isCorrectRendererProps: isMyNewChartProps,
  },
};
```

### Step 8: Register the Builder

Add your builder to the factory:

```typescript
// chart-builder-factory.ts
export const chartBuildersMap = {
  // ... existing builders
  mynewchart: myNewChartBuilder,
};
```

## Best Practices

1. **Type Guards**: Always implement proper type guards for runtime type checking
2. **Error Handling**: Throw descriptive errors when data doesn't match expected format
3. **Reusability**: Look for opportunities to reuse helpers from existing chart implementations
4. **Testing**: Write comprehensive tests for each component of your chart builder
5. **Documentation**: Document the expected data format and options for your chart type

## Highcharts-Based Charts

For charts based on Highcharts, there's additional infrastructure that simplifies the creation of new Highcharts-based chart types. This infrastructure includes specialized builders, renderers, and helpers designed specifically for Highcharts integration.

For detailed information on how to create and work with Highcharts-based charts, see the [Highcharts-Based Charts Guide](./highchart-based-charts/how-it-works.md).

## Benefits

1. **Type Safety**: Compile-time guarantees about data flow
2. **Modularity**: Easy to add new chart types without affecting existing ones
3. **Testability**: Each component can be tested in isolation
4. **Maintainability**: Clear separation of concerns makes debugging easier
5. **Consistency**: Standardized approach across all chart types
