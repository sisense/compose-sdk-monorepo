Add full cross-filtering support to the Visualization component — both directions:

- **Outgoing:** User clicks your widget → SDK broadcasts a highlight filter → other widgets dim their non-matching rows.
- **Incoming:** Another widget is clicked → your query receives `highlights` → server marks `cell.blur = true` on non-matching rows → you dim them visually.

Both directions are implemented below. If the user's prompt only asks for one direction, implement both anyway — half-implemented cross-filtering is confusing to dashboard users.

`filters` vs `highlights` — they behave differently at the query level:

| Prop         | Source                                                          | Effect                                                       |
| ------------ | --------------------------------------------------------------- | ------------------------------------------------------------ |
| `filters`    | Dashboard filters in "Slice" mode                               | Restricts data — only matching rows returned                 |
| `highlights` | Dashboard filters in "Highlight" mode **or** cross-widget click | All rows returned; non-matching rows have `cell.blur = true` |

The SDK routes dashboard filters into the correct prop automatically — your widget doesn't need to detect or handle the mode.

**Always pass both `filters` and `highlights` to `useExecuteQuery`** — omitting `highlights` means highlight-mode dashboard filters are silently ignored and `cell.blur` is never set.

---

## Step 1 — Wire up data fetching and blur handling

```tsx
import type { DataOptions, StyleOptions } from '../types.js';
import type { Attribute, Measure } from '@sisense/sdk-data';
import type {
  AbstractDataPointWithEntries,
  CustomVisualization,
  CustomVisualizationProps,
  DataPointEntry,
} from '@sisense/sdk-ui';
import { extractDimensionsAndMeasures, useExecuteQuery } from '@sisense/sdk-ui';
import { useState } from 'react';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  const {
    dataSource,
    dataOptions,
    filters,
    highlights,
    styleOptions,
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
  } = props;

  const { dimensions, measures } = extractDimensionsAndMeasures(dataOptions);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data, isLoading, isError } = useExecuteQuery({
    dataSource,
    dimensions,
    measures,
    filters, // dashboard-level filters — restrict data returned
    highlights, // cross-widget selection — dims non-matching rows via cell.blur
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (isError || !data || data.rows.length === 0) {
    return <div style={{ padding: 16 }}>No data available.</div>;
  }

  // Incoming cross-filter: server marks non-matching rows with cell.blur = true.
  // When any blur is defined, highlights are active — dim the blurred rows.
  const hasHighlights = data.rows.some((row) => row[0].blur !== undefined);
  const rowOpacity = (row: (typeof data.rows)[0]) =>
    hasHighlights && row[0].blur === true ? 0.25 : 1;

  // ... continue in Step 2
};
```

---

## Step 2 — Build typed data points for outgoing cross-filtering

**`entries` keys must exactly match your `dataPanel.config.inputs[].name` values** in `src/index.tsx`.

```tsx
// Define the data point shape. Keys must match your dataPanel input names.
// Example below uses 'category' and 'value' — rename to match your actual inputs.
//
// Examples by chart type:
//   Scatter / density    → { x, y, value }
//   Geo map              → { lat, lon, size }
//   Multi-series         → { category, breakBy, value }
//   Hierarchy / treemap  → { path, value }
interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    category: DataPointEntry[]; // rename to match your dimension input name(s)
    value: DataPointEntry[]; // rename to match your measure input name(s)
  };
}

// Column order in data.rows is always [...dimensions, ...measures].
// Use dimensions.length (from extractDimensionsAndMeasures) as the measure offset —
// it accounts for all assigned dimension inputs (category + breakBy + any others).
// Using category.length alone breaks silently when breakBy or other dimension inputs are assigned.
const buildDataPoint = (rowIndex: number): MyDataPoint => ({
  entries: {
    // For each dimension input, map its columns using their position in the row.
    // If you have multiple dimension inputs (e.g. x and y), add separate entries blocks:
    //   x:    dataOptions.x.map((col, i) => ({ ..., attribute: col.column as Attribute }))
    //   y:    dataOptions.y.map((col, i) => ({ ..., attribute: col.column as Attribute }))
    category: dataOptions.category.map((col, i) => ({
      dataOption: col,
      value: data.rows[rowIndex][i].data as string,
      displayValue: data.rows[rowIndex][i].text ?? undefined,
      attribute: col.column as Attribute, // required — enables cross-filtering
    })),
    // For each measure input, offset by dimensions.length + measure index.
    value: dataOptions.value.map((col, i) => ({
      dataOption: col,
      value: data.rows[rowIndex][dimensions.length + i].data as number,
      displayValue:
        data.rows[rowIndex][dimensions.length + i].text ?? undefined,
      measure: col.column as Measure,
    })),
  },
});
```

### Two dimension inputs (e.g. scatter / density chart with `x` + `y` + `value`)

When you have two dimension inputs, the second dimension's columns follow directly after the first in the row. Use `dimensions.length` as the safe measure offset regardless of how many dimension inputs exist:

