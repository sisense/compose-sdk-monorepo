# Data Fetching

## The pattern

A widget plugin fetches data with three pieces working together:

1. `extractDimensionsAndMeasures(props.dataOptions)` — converts your typed `dataOptions` into raw `Attribute[]` / `Measure[]` arrays.
2. `useExecuteQuery({ dataSource, dimensions, measures, filters, highlights })` — runs the server query.
3. `formatDataSet(rawData, props.dataOptions)` — applies any `numberFormatConfig` / date formatting declared on your measure or dimension columns. This populates `cell.text` for display.

```tsx
import {
  type CustomVisualization,
  extractDimensionsAndMeasures,
  formatDataSet,
  useExecuteQuery,
} from '@sisense/sdk-ui';
import { useMemo } from 'react';

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  const { dataSource, dataOptions, filters, highlights } = props;

  const { dimensions, measures } = useMemo(
    () => extractDimensionsAndMeasures(dataOptions),
    [dataOptions]
  );

  const {
    data: rawData,
    isLoading,
    isError,
  } = useExecuteQuery({
    dataSource,
    dimensions,
    measures,
    filters, // dashboard filters in "Slice" mode — restricts rows returned
    highlights, // dashboard filters in "Highlight" mode OR cross-widget clicks — dims rows
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  // Apply number/date formatting declared on the measure/dimension columns.
  // Without this step `cell.text` will be missing — values render unformatted.
  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, dataOptions) : rawData),
    [rawData, dataOptions]
  );

  if (isLoading) return <div>Loading…</div>;
  if (isError || !data || data.rows.length === 0) return <div>No data</div>;

  return (
    <table>
      <thead>
        <tr>
          {data.columns.map((c) => (
            <th key={c.name}>{c.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell.text ?? String(cell.data ?? '')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

> **Always pass both `filters` and `highlights`** — even if you haven't wired up click-based cross-filtering.
>
> Each dashboard filter can be configured in "Slice" (restrict data) or "Highlight" (dim non-matches) mode. The SDK routes them into the correct prop automatically — your widget sees `filters` for slice-mode filters and `highlights` for highlight-mode filters. If you omit `highlights`, highlight-mode dashboard filters are silently ignored and nothing is dimmed.

### Conditional execution

Guard the query with `enabled` so it does not fire until required inputs are filled.

```tsx
const { dimensions, measures } = useMemo(
  () => extractDimensionsAndMeasures(dataOptions),
  [dataOptions]
);

const { data: rawData } = useExecuteQuery({
  dataSource,
  dimensions,
  measures,
  filters,
  highlights,
  enabled: dimensions.length > 0 && measures.length > 0,
});
```

---

## Applying formatting with `formatDataSet`

`formatDataSet(data, dataOptions, options?)` reads `numberFormatConfig` from each `StyledMeasureColumn` (and date format from `StyledColumn` date inputs) and writes a formatted `text` string into every affected cell. It returns a **new** dataset — the input is not mutated. Cells whose column has no formatter are passed through unchanged.

```tsx
import { formatDataSet } from '@sisense/sdk-ui';

const data = useMemo(
  () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
  [rawData, props.dataOptions]
);

// data.rows[i][j].text is now the formatted string when a formatter applies
const display = cell.text ?? String(cell.data ?? '');
```

`formatDataSet` iterates over whatever keys are present in `dataOptions` — renaming inputs in `types.ts` and `index.tsx` does not require any change to the `formatDataSet` call.

```ts

```

For one-off formatting outside the dataset flow, use the single-value helpers:

```ts
import {
  formatNumber,
  formatDate,
  getDefaultDateFormat,
} from '@sisense/sdk-ui';

formatNumber(1234.56, {
  name: 'Numbers',
  decimalScale: 1,
  thousandSeparator: true,
}); // "1,234.6"
formatDate(new Date(), 'yyyy-MM-dd');
getDefaultDateFormat('Months'); // default format string for a date granularity level
```

---

## Reading theme values with `useTheme`

`useTheme()` returns the resolved Sisense theme (`CompleteThemeSettings`) — useful for picking default colors that follow the host dashboard's theme.

```tsx
import { useTheme } from '@sisense/sdk-ui';

const { chart, palette, typography } = useTheme();

const headerBackground =
  props.styleOptions?.headerBackgroundColor ?? chart.secondaryTextColor;
const headerText = props.styleOptions?.headerTextColor ?? chart.textColor;
```

When no `<ThemeProvider>` is in the tree (e.g., the standalone dev preview), `useTheme` returns the default theme — your component always sees a fully populated object.

---

## Query result shape

```ts
interface QueryResultData {
  columns: { name: string; type: string }[]; // metadata
  rows: Cell[][];
}

