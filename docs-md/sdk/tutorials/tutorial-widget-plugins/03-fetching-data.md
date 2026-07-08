---
title: 3 | Fetching Data
---

# Fetching Data

Your visualization component receives `dataOptions` (column definitions) and `filters`, but not the actual query results. Use [`useExecuteQuery`](../../modules/sdk-ui/queries/function.useExecuteQuery.md) together with [`extractDimensionsAndMeasures`](../../modules/sdk-ui/dashboards/function.extractDimensionsAndMeasures.md) to fetch data, and [`formatDataSet`](../../modules/sdk-ui/formatting/function.formatDataSet.md) to apply any number/date formatting declared on the columns.

> An [`<ExecuteQuery>`](../../modules/sdk-ui/queries/function.ExecuteQuery.md) render-prop component is also available for the same purpose. Most plugins use the hook.

## The pattern

Three pieces working together:

1. `extractDimensionsAndMeasures(props.dataOptions)` — converts your typed `dataOptions` into raw `Attribute[]` / `Measure[]` arrays.
2. `useExecuteQuery({ dataSource, dimensions, measures, filters, highlights })` — runs the server query.
3. `formatDataSet(rawData, props.dataOptions)` — applies the `numberFormatConfig` (and date formatting) declared on your measure/dimension columns, populating `cell.text`.

## Basic Example

```tsx
import { useMemo } from 'react';
import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';
import {
  extractDimensionsAndMeasures,
  formatDataSet,
  useExecuteQuery,
} from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  const { dimensions, measures } = useMemo(
    () => extractDimensionsAndMeasures(props.dataOptions),
    [props.dataOptions],
  );

  const { data: rawData, isLoading, isError } = useExecuteQuery({
    dataSource: props.dataSource,
    dimensions,
    measures,
    filters: props.filters,
    highlights: props.highlights,
    enabled: dimensions.length > 0,
  });

  // formatDataSet reads numberFormatConfig (and date formats) from props.dataOptions
  // and writes the formatted string into each affected cell's `text` field.
  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions],
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>No data available.</div>;

  return (
    <table>
      <thead>
        <tr>
          {data.columns.map((col) => (
            <th key={col.name}>{col.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell.text ?? String(cell.data)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

## Query Result Structure

The `data` object conforms to [`QueryResultData`](../../modules/sdk-data/interfaces/interface.QueryResultData.md):

- **`columns`** — Array of column metadata (`name` and `type`). Column order is always `[...dimensions, ...measures]`.
- **`rows`** — Array of row arrays. Each cell has:
  - `data` — raw value
  - `text` — formatted string (`string | null | undefined`), populated by [`formatDataSet`](../../modules/sdk-ui/formatting/function.formatDataSet.md) when number/date formatting is declared in `dataOptions`
  - `blur` — set when another widget is cross-filtering (see "Rendering Cross-Filter Highlights" below)

Use `cell.text ?? String(cell.data)` for display — `text` is present when a formatter is declared, otherwise fall back to `data`.

## Column Ordering

Results always order columns as `[...dimensions, ...measures]`, regardless of the order keys appear in your `dataOptions`. For a plugin with `category` (dimension) and `value` (measure):

| Index | Column   |
| ----- | -------- |
| `0`   | category |
| `1`   | value    |

This ordering matters when building event handler data points in [Event Handling](./06-event-handling.md). Always use `dimensions.length + i` from `extractDimensionsAndMeasures` as the measure offset — using `dataOptions.category.length + i` breaks silently when other dimension inputs (e.g. `breakBy`) have columns assigned.

## Theming

[`useTheme()`](../../modules/sdk-ui/contexts/function.useTheme.md) returns the resolved Sisense theme (`CompleteThemeSettings`). Use it to pick default colors that follow the host dashboard's theme. When no `<ThemeProvider>` is present, the default theme is returned — your component always sees a fully populated object.

```tsx
import { useTheme } from '@sisense/sdk-ui';

const { chart, palette, typography } = useTheme();

