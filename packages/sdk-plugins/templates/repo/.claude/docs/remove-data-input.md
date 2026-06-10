Remove a data input from this plugin — cleans up all four source files.

The user will specify: the input name to remove.

**Row indices shift when a dimension is removed.** After removing, update any hardcoded index accesses in `Visualization.tsx`.

## Files to change

| File                               | What to update                                                    |
| ---------------------------------- | ----------------------------------------------------------------- |
| `src/index.tsx`                    | Delete the input object from `dataPanel.config.inputs`            |
| `src/types.ts`                     | Delete the key from `DataOptions`                                 |
| `src/components/Visualization.tsx` | Remove all `dataOptions.<name>` references; fix row index offsets |
| `src/dev-preview-props.ts`         | Delete the key from `dataOptions`                                 |

## 1. `src/index.tsx` — delete from inputs array

```tsx
// Before
inputs: [
  { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
  { name: 'breakBy', displayName: 'Break By', type: 'dimension', maxItems: 1 },
  { name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
];

// After (removing 'breakBy')
inputs: [
  { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
  { name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
];
```

## 2. `src/types.ts` — delete the key from DataOptions

```ts
// Before
export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[];
  breakBy: StyledColumn[]; // ← remove
  value: StyledMeasureColumn[];
}

// After
export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
}
```

## 3. `src/components/Visualization.tsx` — remove references and fix indices

Remove all `dataOptions.<removedName>` accesses — including the `enabled` guard if the deleted input was used there:

```tsx
// If the removed input was the one guarding the query, remove or replace the guard:
const { data } = useExecuteQuery({
  dataSource: props.dataSource,
  dimensions,
  measures,
  filters: props.filters,
  highlights: props.highlights,
  enabled: (props.dataOptions.breakBy?.length ?? 0) > 0, // ← remove or switch to another input
});
```

**If the removed input was a dimension, measure row indices shift downward.** Example:

```
Before (breakBy present): row[0]=category (dim0), row[1]=breakBy (dim1), row[2]=value (measure0)
After  (breakBy removed): row[0]=category (dim0),                         row[1]=value (measure0)
```

If you use `extractDimensionsAndMeasures`, `dimensions.length` updates automatically — no manual fix needed. If you use hardcoded index numbers, decrement the measure offset by 1 for each dimension removed.

If cross-filtering is set up, remove the corresponding key from the `entries` object and the `MyDataPoint` interface. Also check for inter-dimension row-offset expressions like `dataOptions.x.length + i` — if the removed input was `x`, these references become type errors that TypeScript will flag; fix them by removing the term or replacing it with the corrected dimension's position:

```tsx
// Before
interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    category: DataPointEntry[];
    breakBy: DataPointEntry[];    // ← remove
    value: DataPointEntry[];
  };
}

const buildDataPoint = (rowIndex: number): MyDataPoint => ({
  entries: {
    category: dataOptions.category.map((col, i) => ({ ... })),
    breakBy: dataOptions.breakBy.map((col, i) => ({ ... })),   // ← remove
    value: dataOptions.value.map((col, i) => ({ ... })),
  },
});

// After
interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    category: DataPointEntry[];
    value: DataPointEntry[];
  };
}

const buildDataPoint = (rowIndex: number): MyDataPoint => ({
  entries: {
    category: dataOptions.category.map((col, i) => ({ ... })),
    value: dataOptions.value.map((col, i) => ({ ... })),
  },
});
```

## 4. `src/dev-preview-props.ts` — delete the key

Read `src/dev-preview-props.ts` to find the key being removed. Delete that entry — all other entries stay exactly as they are in the file.

```ts
// Before — existing entries use whatever columns are already in the file
dataOptions: {
  category: [{ column: /* existing column — unchanged */ }],
  breakBy: [{ column: /* existing column — remove this entire line */ }],    // ← remove
  value: [{ column: /* existing measure — unchanged */ }],
}

// After
dataOptions: {
  category: [{ column: /* same as before */ }],
  value: [{ column: /* same as before */ }],
}
```

## Verification

```bash
npm run build
```

TypeScript will flag any remaining references to the removed input name.
