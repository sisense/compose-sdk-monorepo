---
title: 4 | Data Panel Configuration
---

# Data Panel Configuration

The data panel defines what dimension and measure inputs your widget accepts. These inputs appear in the Fusion widget editor and determine the shape of `dataOptions` passed to your visualization component.

> **Design inputs first.** Before writing any Visualization code, decide what your inputs should be called. Name them after what they represent visually — `x`/`y` for coordinate-based charts, `lat`/`lon` for geo, `path` for hierarchy, `breakBy` when a dimension splits data into series. The template defaults (`category`/`value`) are generic placeholders — rename them unless your chart is literally a category vs. value chart. The names become keys in `DataOptions`, appear in `DataPoint.entries` for cross-filtering, and are shown to users in the Widget editor.

## Defining Inputs

Each input in the `dataPanel.config.inputs` array describes one data slot:

```tsx
dataPanel: {
  config: {
    inputs: [
      {
        name: 'category',        // Key in dataOptions (must match your DataOptions type)
        displayName: 'Category', // Label shown in the data panel UI
        type: 'dimension',       // 'dimension' or 'measure'
        minItems: 1,             // Minimum required items (optional)
        maxItems: 2,             // Maximum allowed items (optional)
        canSort: true,           // Show sort controls (optional)
        canFormat: true,         // Show format controls (optional)
        canColor: true,          // Show color controls (optional)
      },
      {
        name: 'value',
        displayName: 'Value',
        type: 'measure',
        maxItems: 5,
      },
    ],
  },
},
```

### Input Properties

| Property      | Type                       | Description                       |
| ------------- | -------------------------- | --------------------------------- |
| `name`        | `string`                   | Key in `dataOptions` (required)   |
| `displayName` | `string`                   | Label in the editor UI (optional) |
| `type`        | `'dimension' \| 'measure'` | Controls accepted column types    |
| `minItems`    | `number`                   | Minimum required items (optional) |
| `maxItems`    | `number`                   | Maximum allowed items (optional)  |
| `canSort`     | `boolean`                  | Show sort controls (optional)     |
| `canFormat`   | `boolean`                  | Show format controls (optional)   |
| `canColor`    | `boolean`                  | Show color controls (optional)    |

## Mapping Inputs to DataOptions

The `name` of each input becomes a key in the `dataOptions` prop. Your `DataOptions` interface (defined in [Getting Started](./01-getting-started.md)) should mirror your inputs:

- `type: 'dimension'` → [`StyledColumn[]`](../../modules/sdk-ui/interfaces/interface.StyledColumn.md)
- `type: 'measure'` → [`StyledMeasureColumn[]`](../../modules/sdk-ui/interfaces/interface.StyledMeasureColumn.md)
- Every `name` in `inputs` should have a matching key in your `DataOptions` interface
- [`GenericDataOptions`](../../modules/sdk-ui/type-aliases/type-alias.GenericDataOptions.md) is the base type:
  `Record<string, Array<StyledColumn | StyledMeasureColumn>>`

## Example: Scatter Plot Configuration

### Simple Category + Value (Bar/Pie)

```tsx
inputs: [
  { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
  { name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
];
```

### Multi-Series with Break By (Line/Area)

```tsx
inputs: [
  { name: 'category', displayName: 'X-Axis', type: 'dimension', maxItems: 2 },
  { name: 'value', displayName: 'Values', type: 'measure', maxItems: 50 },
  { name: 'breakBy', displayName: 'Break By', type: 'dimension', maxItems: 1 },
];
```

### Scatter Plot (X, Y, Size, Color)

```tsx
inputs: [
  { name: 'x', displayName: 'X-Axis', type: 'measure', maxItems: 1, minItems: 1 },
  { name: 'y', displayName: 'Y-Axis', type: 'measure', maxItems: 1, minItems: 1 },
  { name: 'size', displayName: 'Size', type: 'measure', maxItems: 1 },
  { name: 'colorBy', displayName: 'Color By', type: 'dimension', maxItems: 1 },
];
```

### KPI / Indicator (Single Value)

```tsx
inputs: [
  { name: 'value', displayName: 'Value', type: 'measure', minItems: 1, maxItems: 1 },
  { name: 'secondary', displayName: 'Secondary', type: 'measure', maxItems: 1 },
];
```

---

## Using an AI Agent

Your AI agent handles the mechanical work of keeping `src/index.tsx` and `src/types.ts` in sync when your data panel changes. Tell it what you want in plain language:

- "Add a dimension input called `region`" — adds the entry to `dataPanel.config.inputs` and the typed field to `DataOptions`
- "Rename the `category` input to `x`" — updates the manifest, the type, and every reference in component code
- "Remove the `value` input" — removes the entry and cleans up all references
- "Generate a data model from my Sisense instance" — creates a typed TypeScript representation for use in `dev-preview-props.ts`

This is particularly useful when the template defaults (`category` / `value`) don't match your chart's semantics and you want to rename them to `x` / `y`, `lat` / `lon`, or `source` / `target`.

**Next lesson:** [Design Panel](./05-design-panel.md)