const headerBackground = props.styleOptions?.headerBackgroundColor ?? chart.secondaryTextColor;
const headerText = props.styleOptions?.headerTextColor ?? chart.textColor;
```

## Conditional Queries

> **AI agent tip:** Tell your AI agent "add a conditional query guard with an empty-state prompt" — it adds the `enabled` check and a "Drop a dimension here to start" UI, ensuring the guard renders before the loading check.

Use the `enabled` parameter to skip the query when required inputs are missing:

```tsx
const { data: rawData, isLoading } = useExecuteQuery({
  dataSource: props.dataSource,
  dimensions,
  measures,
  filters: props.filters,
  highlights: props.highlights,
  enabled: dimensions.length > 0,
});
```

> **Always pass both `filters` and `highlights`.** Each dashboard filter can be configured in "Slice" (restrict data) or "Highlight" (dim non-matches) mode. The SDK routes them into the correct prop automatically — your widget sees `filters` for slice-mode filters and `highlights` for highlight-mode filters. If you omit `highlights`, highlight-mode dashboard filters are silently ignored.

## Rendering Cross-Filter Highlights (`cell.blur`)

When another widget on the dashboard is clicked, it broadcasts a highlight filter. Your query returns all rows but marks each cell with a `blur` flag. **You are responsible for rendering `blur` in your component** — built-in SDK charts handle this automatically; custom visualizations must do it manually.

| `cell.blur` | Meaning                                 | Visual treatment             |
| ----------- | --------------------------------------- | ---------------------------- |
| `true`      | Row does NOT match the active highlight | Dim — use ~0.25 opacity      |
| `false`     | Row DOES match the active highlight     | Full opacity                 |
| `undefined` | No highlights active                    | Full opacity (neutral state) |

> Reading `row[0].blur` is sufficient — all cells in the same row have the same `blur` value.

```tsx
// Determine if any highlights are active (at least one cell has a defined blur)
const hasHighlights = data.rows.some((row) => row[0].blur !== undefined);

// Opacity helper — call per rendered row/bar/point
const rowOpacity = (row: QueryResultData['rows'][0]) =>
  hasHighlights && row[0].blur === true ? 0.25 : 1;

// In your JSX:
{
  data.rows.map((row, i) => (
    <div
      key={i}
      style={{ opacity: rowOpacity(row), transition: 'opacity 0.2s' }}
      onClick={(e) => props.onDataPointClick?.(buildDataPoint(i), e.nativeEvent)}
    >
      {row[0].text ?? String(row[0].data)}
    </div>
  ));
}
```

For **Plotly**, pass `blur`-based opacity as a per-point array in the trace's `marker.opacity` (see [Visualization](./02-visualization.md#plotly-and-other-imperative-event-apis)). For **D3**, apply opacity to each SVG element. For **Recharts**, use the `opacity` style on each rendered element.

### Memoizing expensive derived state under highlights

Passing `highlights` to `useExecuteQuery` causes the SDK to **re-fetch from the server** when highlights change — it is not a client-side filter. The server returns all rows with `cell.blur` set appropriately. If you have expensive derived state that does not depend on `blur` (e.g., graph topology, node positions, layout coordinates), memoize it separately so it is not recalculated on every highlight change:

```tsx
// Positions depend only on the node identity (category values), not on blur.
// Stringify the category column only — highlights change the data object ref but not categories.
const nodePositions = useMemo(
  () => computeLayout(data?.rows ?? []),
  [data?.rows.map((row) => String(row[0].data)).join(',')],
);
```

## Complete Plugin with Data Fetching

A plugin that queries data and renders a styled table:

```tsx
import { useMemo } from 'react';
import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';
import {
  extractDimensionsAndMeasures,
  formatDataSet,
  useExecuteQuery,
  useTheme,
} from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  const { chart } = useTheme();
  const { dimensions, measures } = useMemo(
    () => extractDimensionsAndMeasures(props.dataOptions),
    [props.dataOptions],
  );
  const { data: rawData, isLoading, isError } = useExecuteQuery({
    dataSource: props.dataSource,
    dimensions,
    measures,
    filters: props.filters,
    highlights: props.highlights,
    enabled: dimensions.length > 0,
  });
  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions],
  );

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (isError || !data || data.rows.length === 0) {
    return <div style={{ padding: 16 }}>No data available.</div>;
  }

  const headerBg = props.styleOptions?.headerBackgroundColor ?? chart.secondaryTextColor;
  const headerColor = props.styleOptions?.headerTextColor ?? chart.textColor;

  return (
    <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            {data.columns.map((col) => (
              <th
                key={col.name}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  backgroundColor: headerBg,
                  color: headerColor,
                  borderBottom: '2px solid #ddd',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '6px 12px', borderBottom: '1px solid #eee' }}>
                  {cell.text ?? String(cell.data)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

**Next lesson:** [Data Panel Configuration](./04-data-panel.md)
