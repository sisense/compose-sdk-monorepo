# Hooks & Utilities Reference

All exports are from `@sisense/sdk-ui` unless otherwise noted.

---

## Data fetching

### `useExecuteQuery(options)`

Runs a query against a Sisense data source. The primary data hook for widget plugins.

```ts
import { useExecuteQuery } from '@sisense/sdk-ui';

const { data, isLoading, isError } = useExecuteQuery({
  dataSource: props.dataSource,
  dimensions, // Attribute[]  — from extractDimensionsAndMeasures(props.dataOptions)
  measures, // Measure[]    — from extractDimensionsAndMeasures(props.dataOptions)
  filters: props.filters,
  highlights: props.highlights, // IMPORTANT — pass for cross-widget dim support
  enabled: dimensions.length > 0,
});
```

**Notes:**

- You must extract `dimensions`/`measures` manually with `extractDimensionsAndMeasures`.
- Does not apply number/date formatting on its own — call `formatDataSet(data, props.dataOptions)` after the query if you want `cell.text` populated from `numberFormatConfig` (or use the single-value `formatNumber` / `formatDate` helpers).
- Pass both `filters` and `highlights` every time — the SDK routes dashboard filters into the correct prop automatically.
- Columns are always returned in `[...dimensions, ...measures]` order regardless of `dataOptions` key order.

**Cell fields:**

| Field  | Notes                                                                         |
| ------ | ----------------------------------------------------------------------------- |
| `data` | Raw value from the server                                                     |
| `text` | Formatted string — populated by `formatDataSet`; may be `null` at runtime     |
| `blur` | `true` when the row does NOT match the active highlight (dim it). See errors. |

When building `DataPointEntry.displayValue`, guard against `null`:

```ts
displayValue: cell.text ?? undefined;
//                         ^^^^^^^^^^ coerces null → undefined
```

---

## Utilities

### `extractDimensionsAndMeasures(dataOptions)`

Unwraps `StyledColumn[]` → `Attribute[]` and `StyledMeasureColumn[]` → `Measure[]` from all inputs in `dataOptions`.

```ts
import { extractDimensionsAndMeasures } from '@sisense/sdk-ui';

const { dimensions, measures } = extractDimensionsAndMeasures(
  props.dataOptions
);
// dimensions: Attribute[]  — in order of dimension inputs
// measures:   Measure[]    — in order of measure inputs
```

Use this when calling `useExecuteQuery` or when building data point entries for cross-filtering.

---

### `formatDataSet(data, dataOptions, options?)`

Applies the `numberFormatConfig` (and date formatting) declared on the columns inside `dataOptions` to every matching cell in `data`. Returns a new dataset with `cell.text` populated; the input is not mutated.

```ts
import { formatDataSet } from '@sisense/sdk-ui';
import { useMemo } from 'react';

const data = useMemo(
  () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
  [rawData, props.dataOptions]
);
```

Cells whose column has no formatter are passed through unchanged. Display values with `cell.text ?? String(cell.data ?? '')`.

---

### `formatNumber(value, config)` / `formatDate(value, format, options?)` / `getDefaultDateFormat(level)`

Single-value formatters for use outside the dataset flow (tooltips, axis labels, summary numbers).

```ts
import {
  formatNumber,
  formatDate,
  getDefaultDateFormat,
} from '@sisense/sdk-ui';

formatNumber(1234.56, { name: 'Numbers', decimalScale: 1 }); // "1,234.6"
formatDate(new Date(), 'yyyy-MM-dd'); // "2026-05-29"
getDefaultDateFormat('Months'); // default format string for a granularity level
```

---

## Theme

### `useTheme()`

Returns the resolved Sisense theme (`CompleteThemeSettings`). Use it to pick default colors that follow the host dashboard's theme. When no `<ThemeProvider>` wraps the widget, the default theme is returned — your component always sees a fully populated object.

```ts
import { useTheme } from '@sisense/sdk-ui';

const { chart, palette, typography, general, widget } = useTheme();

// Example — fall back to theme colors when styleOptions don't override
const headerBackground =
  props.styleOptions?.headerBackgroundColor ?? chart.secondaryTextColor;
const headerText = props.styleOptions?.headerTextColor ?? chart.textColor;
```

See `.claude/docs/types-reference.md` for the full `CompleteThemeSettings` shape.

---

## Plugin introspection

### `usePlugins()`

Returns metadata about currently registered plugins. Useful for checking if a plugin is loaded.

```ts
import { usePlugins } from '@sisense/sdk-ui';

const { hasPlugin, getPlugin } = usePlugins();

const isLoaded = hasPlugin('my-plugin-name');
const pluginMeta = getPlugin('my-plugin-name'); // returns the WidgetPlugin manifest or undefined
```

---

## Return type reference

### `{ data, isLoading, isError }` — `useExecuteQuery` return shape

```ts
{
  data: QueryResultData | undefined;
  isLoading: boolean;
  isError: boolean;
}
```

`data` is `undefined` while loading or when `enabled` is `false`. Always guard:

```ts
if (isLoading) return <LoadingState />;
if (isError || !data || data.rows.length === 0) return <EmptyState />;
```

---

## What NOT to use from `@sisense/sdk-ui`

The following hooks rely on the SDK's internal rendering context and are **not available** inside plugin visualizations:

- `useSisenseContext` — internal; use `props.dataSource` instead
- `useThemeContext` — internal; use the public `useTheme` hook instead

Wrapping built-in chart components (`LineChart`, `BarChart`, etc.) directly **is supported** — just pass props from `VisualizationProps` directly to the chart component. See `.claude/docs/visualization.md` for the wrapping pattern.
