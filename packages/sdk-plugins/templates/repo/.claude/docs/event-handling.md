# Event Handling & Cross-Filtering

## Two directions of cross-filtering

Cross-filtering has **two separate directions** — implement both for a complete integration:

| Direction              | What it means                                          | How to implement                                                                  |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **Outgoing** (emit)    | User clicks your widget → other widgets dim their rows | Call `onDataPointClick` with a correctly structured `DataPoint`                   |
| **Incoming** (receive) | Another widget is clicked → your widget dims its rows  | Pass `highlights` to your query hook, then read `cell.blur` and dim rows visually |

**Both directions work together.** Without outgoing: clicking your widget does nothing to others. Without incoming rendering: your widget stays fully opaque when others cross-filter.

---

## How the full flow works

1. User clicks a data point in your widget.
2. You call `onDataPointClick(dataPoint, nativeEvent)`.
3. The SDK reads `attribute` fields from the data point entries and builds member filters.
4. Those filters are broadcast as `highlights` to all other widgets on the dashboard.
5. Other widgets receive `highlights` via their `highlights` prop, pass it to their query, and the **server marks non-matching rows with `cell.blur = true`**.
6. Each widget reads `cell.blur` from its query result and dims the matching rows visually.

**Your widget participates in step 5–6** when another widget cross-filters. Pass `highlights` to your query and render `cell.blur`.

**`filters` vs `highlights`:**

| Prop         | Origin                                                           | Effect on query                                                 |
| ------------ | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| `filters`    | Dashboard filters in "Slice" mode                                | Restricts rows returned — non-matching rows absent              |
| `highlights` | Dashboard filters in "Highlight" mode, **or** cross-widget click | All rows returned — non-matching rows marked `cell.blur = true` |

> The SDK routes dashboard filters into `filters` or `highlights` automatically based on each filter's "Slice/Highlight" setting — your widget does not need to inspect or handle this routing. Just pass both props to your query hook every time.

**Handler registration prerequisite:** The dashboard only wires up `onDataPointClick`, `onDataPointContextMenu`, and `onDataPointsSelected` when your widget has **at least one dimension input assigned** by the user. If the data panel is empty (no dimensions assigned), all three handlers will be `undefined` and clicks will appear to do nothing. This is normal — guard with the `enabled` pattern on your query hook.

**All non-measure inputs are selectable:** The SDK automatically considers every dimension input in your `dataOptions` as a cross-filter source — not just `category`. A widget with `category`, `breakBy`, and `region` dimension inputs will cross-filter on all three simultaneously. Make sure your data point's `entries` object includes all dimension keys you want to participate.

---

## Incoming: rendering `cell.blur`

After passing `highlights` to your query hook, each cell in the result has a `blur` flag set by the server:

- `blur === true` → row does NOT match the active highlight → **dim it** (~0.25 opacity)
- `blur === false` → row DOES match → **full opacity**
- `blur === undefined` → no highlights are active → **full opacity**

> Reading `row[0].blur` is sufficient — all cells in the same query row share the same `blur` value.

```tsx
const hasHighlights = data.rows.some((row) => row[0].blur !== undefined);
const rowOpacity = (row: (typeof data.rows)[0]) =>
  hasHighlights && row[0].blur === true ? 0.25 : 1;

// In your JSX:
{
  data.rows.map((row, i) => (
    <div
      key={i}
      style={{ opacity: rowOpacity(row), transition: 'opacity 0.2s' }}
      onClick={(e) =>
        props.onDataPointClick?.(buildDataPoint(i), e.nativeEvent)
      }
    >
      ...
    </div>
  ));
}
```

For **Plotly**, pass `blur`-based opacity as a per-point array in the trace's `marker.opacity`. For **D3**, apply opacity to each SVG element. For **Recharts**, use the `opacity` style on each rendered element. See `.claude/docs/data-fetching.md` for Plotly and DOM examples.

> **Imperative libraries (Plotly, D3):** The `blur` values must be read at the time `newPlot`/`update` is called, before event handlers are registered. Use `propsRef.current` to access the latest `dataOptions` inside `useEffect`, but read `data.rows` directly from the effect closure — it's already the current result when the effect runs.

---

## The three event handlers

