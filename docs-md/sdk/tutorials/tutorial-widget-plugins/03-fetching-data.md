---
title: 3 | Fetching Data
hidden: true
---

# Fetching Data

Your visualization component receives `dataOptions` (column definitions) and `filters`, but not the actual query results. Use the [`useExecuteCustomWidgetQuery`](../../modules/sdk-ui/queries/function.useExecuteCustomWidgetQuery.md) hook to fetch data and apply number formatting in one step.

> An [`<ExecuteQuery>`](../../modules/sdk-ui/queries/function.ExecuteQuery.md) render-prop component is also available for the same purpose. Most plugins use the hook.

## Basic Example

```tsx
import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';
import { useExecuteCustomWidgetQuery } from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  const { data, isLoading, isError } = useExecuteCustomWidgetQuery(props);

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

[`useExecuteCustomWidgetQuery`](../../modules/sdk-ui/queries/function.useExecuteCustomWidgetQuery.md) accepts the full component props directly — no need to extract dimensions and measures manually. It also applies number formatting defined in `dataOptions`, adding a `text` property to each cell with the formatted display value. The hook returns a [`CustomWidgetQueryState`](../../modules/sdk-ui/type-aliases/type-alias.CustomWidgetQueryState.md) object.

## Query Result Structure

The `data` object conforms to [`QueryResultData`](../../modules/sdk-data/interfaces/interface.QueryResultData.md):

- **`columns`** — Array of column metadata (`name` and `type`). Column order is always `[...dimensions, ...measures]`.
- **`rows`** — Array of row arrays. Each cell has:
  - `data` — raw value
  - `text` — formatted string, set by [`useExecuteCustomWidgetQuery`](../../modules/sdk-ui/queries/function.useExecuteCustomWidgetQuery.md) when number formatting is configured in `dataOptions`
  - `displayValue` — unformatted display string from the query server

Use `cell.text ?? String(cell.data)` for display — `text` is present when number formatting is configured, otherwise fall back to `data`.

## Column Ordering

Results always order columns as `[...dimensions, ...measures]`, regardless of the order keys appear in your `dataOptions`. For a plugin with `category` (dimension) and `value` (measure):

| Index | Column   |
| ----- | -------- |
| `0`   | category |
| `1`   | value    |

This ordering matters when building event handler data points in [Event Handling](./06-event-handling.md), where you index into rows using `dataOptions.category.length + i` to reach measure columns.

## Conditional Queries

Use the `enabled` parameter to skip the query when required inputs are missing:

```tsx
const { data, isLoading } = useExecuteCustomWidgetQuery({
  ...props,
  enabled: (props.dataOptions.category?.length ?? 0) > 0,
});
```

## Working with Raw Data

If you need direct access to `Attribute` and `Measure` objects — for example, to build custom query parameters or inspect query structure — use [`extractDimensionsAndMeasures`](../../modules/sdk-ui/dashboards/function.extractDimensionsAndMeasures.md) with [`useExecuteQuery`](../../modules/sdk-ui/queries/function.useExecuteQuery.md) instead:

```tsx
import { extractDimensionsAndMeasures, useExecuteQuery } from '@sisense/sdk-ui';

const { dimensions, measures } = extractDimensionsAndMeasures(props.dataOptions);

const { data } = useExecuteQuery({
  dataSource: props.dataSource,
  dimensions,
  measures,
  filters: props.filters,
  highlights: props.highlights,
  enabled: dimensions.length > 0 && measures.length > 0,
});
```

Note: `useExecuteQuery` does not apply number formatting — cells have `data` and `displayValue` but no `text` property.

## Complete Plugin with Data Fetching

A plugin that queries data and renders a styled table:

```tsx
import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';
import { useExecuteCustomWidgetQuery } from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  const { data, isLoading, isError } = useExecuteCustomWidgetQuery(props);

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (isError || !data || data.rows.length === 0) {
    return <div style={{ padding: 16 }}>No data available.</div>;
  }

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
                  backgroundColor: '#f5f5f5',
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
