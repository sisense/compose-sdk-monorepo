Add a new dimension or measure input to this plugin's data panel.

The user will specify: input name, display name, whether it is a dimension or measure, and optionally maxItems.

Make the following changes in order:

## 1. `src/index.tsx` — add to `dataPanel.config.inputs`

```tsx
{
  name: '<inputName>',           // must match key in DataOptions
  displayName: '<Display Name>', // label shown in Fusion editor
  type: '<dimension|measure>',
  maxItems: <n>,                 // optional — omit if no limit needed
}
```

Full list of supported input properties:

| Property      | Type                       | Description                              |
| ------------- | -------------------------- | ---------------------------------------- |
| `name`        | `string`                   | Key in `dataOptions` (required)          |
| `displayName` | `string`                   | Label shown in the Fusion editor         |
| `type`        | `'dimension' \| 'measure'` | Controls which column types are accepted |
| `minItems`    | `number`                   | Minimum required items                   |
| `maxItems`    | `number`                   | Maximum allowed items                    |
| `canSort`     | `boolean`                  | Show sort controls                       |
| `canFormat`   | `boolean`                  | Show number format controls              |
| `canColor`    | `boolean`                  | Show color picker controls               |

**When to use the optional flags:**

- `canSort` — Enable on any dimension where display order matters (category axis, table rows). The sorted order is reflected in `data.rows` automatically.
- `canFormat` — Enable on measures that display as numbers (revenue, count, percentage). When set, `cell.text` contains the formatted string (e.g. `"$1,234.56"`); prefer `cell.text` over `String(cell.data)` in your visualization.
- `canColor` — Enable on dimensions or measures where the user may want to assign a custom color per value. The chosen color is available on `col.color` in `dataOptions`.

## 2. `src/types.ts` — add a matching key to `DataOptions`

- For `type: 'dimension'`: `<inputName>: StyledColumn[];`
- For `type: 'measure'`: `<inputName>: StyledMeasureColumn[];`

Example:

```ts
export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
  myNewDimension: StyledColumn[]; // ← add this
}
```

## 3. `src/components/Visualization.tsx` — use the new input

`extractDimensionsAndMeasures` reads all `dataOptions` automatically — no extra wiring needed. The new column appears in `data.rows` following the `[...dimensions, ...measures]` ordering rule.

**When adding a dimension**, all measure indices shift right by 1. Update any hardcoded index accesses:

```
Before (category + value):       row[0]=category(dim0), row[1]=value(measure0)
After  (category + breakBy + value): row[0]=category(dim0), row[1]=breakBy(dim1), row[2]=value(measure0)
```

```tsx
// After adding breakBy dimension:
const cat = row[0].text ?? String(row[0].data); // dim 0 — unchanged
const breakBy = row[1].text ?? String(row[1].data); // dim 1 — new
const value = row[2].data as number; // measure 0 — shifted from row[1] to row[2]
```

**When adding a measure**, existing indices are unaffected — the new measure appends after existing ones:

```
Before (category + value):          row[0]=category, row[1]=value(measure0)
After  (category + value + size):   row[0]=category, row[1]=value(measure0), row[2]=size(measure1)
```

When using `useExecuteQuery` directly, call `extractDimensionsAndMeasures(props.dataOptions)` — it picks up the new input automatically. Always use `dimensions.length + i` as the measure offset rather than hardcoding, so it stays correct as inputs are added or removed.

## 4. `src/dev-preview-props.ts` — add sample data for the new input

**Before adding the sample value, read `src/dev-preview-props.ts` to see which DM module is imported and which attribute style is already used, then follow the same pattern.**

Add the new key inside the `dataOptions` object, using attributes from the same DM module already imported in that file:

```ts
dataOptions: {
  category: [{ column: /* use an attribute already imported in src/dev-preview-props.ts */ }],
  value: [{ column: /* use a measure already imported in src/dev-preview-props.ts */ }],
  // For a new dimension — pick an attribute from the DM module already in the file:
  myNewDimension: [{ column: /* use an attribute already imported in src/dev-preview-props.ts */ }],
  // For a new measure:
  myNewMeasure: [{ column: /* use a measure expression matching the style already in the file */ }],
},
```

The dev preview is purely for local development and does not affect Fusion behavior.

## Complete before/after example

**Before** — single category + value:

```ts
// src/types.ts
export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
}

// src/index.tsx — dataPanel.config.inputs
inputs: [
  { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
  { name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
];
```

**After** — adding a `breakBy` dimension:

```ts
// src/types.ts
export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
  breakBy: StyledColumn[]; // ← new
}

// src/index.tsx — dataPanel.config.inputs
inputs: [
  { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
  { name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
  { name: 'breakBy', displayName: 'Break By', type: 'dimension', maxItems: 1 }, // ← new
];

// src/dev-preview-props.ts — add sample data
// Read this file first to see which DM module is imported, then follow the same pattern.
dataOptions: {
  category: [{ column: /* existing attribute — already in src/dev-preview-props.ts */ }],
  value: [{ column: /* existing measure — already in src/dev-preview-props.ts */ }],
  breakBy: [{ column: /* use an attribute already imported in src/dev-preview-props.ts */ }], // ← new
},
```

Row order after adding `breakBy`:

```
row[0] = category   (dim 0)
row[1] = breakBy    (dim 1)   ← shifted before measure because dimensions come first
row[2] = value      (measure 0)
```