```tsx
interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    x: DataPointEntry[];
    y: DataPointEntry[];
    value: DataPointEntry[];
  };
}

// x is at row index 0...(x.length - 1)
// y is at row index x.length...(x.length + y.length - 1)
// value is at row index dimensions.length + 0, dimensions.length + 1, ...
const buildDataPoint = (rowIndex: number): MyDataPoint => ({
  entries: {
    x: dataOptions.x.map((col, i) => ({
      dataOption: col,
      value: data.rows[rowIndex][i].data as string,
      displayValue: data.rows[rowIndex][i].text ?? undefined,
      attribute: col.column as Attribute,
    })),
    y: dataOptions.y.map((col, i) => ({
      dataOption: col,
      value: data.rows[rowIndex][dataOptions.x.length + i].data as string,
      displayValue:
        data.rows[rowIndex][dataOptions.x.length + i].text ?? undefined,
      attribute: col.column as Attribute,
    })),
    value: dataOptions.value.map((col, i) => ({
      dataOption: col,
      value: data.rows[rowIndex][dimensions.length + i].data as number,
      displayValue:
        data.rows[rowIndex][dimensions.length + i].text ?? undefined,
      measure: col.column as Measure,
    })),
  },
});
```

---

## Step 3 — Wire click handlers in your rendered elements

Apply `rowOpacity` and call handlers from whatever element represents a clickable data point in your visualization. This works regardless of rendering approach (DOM, canvas library, SVG, etc.):

```tsx
// React DOM example — adapt the element type and click surface to your visualization:
{
  data.rows.map((row, i) => (
    <div
      key={i}
      style={{
        opacity: rowOpacity(row), // incoming: dim rows not matching the active highlight
        transition: 'opacity 0.2s',
        cursor: 'pointer',
      }}
      onClick={(e) => {
        setSelectedIndex(i);
        onDataPointClick?.(buildDataPoint(i), e.nativeEvent);
      }}
      onContextMenu={(e) => {
        e.preventDefault(); // suppress browser native context menu
        onDataPointContextMenu?.(buildDataPoint(i), e.nativeEvent);
      }}
    >
      {/* render your visualization element here */}
    </div>
  ));
}
```

For **imperative libraries** (Plotly, D3, Chart.js, canvas-based):

- Pass `blur`-based opacity as a per-point array when rendering (e.g. `marker.opacity` in Plotly, `selection.attr('opacity', ...)` in D3).
- Register click events through the library's own API (e.g. `el.on('plotly_click', ...)`, `selection.on('click', ...)`).
- Use a `propsRef` to keep callbacks fresh without re-registering on every render — see `.claude/docs/visualization.md` for the pattern.

---

## Multi-selection (shift-click)

To support `onDataPointsSelected`, track selected indices in state:

```tsx
const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

const handleClick = (rowIndex: number, event: React.MouseEvent) => {
  if (event.shiftKey) {
    const updated = [...selectedIndices, rowIndex];
    setSelectedIndices(updated);
    onDataPointsSelected?.(
      updated.map((i) => buildDataPoint(i)),
      event.nativeEvent
    );
  } else {
    setSelectedIndices([rowIndex]);
    onDataPointClick?.(buildDataPoint(rowIndex), event.nativeEvent);
  }
};
```

---

## Key rules

**Outgoing (emitting):**

- **Pass `event.nativeEvent`** — The SDK uses the native pointer event to position context menus.
- **`attribute` must be set** on every dimension entry — without it, `onDataPointClick` fires but the SDK cannot build cross-filters (nothing happens in other widgets).
- **`entries` keys must match `dataPanel.config.inputs[].name`** — include all dimension inputs you want to be cross-filterable. If you have `x`, `y`, and `value`, all three must be present in `entries`.
- **`measure` identifies the measure** — include it on measure entries, but it does not enable drill-down (drill-down is not supported in widget plugins).
- **`onDataPointContextMenu` shows a cross-filter menu** (Select / Unselect) — it does NOT trigger drill-down.
- **Handlers require at least one assigned dimension** — if the user has not assigned any dimension in the data panel, all three handlers will be `undefined`. Guard with `enabled: dimensions.length > 0` on your query hook.

**Incoming (receiving):**

- **Always pass both `filters` and `highlights`** to `useExecuteQuery` — omitting `highlights` means `cell.blur` is never set.
- **Read `row[0].blur`** to determine if a row should be dimmed — all cells in a row share the same `blur` value.
- **`cell.blur === true`** → dim the row (~0.25 opacity). **`cell.blur === undefined`** → no highlights active → full opacity.
- **Apply opacity in your rendering layer** — the mechanism differs by library (CSS opacity, SVG attribute, library-specific opacity array).
- **Continuous charts (area, line):** The fill is a single continuous path — you cannot dim individual segments. Practical fallback: apply per-point opacity on the point markers (available on most chart libraries via a per-point marker config), and reduce the overall series fill opacity when `hasHighlights` is true. Neither is a pixel-perfect "blur the non-matching segment", but both give a clear visual signal. Example: `opacity: hasHighlights && row[0].blur ? 0.2 : 1` on individual point marker objects.
