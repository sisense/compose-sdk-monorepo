Rename a data input across all plugin files.

The user will specify: the current input name and the new name.

**All four source files must be updated atomically** — a partial rename leaves TypeScript errors and a runtime mismatch between `dataPanel.config.inputs[].name` and the `DataOptions` key.

## Files to change

| File                               | What to update                             |
| ---------------------------------- | ------------------------------------------ |
| `src/index.tsx`                    | `name:` value in `dataPanel.config.inputs` |
| `src/types.ts`                     | Key in `DataOptions` interface             |
| `src/components/Visualization.tsx` | Every `dataOptions.<oldName>` reference    |
| `src/dev-preview-props.ts`         | Key in the `dataOptions` object            |

If cross-filtering is set up, also rename the matching key in the `entries` object inside the data point builder in `Visualization.tsx`.

## 1. `src/index.tsx` — rename in inputs array

```tsx
// Before
{ name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 }

// After
{ name: 'xAxis', displayName: 'X Axis', type: 'dimension', maxItems: 1 }
```

The `displayName` does not have to match `name` — update it to reflect the new semantic meaning.

## 2. `src/types.ts` — rename the key in DataOptions

```ts
// Before
export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
}

// After
export interface DataOptions extends GenericDataOptions {
  xAxis: StyledColumn[];
  value: StyledMeasureColumn[];
}
```

## 3. `src/components/Visualization.tsx` — update all references

Replace every occurrence of `dataOptions.<oldName>` with `dataOptions.<newName>`.

Also update row-index comments that reference the old name:

```tsx
// Before
const cat = row[0].text ?? String(row[0].data); // category (dim 0)

// After
const xVal = row[0].text ?? String(row[0].data); // xAxis (dim 0)
```

If cross-filtering is set up, the `entries` object in the data point builder must use the new name — it must exactly match `dataPanel.config.inputs[].name`:

```tsx
// Before
entries: {
  category: dataOptions.category.map((col, i) => ({ ... })),
  value: dataOptions.value.map((col, i) => ({ ... })),
}

// After
entries: {
  xAxis: dataOptions.xAxis.map((col, i) => ({ ... })),
  value: dataOptions.value.map((col, i) => ({ ... })),
}
```

Also update the `MyDataPoint` interface if present:

```ts
// Before
interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: { category: DataPointEntry[]; value: DataPointEntry[] };
}

// After
interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: { xAxis: DataPointEntry[]; value: DataPointEntry[] };
}
```

## 4. `src/dev-preview-props.ts` — rename the key

Read `src/dev-preview-props.ts` first to see the current key and its column value. Only the key name changes — the column value stays exactly as-is.

```ts
// Before — key is the old name; column value is whatever is already in the file
dataOptions: {
  category: [{ column: /* existing column value — unchanged */ }],
}

// After — only the key name changes; column value is identical to what was there before
dataOptions: {
  xAxis: [{ column: /* same column value as before — do not replace it */ }],
}
```

## Verification

After renaming, TypeScript will catch any missed references — run:

```bash
npm run build
```

All remaining type errors will point to stale uses of the old name.
