---
title: 6 | Event Handling and Cross-Filtering
---

# Event Handling and Cross-Filtering

Widget plugins support three user interaction events. Implementing them connects your widget
to the dashboard ecosystem — enabling cross-filtering and context menus.

## Two Directions of Cross-Filtering

Cross-filtering has **two separate directions** — implement both for a complete integration:

| Direction              | What it means                                          | How to implement                                                                  |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **Outgoing** (emit)    | User clicks your widget → other widgets dim their rows | Call `onDataPointClick` with a correctly structured `DataPoint`                   |
| **Incoming** (receive) | Another widget is clicked → your widget dims its rows  | Pass `highlights` to your query hook, then read `cell.blur` and dim rows visually |

Without outgoing: clicking your widget does nothing to others. Without incoming rendering: your widget stays fully opaque when others cross-filter.

## Event Handler Types

| Handler                  | Trigger         | SDK behavior                                                           |
| ------------------------ | --------------- | ---------------------------------------------------------------------- |
| `onDataPointClick`       | Single click    | Applies a cross-filter (member filter) immediately                     |
| `onDataPointContextMenu` | Right-click     | Opens a cross-filtering context menu (Select / Unselect this value)    |
| `onDataPointsSelected`   | Multi-selection | Opens a cross-filtering context menu with all selected values combined |

All three handlers receive a data point built on
[`AbstractDataPointWithEntries`](../../modules/sdk-ui/type-aliases/type-alias.AbstractDataPointWithEntries.md).
You define the shape to match your data panel configuration.

## How Cross-Filtering Works

Cross-filtering is automatic once your data points are structured correctly:

1. A user clicks a row in your widget.
2. You call `onDataPointClick(dataPoint, event.nativeEvent)`.
3. The SDK reads the `attribute` fields from each entry and creates member filters.
4. Those filters are applied as `highlights` to all other widgets on the dashboard.
5. Other widgets receive the highlight filters via their `highlights` prop and pass them
   to their queries — all rows are returned but non-matching ones are visually dimmed.

**Handler registration prerequisite:** All three handlers are only wired up when your widget
has at least one dimension input assigned by the user. If the data panel is empty (no dimensions
dragged in), all three handlers will be `undefined` and clicks will appear to do nothing — this
is expected behaviour. Guard your query with `enabled: dimensions.length > 0`.

**All non-measure inputs are selectable:** The SDK automatically considers every dimension input
in your `dataOptions` as a cross-filter source. A widget with `category` and `breakBy` dimension
inputs will cross-filter on both simultaneously — make sure your data point's `entries` includes
all dimension keys.

### `filters` vs `highlights`

These two props behave differently at the query level:

| Prop         | Source                                      | Effect on query                                    |
| ------------ | ------------------------------------------- | -------------------------------------------------- |
| `filters`    | Dashboard filter panel and filter widgets   | Restricts data — only matching rows are returned   |
| `highlights` | Cross-widget click / selection interactions | Keeps all rows, marks which ones match for dimming |

Always pass both to `useExecuteQuery`:

```tsx
const { data } = useExecuteQuery({
  dataSource,
  dimensions,
  measures,
  filters, // dashboard-level filters — restrict data
  highlights, // cross-widget selection — dim non-matching rows
});
```

## Data Point Shape

Each data point has an `entries` object whose keys match your data panel input names.
Each entry is a [`DataPointEntry`](../../modules/sdk-ui/type-aliases/type-alias.DataPointEntry.md):

```typescript
interface DataPointEntry {
  dataOption: StyledColumn | StyledMeasureColumn; // the column definition from dataOptions
  value: string | number; // raw cell value from the query result
  displayValue?: string; // formatted string shown in the cross-filter context menu title
  attribute?: Attribute; // REQUIRED on dimension entries — SDK uses this to build cross-filters
  measure?: Measure; // identifies the measure column for this entry
}
```

**`attribute` on dimension entries is what makes cross-filtering work.** If you omit it,
`onDataPointClick` calls your handler but the SDK cannot construct filters, so no
cross-filtering occurs. The `measure` field is informational — it does not enable drill-down.

### StyledColumn and the `.column` property

`dataOptions.category` is [`StyledColumn[]`](../../modules/sdk-ui/interfaces/interface.StyledColumn.md) and `dataOptions.value` is [`StyledMeasureColumn[]`](../../modules/sdk-ui/interfaces/interface.StyledMeasureColumn.md).
These are wrappers — the underlying `Attribute` or `Measure` lives on the `.column` property:

```
StyledColumn        → .column : Attribute
StyledMeasureColumn → .column : BaseMeasure
```

