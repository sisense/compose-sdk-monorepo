# Data Panel Configuration

The data panel is declared in `src/index.tsx` under `customWidget.dataPanel.config.inputs`. It defines what dimensions and measures the user can assign to your widget in the Fusion editor data panel.

> **Design inputs first.** Before writing any Visualization code, decide what your inputs should be called. Name them after what they represent visually — `x`/`y` for coordinate-based charts, `lat`/`lon` for geo, `path` for hierarchy, `breakBy` when a dimension splits data into series. The template defaults (`category`/`value`) are generic placeholders — rename them unless your chart is literally a category vs. value chart. The names become keys in `DataOptions`, appear in `DataPoint.entries` for cross-filtering, and are shown to users in the Fusion editor.

---

## Input definition

```ts
{
  name: string;                    // key in DataOptions — MUST match exactly
  displayName?: string;            // label shown in the editor (defaults to name)
  type: 'dimension' | 'measure';   // controls what column types are accepted
  minItems?: number;               // 0 by default — set to 1 to make required
  maxItems?: number;               // no limit by default
  canSort?: boolean;               // show sort controls (default: false)
  canFormat?: boolean;             // show number-format controls (measure only)
  canColor?: boolean;              // show per-item color picker
}
```

---

## Type mapping in `src/types.ts`

Every `name` in `inputs` must have a matching key in `DataOptions` with the correct type:

```ts
type: 'dimension'  →  StyledColumn[]
type: 'measure'    →  StyledMeasureColumn[]
```

Example:

```ts
// src/types.ts
export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[]; // matches input name: 'category', type: 'dimension'
  value: StyledMeasureColumn[]; // matches input name: 'value',    type: 'measure'
}
```

---

## Common patterns

### Single category + single value (most common)

```ts
inputs: [
  {
    name: 'category',
    displayName: 'Category',
    type: 'dimension',
    minItems: 1,
    maxItems: 1,
    canSort: true,
  },
  {
    name: 'value',
    displayName: 'Value',
    type: 'measure',
    minItems: 1,
    maxItems: 1,
    canFormat: true,
  },
];
```

### Multi-series (break by)

```ts
inputs: [
  {
    name: 'category',
    displayName: 'X Axis',
    type: 'dimension',
    minItems: 1,
    maxItems: 1,
  },
  { name: 'value', displayName: 'Values', type: 'measure', minItems: 1 },
  { name: 'breakBy', displayName: 'Break By', type: 'dimension', maxItems: 3 },
];
```

### Scatter plot (two measures + optional size)

```ts
inputs: [
  {
    name: 'x',
    displayName: 'X Axis',
    type: 'measure',
    minItems: 1,
    maxItems: 1,
  },
  {
    name: 'y',
    displayName: 'Y Axis',
    type: 'measure',
    minItems: 1,
    maxItems: 1,
  },
  { name: 'size', displayName: 'Bubble Size', type: 'measure', maxItems: 1 },
  { name: 'color', displayName: 'Color By', type: 'dimension', maxItems: 1 },
  { name: 'tooltip', displayName: 'Tooltip', type: 'dimension', maxItems: 3 },
];
```

### KPI / single number

```ts
inputs: [
  {
    name: 'value',
    displayName: 'KPI Value',
    type: 'measure',
    minItems: 1,
    maxItems: 1,
    canFormat: true,
  },
  { name: 'context', displayName: 'Context', type: 'dimension', maxItems: 2 },
];
```

---

## Choosing inputs for your chart type

Map your chart's visual axes and encodings directly to inputs. Name them after what they represent visually, not generic names like `category` / `value`.

| Chart type                 | Inputs                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Bar / Line (single series) | `x` (dimension), `value` (measure)                                                      |
| Bar / Line (multi-series)  | `x` (dimension), `value` (measure), `breakBy` (dimension, optional)                     |
| Scatter plot               | `x` (measure), `y` (measure), `size` (measure, optional), `color` (dimension, optional) |
| Density / Heatmap          | `x` (dimension), `y` (dimension), `value` (measure — the density or count)              |
| Bubble map                 | `lat` (dimension), `lon` (dimension), `size` (measure), `label` (dimension, optional)   |
| KPI / Single number        | `value` (measure), `context` (dimension, optional — for tooltip)                        |
| Tree / Sunburst            | `path` (dimension, no `maxItems` — unlimited depth), `value` (measure)                  |

**Naming tips:**

- Use the axis name as the input name: `x`, `y`, `z` for coordinate-based charts
- Use `value` or `size` or `color` for measures that encode a visual property
- Use `breakBy` when one dimension splits data into multiple series
- Keep names short — they become keys in `DataOptions` and appear in `entries` for cross-filtering

**Density / heatmap example** (x dimension × y dimension → colored by measure):

```ts
// src/index.tsx
inputs: [
  {
    name: 'x',
    displayName: 'X Axis',
    type: 'dimension',
    minItems: 1,
    maxItems: 1,
  },
  {
    name: 'y',
    displayName: 'Y Axis',
    type: 'dimension',
    minItems: 1,
    maxItems: 1,
  },
  {
    name: 'value',
    displayName: 'Value',
    type: 'measure',
    minItems: 1,
    maxItems: 1,
    canFormat: true,
  },
];

// src/types.ts
export interface DataOptions extends GenericDataOptions {
  x: StyledColumn[]; // matches input name: 'x',     type: 'dimension'
  y: StyledColumn[]; // matches input name: 'y',     type: 'dimension'
  value: StyledMeasureColumn[]; // matches input name: 'value', type: 'measure'
}
```

With this config, `extractDimensionsAndMeasures(dataOptions)` returns `dimensions = [x[0].column, y[0].column]` and the query rows are `[xCell, yCell, valueCell]`.

---

## Accessing inputs in Visualization

```tsx
// Check if optional input has data before using
const hasBreakBy = (props.dataOptions.breakBy?.length ?? 0) > 0;

// Guard required inputs
if ((props.dataOptions.category?.length ?? 0) === 0) {
  return <div>Add a Category dimension to get started.</div>;
}
```

---

## Row index reference

With inputs `[category (dim), breakBy (dim), value (measure)]`, query rows are:

| Index    | Input      | Reason                   |
| -------- | ---------- | ------------------------ |
| `row[0]` | `category` | first dimension          |
| `row[1]` | `breakBy`  | second dimension         |
| `row[2]` | `value`    | first (and only) measure |

Dimensions always precede measures regardless of declaration order.
