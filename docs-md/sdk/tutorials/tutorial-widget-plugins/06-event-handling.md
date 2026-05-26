---
title: 6 | Event Handling and Cross-Filtering
hidden: true
---

# Event Handling and Cross-Filtering

Widget plugins support three user interaction events. Implementing them connects your widget
to the dashboard ecosystem — enabling cross-filtering and context menus.

## Event Handler Types

| Handler                  | Type                                                                                                                                                                              | Trigger         | SDK behavior                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------ |
| `onDataPointClick`       | [`CustomVisualizationDataPointEventHandler`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualizationDataPointEventHandler.md)                                            | Single click    | Triggers cross-filtering                               |
| `onDataPointContextMenu` | [`CustomVisualizationDataPointContextMenuHandler`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualizationDataPointContextMenuHandler.md)                                | Right-click     | Positions a context menu (Filter by, etc.)             |
| `onDataPointsSelected`   | [`CustomVisualizationDataPointsEventHandler`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualizationDataPointsEventHandler.md)                                          | Multi-selection | Enables multi-value cross-filtering                    |

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
  displayValue?: string; // formatted string (use for display)
  attribute?: Attribute; // required for dimensions — SDK uses this to build cross-filters
  measure?: Measure; // required for measures — SDK uses this for cross-filtering
}
```

**`attribute` and `measure` are what make cross-filtering work.** If you omit them,
`onDataPointClick` calls your handler but the SDK cannot construct filters, so no
cross-filtering occurs.

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

## Building Data Points

Define a typed data point matching your data panel inputs. Use [`CustomVisualizationDataPoint`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualizationDataPoint.md) as your base when using the `CustomVisualization` API:

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

> **Required for cross-filtering:** Every dimension entry must have `attribute` set, and every
> measure entry must have `measure` set. Without them the SDK cannot build filters, so
> `onDataPointClick` fires your handler but cross-filtering does nothing.

Build a data point from a query result row. `data` and `dataOptions` come from the
component props and `useExecuteQuery` (see [Fetching Data](./03-fetching-data.md)):

```tsx
const buildDataPoint = (rowIndex: number): MyDataPoint => ({
  entries: {
    // Dimension entries: populate `attribute` so the SDK can create cross-filters
    category: dataOptions.category.map((column, i) => ({
      dataOption: column,
      value: data.rows[rowIndex][i].data as string,
      displayValue: data.rows[rowIndex][i].displayValue,
      attribute: column.column as Attribute, // unwrap StyledColumn → Attribute
    })),
    // Measure entries: populate `measure` so the SDK can build cross-filters
    value: dataOptions.value.map((column, i) => ({
      dataOption: column,
      // Measure columns follow all dimension columns in the result row
      value: data.rows[rowIndex][dataOptions.category.length + i].data as number,
      displayValue: data.rows[rowIndex][dataOptions.category.length + i].displayValue,
      measure: column.column as Measure, // unwrap StyledMeasureColumn → Measure
    })),
  },
});
```

> **Column index offset:** Query results order columns as `[...dimensions, ...measures]`.
> Use `dataOptions.category.length + i` to index into measure columns correctly.

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
        {row.map((cell) => cell.displayValue ?? String(cell.data)).join(' — ')}
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
        displayValue: data.rows[rowIndex][i].displayValue,
        attribute: column.column as Attribute,
      })),
      value: dataOptions.value.map((column, i) => ({
        dataOption: column,
        value: data.rows[rowIndex][dataOptions.category.length + i].data as number,
        displayValue: data.rows[rowIndex][dataOptions.category.length + i].displayValue,
        measure: column.column as Measure,
      })),
    },
  });

  const maxValue = Math.max(
    ...data.rows.map((row) => Number(row[dataOptions.category.length]?.data ?? 0)),
  );

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {data.rows.map((row, i) => {
        const label = row[0]?.displayValue ?? String(row[0]?.data);
        const value = Number(row[dataOptions.category.length]?.data ?? 0);
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
            <span style={{ fontSize: 12 }}>
              {row[dataOptions.category.length]?.displayValue ?? value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
```

## Best Practices

1. **Pass `event.nativeEvent`** — The SDK uses the native pointer event to position context menus correctly.

2. **Always pass both `filters` and `highlights` to `useExecuteQuery`** — Omitting `highlights` means your widget won't visually respond when another widget cross-filters.

3. **Memoize `buildDataPoint` with `useCallback`** if passing it to child components to avoid unnecessary re-renders.

---

**Tutorial complete.** [Back to overview](./index.md)