> **Cell values:** Both hooks return cells with `data` (raw value) and `text` (formatted string, optional). `text` can be `null` at runtime even though the TypeScript type says `string | undefined`. When building `DataPointEntry.displayValue`, use:
>
> ```ts
> displayValue: cell.text ?? undefined;
> //                         ^^^^^^^^^^ coerces null → undefined
> ```

---

```ts
// Single click — applies a cross-filter (member filter) immediately
onDataPointClick?: (dataPoint: DataPoint, nativeEvent: MouseEvent) => void

// Right-click — opens a cross-filtering context menu (Select / Unselect this value)
// Drill-down is NOT supported in widget plugins.
onDataPointContextMenu?: (dataPoint: DataPoint, nativeEvent: MouseEvent) => void

// Shift-click — multi-selection; opens a cross-filtering context menu with all selected values
onDataPointsSelected?: (dataPoints: DataPoint[], nativeEvent: MouseEvent) => void
```

All are optional. Always call with `?.` — they are `undefined` outside the Fusion editor.

---

## Data point shape

```ts
// Define in src/components/Visualization.tsx
// Keys must match your dataPanel input names exactly — they are the names in
// dataPanel.config.inputs[].name inside src/index.tsx.
interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    // Use YOUR actual input names here, not generic 'category'/'value'.
    // Examples:
    //   1D chart (bar, line, pie):              { category, value }
    //   2D chart (scatter, heatmap, density):   { x, y, value }
    //   Geo map:                                { lat, lon, size }
    //   Multi-series with breakBy:              { category, breakBy, value }
    //   Hierarchy (treemap, sunburst):          { path, value }
    category: DataPointEntry[]; // input name 'category'
    value: DataPointEntry[]; // input name 'value'
  };
}

interface DataPointEntry {
  dataOption: StyledColumn | StyledMeasureColumn; // the column object from dataOptions
  value: string | number; // raw cell value
  displayValue?: string; // formatted display string
  attribute?: Attribute; // REQUIRED on dimension entries — enables cross-filtering
  measure?: Measure; // identifies the measure column for this entry
}
```

> Missing `attribute` on a dimension entry: `onDataPointClick` fires but the SDK silently skips filter creation. Nothing happens in other widgets.

**Empty entry arrays are valid.** If a data point key has zero elements (`source: []`), the SDK produces no filter for that dimension. Including the key with an empty array is identical to omitting it — no cross-filter is applied for that input. This matters for asymmetric nodes (e.g., a target-only node that has no `source` value):

```ts
// Both are equivalent — no filter is created for 'source'
entries: { source: [], target: [{ ... }] }
entries: { target: [{ ... }] }
```

---

## Cross-filtering across data models

Cross-filtering works by broadcasting a member filter on the clicked column. **If another widget's data model does not include that column, the filter has no effect on it** — the widget shows all its data unaffected, neither dimmed nor restricted.

This is expected behavior. There is no error; the filter is silently ignored by widgets that have no matching column. Practical consequence: if your node diagram filters on `target = "Node X"` and another widget's dataset has no `target` column, that widget stays fully opaque. This is not a bug — it's the dashboard's per-column filter-routing behavior.

---

## `buildDataPoint` factory pattern

`useExecuteQuery` gives you raw `Attribute`/`Measure` references — use them to build each `DataPointEntry`.