Unwrap via `.column` when building entries:

```tsx
attribute: column.column as Attribute,  // StyledColumn    → Attribute
measure:   column.column as Measure,    // StyledMeasureColumn → Measure
```

## Incoming: Rendering `cell.blur`

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
      onClick={(e) => props.onDataPointClick?.(buildDataPoint(i), e.nativeEvent)}
    >
      ...
    </div>
  ));
}
```

## Building Data Points

Define a typed data point matching your data panel inputs. Use [`CustomVisualizationDataPoint`](../../modules/sdk-ui/plugin-system/type-alias.CustomVisualizationDataPoint.md) as your base when using the `CustomVisualization` API:

```tsx
import type { Attribute, Measure } from '@sisense/sdk-data';
import type { AbstractDataPointWithEntries, DataPointEntry } from '@sisense/sdk-ui';

interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    category: DataPointEntry[];
    value: DataPointEntry[];
  };
}
```

> **Required for cross-filtering:** Every dimension entry must have `attribute` set.
> Without it, `onDataPointClick` fires your handler but the SDK cannot build filters, so
> nothing happens in other widgets.

Build a data point from a query result row. `data` and `dataOptions` come from the
component props and `useExecuteQuery` (see [Fetching Data](./03-fetching-data.md)):

```tsx
const { dimensions } = extractDimensionsAndMeasures(dataOptions);

const buildDataPoint = (rowIndex: number): MyDataPoint => ({
  entries: {
    // Dimension entries: populate `attribute` so the SDK can create cross-filters
    category: dataOptions.category.map((column, i) => ({
      dataOption: column,
      value: data.rows[rowIndex][i].data as string,
      displayValue: data.rows[rowIndex][i].text ?? undefined,
      attribute: column.column as Attribute, // unwrap StyledColumn → Attribute
    })),
    // Measure entries: use dimensions.length as the offset — it accounts for ALL
    // assigned dimension inputs (category + breakBy + any others), not just category.
    value: dataOptions.value.map((column, i) => ({
      dataOption: column,
      value: data.rows[rowIndex][dimensions.length + i].data as number,
      displayValue: data.rows[rowIndex][dimensions.length + i].text ?? undefined,
      measure: column.column as Measure, // unwrap StyledMeasureColumn → Measure
    })),
  },
});
```

> **Column index offset:** Query results order columns as `[...dimensions, ...measures]`.
> Use `dimensions.length + i` (from `extractDimensionsAndMeasures`) to index into measure
> columns — using `dataOptions.category.length + i` breaks silently when other dimension
> inputs (e.g. `breakBy`) have columns assigned.

### `buildDataPoint` with Multiple Dimension Inputs

When your widget has more than one dimension input (e.g. `x` + `y` for a scatter/density/heatmap chart), each dimension's columns occupy sequential positions in `data.rows`. The column layout is:

```
row[0]                   → first dimension input  (all its columns)
row[x.length]            → second dimension input (all its columns)
row[dimensions.length]   → first measure input    (safe offset — always use this)
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

### Empty Entry Arrays

**Empty entry arrays are valid.** If a data point key has zero elements (`source: []`), the SDK produces no filter for that dimension — equivalent to omitting the key entirely. This is useful for asymmetric nodes (e.g., a target-only node that has no `source` value):

```ts
// Both are equivalent — no filter is created for 'source'
entries: { source: [], target: [{ ... }] }
entries: { target: [{ ... }] }
```

## Invoking Event Handlers

```tsx
const handleClick = (rowIndex: number, event: React.MouseEvent) => {
  onDataPointClick?.(buildDataPoint(rowIndex), event.nativeEvent);
};

const handleContextMenu = (rowIndex: number, event: React.MouseEvent) => {
  event.preventDefault(); // Suppress the browser's native context menu
  onDataPointContextMenu?.(buildDataPoint(rowIndex), event.nativeEvent);
};

return (
  <div>
    {data.rows.map((row, i) => (
      <div
        key={i}
        onClick={(e) => handleClick(i, e)}
        onContextMenu={(e) => handleContextMenu(i, e)}
        style={{ cursor: 'pointer' }}
      >
        {row.map((cell) => cell.text ?? String(cell.data)).join(' — ')}
      </div>
    ))}
  </div>
);
```

## Multi-Selection

Track selected rows in state to support shift-click multi-selection:

```tsx
const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

const handleClick = (rowIndex: number, event: React.MouseEvent) => {
  if (event.shiftKey) {
    const updated = [...selectedIndices, rowIndex];
    setSelectedIndices(updated);
    onDataPointsSelected?.(
      updated.map((i) => buildDataPoint(i)),
      event.nativeEvent,
    );
  } else {
    setSelectedIndices([rowIndex]);
    onDataPointClick?.(buildDataPoint(rowIndex), event.nativeEvent);
  }
};
```

