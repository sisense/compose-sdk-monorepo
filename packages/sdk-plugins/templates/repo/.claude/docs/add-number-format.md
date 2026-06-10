Add a number format control to the design panel so users can configure how measure values are displayed (decimal places, currency symbol, percentage, abbreviations).

`useExecuteQuery` does not apply formatting on its own. Call `formatDataSet(data, dataOptions)` once after the query — it reads each measure column's `numberFormatConfig` and writes the formatted result into `cell.text`. Your Visualization component then renders `cell.text ?? String(cell.data)`.

---

## Step 1 — Use `cell.text` for measure display

In `src/components/Visualization.tsx`, check how measure values are currently displayed. Replace any raw `cell.data` usage with `cell.text ?? String(cell.data as number)`:

```tsx
// BAD — ignores number formatting; always shows raw number
const displayValue = String(row[dimIdx].data);

// GOOD — uses formatted string when available (set by numberFormatConfig)
const displayValue = row[dimIdx].text ?? String(row[dimIdx].data as number);
```

Apply this change to every place in Visualization.tsx that displays a measure value (chart labels, tooltip values, axis ticks, etc.).

---

## Step 2 — Add `NumberFormatConfig` to StyleOptions

In `src/types.ts`, add the format config type to the StyleOptions interface:

```ts
import type { NumberFormatConfig } from '@sisense/sdk-ui';

export interface StyleOptions {
  // ... existing fields ...
  numberFormat?: NumberFormatConfig;
}
```

---

## Step 3 — Inject `numberFormatConfig` and call `formatDataSet`

In `src/components/Visualization.tsx`, use `useMemo` to inject the format config from `styleOptions` into each measure column **before** running the query and applying formatting:

```tsx
import {
  extractDimensionsAndMeasures,
  formatDataSet,
  useExecuteQuery,
} from '@sisense/sdk-ui';
import { useMemo } from 'react';

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  const { styleOptions, dataOptions, dataSource, filters, highlights } = props;

  // Inject numberFormatConfig from styleOptions into each measure column.
  // formatDataSet reads numberFormatConfig off these columns and populates cell.text.
  const dataOptionsWithFormat = useMemo(() => {
    const format = styleOptions?.numberFormat;
    if (!format) return dataOptions;
    return {
      ...dataOptions,
      // Replace 'value' with your actual measure input name(s):
      value: dataOptions.value?.map((col) => ({
        ...col,
        numberFormatConfig: format,
      })),
    };
  }, [dataOptions, styleOptions?.numberFormat]);

  const { dimensions, measures } = useMemo(
    () => extractDimensionsAndMeasures(dataOptionsWithFormat),
    [dataOptionsWithFormat]
  );

  const {
    data: rawData,
    isLoading,
    isError,
  } = useExecuteQuery({
    dataSource,
    dimensions,
    measures,
    filters,
    highlights,
    enabled: dimensions.length > 0,
  });

  // formatDataSet reads numberFormatConfig from dataOptionsWithFormat and writes
  // formatted strings into cell.text.
  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, dataOptionsWithFormat) : rawData),
    [rawData, dataOptionsWithFormat]
  );

  // ... rest of component reads cell.text
};
```

**If you have multiple measure inputs**, apply the same mapping to each:

```ts
return {
  ...dataOptions,
  revenue: dataOptions.revenue?.map((col) => ({ ...col, numberFormatConfig: format })),
  cost: dataOptions.cost?.map((col) => ({ ...col, numberFormatConfig: format })),
};
```

> **One-off formatting (tooltips, axis labels, summary text):** Use the single-value helper `formatNumber(value, config)` from `@sisense/sdk-ui` instead of `formatDataSet`. `formatDataSet` is for whole-dataset formatting; `formatNumber` is for individual values.

---

## Step 4 — Add the format control to DesignPanel

In `src/components/DesignPanel.tsx`, add a number format selector with the most common options:

```tsx
import type { NumberFormatConfig } from '@sisense/sdk-ui';

const NUMBER_FORMAT_OPTIONS: { label: string; value: NumberFormatConfig }[] = [
  { label: 'Auto', value: { name: 'Numbers' } },
  { label: 'Integer', value: { name: 'Numbers', decimalScale: 0 } },
  { label: '1 decimal', value: { name: 'Numbers', decimalScale: 1 } },
  { label: '2 decimals', value: { name: 'Numbers', decimalScale: 2 } },
  { label: 'Percentage', value: { name: 'Percent', decimalScale: 1 } },
  {
    label: 'Currency ($)',
    value: { name: 'Currency', prefix: true, symbol: '$', decimalScale: 2 },
  },
  { label: 'Abbreviated', value: { name: 'Numbers', abbreviations: true } },
];

// In your DesignPanel component JSX:
<div style={{ marginBottom: 12 }}>
  <label
    style={{
      display: 'block',
      fontSize: 12,
      color: '#666',
      marginBottom: 4,
      fontWeight: 500,
    }}
  >
    Number format
  </label>
  <select
    style={{
      width: '100%',
      padding: '4px 8px',
      fontSize: 13,
      borderRadius: 4,
      border: '1px solid #ccc',
      backgroundColor: '#fff',
    }}
    value={JSON.stringify(
      styleOptions?.numberFormat ?? NUMBER_FORMAT_OPTIONS[0].value
    )}
    onChange={(e) =>
      onChange({
        ...styleOptions,
        numberFormat: JSON.parse(e.target.value) as NumberFormatConfig,
      })
    }
  >
    {NUMBER_FORMAT_OPTIONS.map((opt) => (
      <option key={opt.label} value={JSON.stringify(opt.value)}>
        {opt.label}
      </option>
    ))}
  </select>
</div>;
```

---

## Step 5 — Update `dev-preview-props.ts`

Add a default format to your sample style options so formatted values appear in the dev server:

```ts
// src/dev-preview-props.ts
export const devPreviewProps = {
  // ...
  styleOptions: {
    // ... existing style options ...
    numberFormat: { name: 'Numbers', decimalScale: 1 },
  },
};
```

---

## `NumberFormatConfig` reference

| Field               | Type                                       | Effect                                              |
| ------------------- | ------------------------------------------ | --------------------------------------------------- |
| `name`              | `'Numbers'` \| `'Percent'` \| `'Currency'` | Base format type                                    |
| `decimalScale`      | `number`                                   | Decimal places (e.g. `2` → `1,234.56`)              |
| `prefix`            | `boolean`                                  | Show symbol before the value (`$1,234` vs `1,234$`) |
| `symbol`            | `string`                                   | Currency or custom symbol (e.g. `'€'`, `'£'`)       |
| `abbreviations`     | `boolean`                                  | Abbreviate large numbers (`1.2M`, `5K`, `250`)      |
| `thousandSeparator` | `boolean`                                  | Show comma separators (`1,234` vs `1234`)           |

All fields are optional. Unset fields use SDK defaults.

---

## Verify

Run `npm run dev` and confirm:

1. The design panel shows the "Number format" dropdown.
2. Changing the format updates the displayed values in the visualization.
3. The selected format persists when you reload the dev app.