```tsx
import type { Attribute, Measure } from '@sisense/sdk-data';
import type {
  AbstractDataPointWithEntries,
  DataPointEntry,
} from '@sisense/sdk-ui';
import { extractDimensionsAndMeasures, useExecuteQuery } from '@sisense/sdk-ui';
import { useState } from 'react';

interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: { category: DataPointEntry[]; value: DataPointEntry[] };
}

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  const { dimensions, measures } = extractDimensionsAndMeasures(
    props.dataOptions
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: props.dataSource,
    dimensions,
    measures,
    filters: props.filters,
    highlights: props.highlights, // required for responding to other widgets
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  if (isLoading || isError || !data || data.rows.length === 0) return null;

  // dimensions.length is the correct measure offset — it counts all assigned dimension columns
  // across all dimension inputs (category + breakBy + any others). Using category.length alone
  // breaks silently when breakBy or other dimension inputs have columns assigned.
  const buildDataPoint = (rowIndex: number): MyDataPoint => ({
    entries: {
      category: props.dataOptions.category.map((col, i) => ({
        dataOption: col,
        value: data.rows[rowIndex][i].data as string,
        displayValue: data.rows[rowIndex][i].text ?? undefined,
        attribute: col.column as Attribute, // unwrap — required for cross-filtering
      })),
      value: props.dataOptions.value.map((col, i) => ({
        dataOption: col,
        value: data.rows[rowIndex][dimensions.length + i].data as number,
        displayValue:
          data.rows[rowIndex][dimensions.length + i].text ?? undefined,
        measure: col.column as Measure, // unwrap StyledMeasureColumn → Measure
      })),
    },
  });

  return (
    <div>
      {data.rows.map((row, i) => (
        <div
          key={i}
          style={{
            cursor: 'pointer',
            opacity: selectedIndex !== null && selectedIndex !== i ? 0.4 : 1,
          }}
          onClick={(e) => {
            setSelectedIndex(i);
            props.onDataPointClick?.(buildDataPoint(i), e.nativeEvent); // pass nativeEvent
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            props.onDataPointContextMenu?.(buildDataPoint(i), e.nativeEvent);
          }}
        >
          {row[0]?.text ?? String(row[0]?.data)}
        </div>
      ))}
    </div>
  );
};
```

---

## Multi-selection (shift-click)

```tsx
const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

const handleClick = (rowIndex: number, e: React.MouseEvent) => {
  if (e.shiftKey) {
    const updated = [...selectedIndices, rowIndex];
    setSelectedIndices(updated);
    props.onDataPointsSelected?.(
      updated.map((i) => buildDataPoint(i)),
      e.nativeEvent
    );
  } else {
    setSelectedIndices([rowIndex]);
    props.onDataPointClick?.(buildDataPoint(rowIndex), e.nativeEvent);
  }
};
```

---

## `buildDataPoint` with multiple dimension inputs

When your widget has more than one dimension input (e.g. `x` + `y` for a scatter/density/heatmap chart), each dimension's columns occupy sequential positions in `data.rows`. The column layout is:

```
row[0]                   → first dimension input (all its columns)
row[x.length]            → second dimension input (all its columns)
row[dimensions.length]   → first measure input   (safe offset — always use this)
row[dimensions.length+1] → second measure input
```

```tsx
// Example: scatter / density chart with inputs { x, y, value }
interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    x: DataPointEntry[];
    y: DataPointEntry[];
    value: DataPointEntry[];
  };
}

const buildDataPoint = (rowIndex: number): MyDataPoint => {
  const row = data.rows[rowIndex];
  return {
    entries: {
      x: dataOptions.x.map((col, i) => ({
        dataOption: col,
        value: row[i].data as string,
        displayValue: row[i].text ?? undefined,
        attribute: col.column as Attribute,
      })),
      y: dataOptions.y.map((col, i) => ({
        dataOption: col,
        // y columns follow x columns — offset by x.length
        value: row[dataOptions.x.length + i].data as string,
        displayValue: row[dataOptions.x.length + i].text ?? undefined,
        attribute: col.column as Attribute,
      })),
      value: dataOptions.value.map((col, i) => ({
        dataOption: col,
        // dimensions.length is the safe measure offset — accounts for x + y together
        value: row[dimensions.length + i].data as number,
        displayValue: row[dimensions.length + i].text ?? undefined,
        measure: col.column as Measure,
      })),
    },
  };
};
```

The general rule: **each dimension input's columns appear in the same order as the inputs array in `dataPanel.config.inputs`**. Add up the lengths of all preceding dimension inputs to find the starting index for each one.

---

## Checklist

- [ ] Use `useExecuteQuery` — you need raw `Attribute`/`Measure` refs
- [ ] Pass `highlights: props.highlights` to `useExecuteQuery`
- [ ] Set `attribute` on every dimension `DataPointEntry`
- [ ] Include ALL dimension inputs as keys in `entries` — use your actual input names from `dataPanel.config.inputs` (not generic `category`/`value`); the SDK cross-filters on every dimension key
- [ ] Pass `e.nativeEvent` (not the React `SyntheticEvent`) to handlers
- [ ] Call handlers with `?.` — they are optional props
- [ ] Guard query with `enabled: dimensions.length > 0` — if no dimensions are assigned, handlers are `undefined`