interface Cell {
  data: string | number | null; // raw value
  text?: string; // formatted string (populated by formatDataSet; may be null at runtime)
  blur?: boolean; // cross-filter highlight state — see "Rendering highlights" below
}
```

**Displaying a value:**

```ts
const display = cell.text ?? String(cell.data ?? '');
```

---

## How `highlights` affects your query

Passing `highlights` to `useExecuteQuery` causes the SDK to **re-fetch from the server** when highlights change — it is not a client-side filter applied to cached data. The server returns all rows again with `cell.blur` set appropriately.

Practical implications:

- Any derived state that does not depend on `blur` (e.g., graph topology, node positions, edge lists, layout coordinates) should be **memoized separately** so it is not recalculated on every highlight change.
- Use `useMemo` with stable dependencies that exclude `data` or include only the parts of `data` that actually change the topology.

```tsx
// Positions depend only on the node identity (category values), not on blur
const nodePositions = useMemo(
  () => computeLayout(data?.rows ?? []),
  [
    // Stringify the category column only — highlights change data object ref but not categories
    data?.rows.map((row) => String(row[0].data)).join(','),
  ]
);

// Blur-based opacity reads directly from data.rows — no memo needed
const rowOpacity = (row: (typeof data.rows)[0]) =>
  data.rows.some((r) => r[0].blur !== undefined) && row[0].blur === true
    ? 0.25
    : 1;
```

---

## Rendering cross-filter highlights (`cell.blur`)

When another widget on the dashboard is clicked, it broadcasts a highlight filter. Your query returns all rows but marks each cell with a `blur` flag:

| `cell.blur` | Meaning                                 | Visual treatment             |
| ----------- | --------------------------------------- | ---------------------------- |
| `true`      | Row does NOT match the active highlight | Dim — use ~0.25 opacity      |
| `false`     | Row DOES match the active highlight     | Full opacity                 |
| `undefined` | No highlights active                    | Full opacity (neutral state) |

**You are responsible for rendering `blur` in your component.** Built-in SDK charts handle this automatically; custom visualizations must do it manually.

> Reading `row[0].blur` is sufficient — all cells in the same row have the same `blur` value.

```tsx
// Determine if any highlights are active (at least one cell has a defined blur)
const hasHighlights = data.rows.some((row) => row[0].blur !== undefined);

// Opacity helper — call per rendered row/bar/point
const rowOpacity = (row: QueryResultData['rows'][0]) =>
  hasHighlights && row[0].blur === true ? 0.25 : 1;
```

**React DOM example** (div-based visualization):

```tsx
{
  data.rows.map((row, i) => {
    const label = row[0].text ?? String(row[0].data);
    const value = Number(row[dimensions.length].data ?? 0);
    return (
      <div
        key={i}
        style={{ opacity: rowOpacity(row), transition: 'opacity 0.2s' }}
        onClick={(e) =>
          props.onDataPointClick?.(buildDataPoint(i), e.nativeEvent)
        }
      >
        {label}: {value}
      </div>
    );
  });
}
```

**Plotly example** — pass per-point opacity as a trace array:

```tsx
// In your Plotly.newPlot() trace:
const hasHighlights = data.rows.some((row) => row[0].blur !== undefined);
const opacities = data.rows.map((row) =>
  hasHighlights && row[0].blur === true ? 0.25 : 1
);

const trace: Plotly.Data = {
  // type: 'scatter',  // set your chart type here
  // x: ..., y: ...,  // populate from data.rows for your chart type
  marker: { opacity: opacities }, // applies blur-based dimming per point
};
```

For heatmaps and other 2D chart types, `blur` is row-level — dim the entire row of cells when `row[0].blur === true`.

---

## Column order rule

**Columns are always ordered `[...dimensions, ...measures]`** regardless of the key order in `dataOptions`.

```
row[0]       → first dimension input
row[1]       → second dimension input  (if present)
row[D]       → first measure input     (D = total assigned dimension columns across all inputs)
row[D + 1]   → second measure input    (if present)
```

`D` is the total count of _assigned_ dimension columns across **all** dimension inputs — not just `category`. If `breakBy` has 2 items assigned, `D = category.length + breakBy.length`.

**Always use `dimensions.length` from `extractDimensionsAndMeasures` as the measure offset** — it accounts for all dimension inputs regardless of which are empty:

```ts
import { extractDimensionsAndMeasures } from '@sisense/sdk-ui';

const { dimensions, measures } = extractDimensionsAndMeasures(props.dataOptions);

// ✅ Correct — accounts for all assigned dimension inputs (category + breakBy + any others)
const value = row[dimensions.length + measureIndex].data;

// ❌ Fragile — breaks silently when breakBy or other dimension inputs have columns assigned
const value = row[props.dataOptions.category.length + measureIndex].data;
```

Concrete example with `{ category: dim, breakBy: dim, value: measure }`:

```ts
const { dimensions } = extractDimensionsAndMeasures(props.dataOptions);