## Complete Example

A bar chart plugin with full cross-filtering support:

```tsx
import { useState } from 'react';

import type { Attribute, Measure } from '@sisense/sdk-data';
import type {
  AbstractDataPointWithEntries,
  CustomVisualization,
  CustomVisualizationProps,
  DataPointEntry,
} from '@sisense/sdk-ui';
import { extractDimensionsAndMeasures, useExecuteQuery } from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    category: DataPointEntry[];
    value: DataPointEntry[];
  };
}

export const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  const { dataSource, dataOptions, filters, highlights, onDataPointClick, onDataPointContextMenu } =
    props;

  const { dimensions, measures } = extractDimensionsAndMeasures(dataOptions);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data, isLoading, isError } = useExecuteQuery({
    dataSource,
    dimensions,
    measures,
    filters, // dashboard-level filters — restrict data
    highlights, // cross-widget selection — dim non-matching rows
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (isError || !data) return <div style={{ padding: 16 }}>No data available.</div>;

  const buildDataPoint = (rowIndex: number): MyDataPoint => ({
    entries: {
      category: dataOptions.category.map((column, i) => ({
        dataOption: column,
        value: data.rows[rowIndex][i].data as string,
        displayValue: data.rows[rowIndex][i].text ?? undefined,
        attribute: column.column as Attribute,
      })),
      value: dataOptions.value.map((column, i) => ({
        dataOption: column,
        value: data.rows[rowIndex][dimensions.length + i].data as number,
        displayValue: data.rows[rowIndex][dimensions.length + i].text ?? undefined,
        measure: column.column as Measure,
      })),
    },
  });

  const maxValue = Math.max(...data.rows.map((row) => Number(row[dimensions.length]?.data ?? 0)));

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {data.rows.map((row, i) => {
        const label = row[0]?.text ?? String(row[0]?.data);
        const value = Number(row[dimensions.length]?.data ?? 0);
        const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const isSelected = selectedIndex === i;

        return (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={(e) => {
              setSelectedIndex(i);
              onDataPointClick?.(buildDataPoint(i), e.nativeEvent);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              onDataPointContextMenu?.(buildDataPoint(i), e.nativeEvent);
            }}
          >
            <span style={{ width: 100, textAlign: 'right', fontSize: 12 }}>{label}</span>
            <div
              style={{
                height: 20,
                width: `${barWidth}%`,
                backgroundColor: isSelected ? '#1976D2' : '#5B9BD5',
                borderRadius: 2,
                minWidth: 2,
              }}
            />
            <span style={{ fontSize: 12 }}>{row[dimensions.length]?.text ?? value}</span>
          </div>
        );
      })}
    </div>
  );
};
```

## Cross-Filtering Across Data Models

Cross-filtering works by broadcasting a member filter on the clicked column. **If another widget's data model does not include that column, the filter has no effect on it** — the widget shows all its data unaffected, neither dimmed nor restricted.

This is expected behavior. There is no error; the filter is silently ignored by widgets that have no matching column. For example, if your widget filters on `target = "Node X"` and another widget's dataset has no `target` column, that widget stays fully opaque. This is the dashboard's per-column filter-routing behavior, not a bug.

## Best Practices

1. **Pass `event.nativeEvent`** — The SDK uses the native pointer event to position context menus correctly.

2. **Always pass both `filters` and `highlights` to `useExecuteQuery`** — Omitting `highlights` means your widget won't visually respond when another widget cross-filters.

3. **Include all dimension inputs in `entries`** — The SDK cross-filters on every non-measure key in your `dataOptions`. A widget with `category` + `breakBy` should include both in each data point's `entries`.

4. **Memoize `buildDataPoint` with `useCallback`** if passing it to child components to avoid unnecessary re-renders.

## Using an AI Agent

Tell your AI agent what you want in plain language:

- "Add cross-filtering" — adds the `buildDataPoint` helper typed to your actual input names, wires `onDataPointClick` and `onDataPointContextMenu`, and applies `cell.blur` opacity in one step. Implements both outgoing (click → broadcast) and incoming (highlights → visual dimming) because half-implemented cross-filtering is confusing to dashboard users.
- "Add a tooltip on hover" — adds a positioned tooltip that appears on hover, receives the data point values, and disappears when the cursor leaves, using a portal so it's never clipped by the widget container.

---

**Next lesson:** [State Persistence](./07-state-persistence.md)
