# Types Reference

All types come from `@sisense/sdk-ui` or `@sisense/sdk-data` unless noted otherwise.

---

## DataOptions types

### `StyledColumn` — dimension input

```ts
import type { StyledColumn } from '@sisense/sdk-ui';

// Represents one item in a dimension input (e.g. dataOptions.category[0])
interface StyledColumn {
  column: Attribute; // raw Attribute — unwrap this for cross-filtering
  color?: StyleSettingValue;
  // additional internal styling fields
}
```

**Common access patterns:**

```ts
// Display name
dataOptions.category[0]?.column.name;

// Raw Attribute for building cross-filter data points
const attr = dataOptions.category[0].column as Attribute;
```

---

### `StyledMeasureColumn` — measure input

```ts
import type { StyledMeasureColumn } from '@sisense/sdk-ui';

interface StyledMeasureColumn {
  column: Measure; // raw Measure — unwrap to pass to DataPointEntry
  numberFormatConfig?: NumberFormatConfig;
  color?: StyleSettingValue;
  // additional internal fields
}
```

**Common access patterns:**

```ts
// Display name
dataOptions.value[0]?.column.name;

// Raw Measure for building data points
const measure = dataOptions.value[0].column as Measure;
```

---

### `GenericDataOptions` — base type for `DataOptions`

```ts
import type { GenericDataOptions } from '@sisense/sdk-ui';

// Extend this in src/types.ts
type GenericDataOptions = Record<
  string,
  Array<StyledColumn | StyledMeasureColumn>
>;
```

---

## Query result types

### `QueryResultData` — returned by `useExecuteQuery`

```ts
interface QueryResultData {
  columns: QueryResultDataColumn[];
  rows: QueryResultCell[][];
}

interface QueryResultDataColumn {
  name: string; // column display name
  type: string; // e.g. 'text', 'numeric', 'datetime'
}

interface QueryResultCell {
  data: string | number | null; // raw value from the server
  text?: string; // formatted string (may be null at runtime despite optional type)
  blur?: boolean; // cross-filter highlight state — set by server when highlights are active
}
```

**`blur` three-state flag:**

| Value       | Meaning                                        | Visual treatment       |
| ----------- | ---------------------------------------------- | ---------------------- |
| `true`      | Row does NOT match the active highlight filter | Dim — ~0.25 opacity    |
| `false`     | Row DOES match the active highlight filter     | Full opacity           |
| `undefined` | No highlights are active                       | Full opacity (neutral) |

All cells in the same row share the same `blur` value — reading `row[0].blur` is sufficient.

> **`blur` at runtime:** Like `cell.text`, `cell.blur` can be `null` at runtime even though the TypeScript type says `boolean | undefined`. Always check with strict equality: `row[0].blur === true ? 0.25 : 1`. This treats `null`, `false`, and `undefined` identically as "full opacity", which is the correct behavior. Avoid `!row[0].blur` — that expression evaluates `!null` as `true`, giving the right opacity by coincidence but obscuring intent.

**Displaying a value:** `cell.text ?? String(cell.data)`

**Column order is always `[...dimensions, ...measures]`** regardless of the order keys appear in `dataOptions`.

---

## Event / cross-filtering types

### `AbstractDataPointWithEntries` — base type for data points

```ts
import type { AbstractDataPointWithEntries } from '@sisense/sdk-ui';

interface AbstractDataPointWithEntries {
  entries: Record<string, DataPointEntry[]>;
  // keys must match your dataPanel input names
}
```

Extend this to define your plugin's typed data point:

```ts
interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    category: DataPointEntry[]; // must match input name 'category'
    value: DataPointEntry[]; // must match input name 'value'
  };
}
```

---

### `DataPointEntry` — one column's contribution to a data point

```ts
import type { DataPointEntry } from '@sisense/sdk-ui';

interface DataPointEntry {
  dataOption: StyledColumn | StyledMeasureColumn; // the column definition
  value: string | number; // raw cell value
  displayValue?: string; // formatted display string
  attribute?: Attribute; // REQUIRED on dimension entries — enables cross-filtering
  measure?: Measure; // identifies the measure column for this entry
}
```