const category = row[0].text ?? String(row[0].data); // dim 0 — always first
const breakBy = row[1].text ?? String(row[1].data); // dim 1 — only valid if breakBy is non-empty
const value = row[dimensions.length].data as number; // measure 0 — safe regardless of breakBy state
```

---

## Multi-series pivot (breakBy → chart series)

When your data panel has a `breakBy` dimension input, the query returns one row per `(category, breakBy)` combination. Most chart libraries expect data pivoted into one object per category with each series as a key.

**Raw query output** (`category` + `breakBy` + `value`):

```
["Jan", "East", 120]
["Jan", "West",  90]
["Feb", "East", 140]
["Feb", "West",  60]
```

**Pivoted form that charting libraries expect:**

```ts
[
  { x: 'Jan', East: 120, West: 90 },
  { x: 'Feb', East: 140, West: 60 },
];
// seriesNames: ["East", "West"]  ← used to render one <Line> / <Series> per entry
```

**Pivot helper:**

```ts
import type { QueryResultData } from '@sisense/sdk-data';
// not sdk-ui — only exported from sdk-data
import { extractDimensionsAndMeasures } from '@sisense/sdk-ui';

interface PivotResult {
  chartData: Record<string, unknown>[];
  seriesNames: string[];
}

function pivotToSeries(
  rows: QueryResultData['rows'],
  dimCount: number, // pass dimensions.length from extractDimensionsAndMeasures
  hasBreakBy: boolean
): PivotResult {
  if (!hasBreakBy) {
    // No breakBy — each row is its own data point, value at row[dimCount]
    return {
      chartData: rows.map((row) => ({
        x: row[0].text ?? String(row[0].data),
        value: Number(row[dimCount].data ?? 0),
      })),
      seriesNames: ['value'],
    };
  }

  // breakBy populated — pivot (category, seriesKey) pairs into one object per category
  const pivot = new Map<string, Record<string, unknown>>();
  const seriesSet = new Set<string>();

  for (const row of rows) {
    const x = row[0].text ?? String(row[0].data); // category (dim 0)
    const series = row[1].text ?? String(row[1].data); // breakBy  (dim 1)
    const val = Number(row[dimCount].data ?? 0); // measure

    seriesSet.add(series);
    if (!pivot.has(x)) pivot.set(x, { x });
    pivot.get(x)![series] = val;
  }

  return { chartData: [...pivot.values()], seriesNames: [...seriesSet] };
}
```

**Usage inside a Visualization component:**

```ts
const { dimensions } = extractDimensionsAndMeasures(props.dataOptions);
const hasBreakBy = (props.dataOptions.breakBy?.length ?? 0) > 0;

// after data loads:
const { chartData, seriesNames } = pivotToSeries(
  data.rows,
  dimensions.length,
  hasBreakBy
);

// chartData: [{ x: "Jan", East: 120, West: 90 }, ...]
// seriesNames: ["East", "West"]
// Pass chartData to your chart library and iterate seriesNames to create one series per entry.
```

---

## Hierarchical data (circle packing, treemap, sunburst, icicle)

Hierarchy charts (D3 `pack`, `treemap`, `partition`, etc.) require a nested object tree. The query returns flat rows — fold them into a hierarchy by treating each dimension as a level in the path.

**Data panel setup** — use a single `path` dimension input with unlimited `maxItems`:

```ts
// src/types.ts
export type DataOptions = {
  path: StyledColumn[]; // e.g. [Country, Region, City]
  value: StyledMeasureColumn[];
};
```

```tsx
// src/index.tsx inputs
{ name: 'path', displayName: 'Path', type: 'dimension' },  // no maxItems → unlimited
{ name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
```

**Flat rows → hierarchy:**

```ts
import type { QueryResultData } from '@sisense/sdk-data';

// QueryResultData is only exported from sdk-data, not sdk-ui.
// @sisense/sdk-data is already in the scaffold's devDependencies — no extra install needed.

interface HierarchyNode {
  name: string;
  value?: number;
  children?: HierarchyNode[];
}

function buildHierarchy(
  rows: QueryResultData['rows'],
  dimCount: number // dimensions.length from extractDimensionsAndMeasures
): HierarchyNode {
  const root: HierarchyNode = { name: 'root', children: [] };

  for (const row of rows) {
    // Dimension columns [0..dimCount-1] are the path levels; last column [dimCount] is the value
    const pathLabels = Array.from(
      { length: dimCount },
      (_, i) => row[i].text ?? String(row[i].data)
    );
    const value = Number(row[dimCount].data ?? 0);

    let current = root;
    for (const label of pathLabels) {
      let child = current.children?.find((c) => c.name === label);
      if (!child) {
        child = { name: label }; // no children yet — added only when a deeper path goes through this node
        current.children ??= [];
        current.children.push(child);
      }
      current = child;
    }
    current.value = (current.value ?? 0) + value;
  }

  return root;
}
```

**Using it with D3 hierarchy:**

```ts
import { extractDimensionsAndMeasures } from '@sisense/sdk-ui';
import * as d3 from 'd3';

const { dimensions } = extractDimensionsAndMeasures(props.dataOptions);
const tree = buildHierarchy(data.rows, dimensions.length);

const root = d3
  .hierarchy(tree)
  .sum((d) => d.value ?? 0)
  .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

// Pass `root` to d3.pack(), d3.treemap(), d3.partition(), etc.
```

**Important:** Column order is always `[...dimensions, ...measures]`. With a single `path` input that has 3 items assigned, `dimensions.length === 3` and `row[3]` is the measure — use `dimensions.length` as the measure offset, not a hardcoded index.