> **Critical:** If `attribute` is missing from a dimension entry, `onDataPointClick` fires but the SDK cannot build cross-filter member filters. The click will appear to do nothing.

---

## Style types

### `CustomVisualizationStyleOptions` — base for `StyleOptions`

```ts
import type { CustomVisualizationStyleOptions } from '@sisense/sdk-ui';

// Open interface — extend it in src/types.ts
interface CustomVisualizationStyleOptions {
  [key: string]: unknown;
}
```

**Serialization constraint:** All values must survive `JSON.stringify` → `JSON.parse`. No functions, class instances, `Date` objects, or `undefined` values in nested objects.

---

## SDK Data types (from `@sisense/sdk-data`)

### `Attribute`

Represents a dimension column definition. Obtained via `StyledColumn.column` or `extractDimensionsAndMeasures(dataOptions).dimensions[i]`.

### `Measure`

Represents a measure/aggregation definition. Obtained via `StyledMeasureColumn.column` or `extractDimensionsAndMeasures(dataOptions).measures[i]`.

### `DataSource`

```ts
type DataSource = string; // the datasource title, e.g. 'Sample ECommerce'
```

### `Filter` / `FilterRelations`

Dashboard-level filters received via `props.filters`. Pass directly to `useExecuteQuery` without modification.

---

## Formatting types

### `CommonDataOptions` — accepted by `formatDataSet`

```ts
import type { CommonDataOptions } from '@sisense/sdk-ui';
```

Any chart, pivot, or custom-widget data options shape. `formatDataSet` reads `numberFormatConfig` and date-format settings off whichever column descriptors it finds — your typed `DataOptions` (which extends `GenericDataOptions`) is always acceptable.

---

### `FormatDataSetOptions`

```ts
import type { FormatDataSetOptions } from '@sisense/sdk-ui';

interface FormatDataSetOptions {
  // Optional locale + app-setting overrides used by the internal date formatter.
  // Most plugins can omit this and call formatDataSet(data, dataOptions).
}
```

Pass only when you need to override locale or date defaults. Otherwise call `formatDataSet(data, dataOptions)` with no third argument.

---

## Theme types

### `CompleteThemeSettings` — returned by `useTheme`

```ts
import type { CompleteThemeSettings } from '@sisense/sdk-ui';
```

The fully resolved theme. Unlike `ThemeSettings` (every field optional), every nested field on `CompleteThemeSettings` is guaranteed to be present.

| Group        | Example fields                                                       |
| ------------ | -------------------------------------------------------------------- |
| `chart`      | `textColor`, `secondaryTextColor`, `backgroundColor`, `animation`    |
| `palette`    | `variantColors: Color[]`                                             |
| `typography` | `fontFamily`, `primaryTextColor`, `secondaryTextColor`, `hyperlink*` |
| `general`    | `brandColor`, `backgroundColor`, `primaryButtonTextColor`            |
| `widget`     | `spaceAround`, `cornerRadius`, `shadow`, `border`, `header.*`        |
| `filter`     | `panel.titleColor`, `panel.backgroundColor`, ...                     |
| `aiChat`     | Chatbot-specific settings (rarely used in widget plugins)            |

Common usage pattern — fall back to theme colors when `styleOptions` does not override:

```ts
const { chart } = useTheme();
const headerBackground =
  styleOptions?.headerBackgroundColor ?? chart.secondaryTextColor;
const headerText = styleOptions?.headerTextColor ?? chart.textColor;
```

---

## Unwrapping pattern

The most common source of type errors is confusing `StyledColumn` (the wrapper) with `Attribute` (the inner value):

```ts
// WRONG — passes the wrapper, not the Attribute
const attr: Attribute = dataOptions.category[0];            // ❌ type error

// CORRECT — unwrap with .column
const attr: Attribute = dataOptions.category[0].column as Attribute;   // ✓

// Utility that does this for all inputs at once
import { extractDimensionsAndMeasures } from '@sisense/sdk-ui';
const { dimensions, measures } = extractDimensionsAndMeasures(dataOptions);
// dimensions[i] → Attribute[]
// measures[i]   → Measure[]
```
