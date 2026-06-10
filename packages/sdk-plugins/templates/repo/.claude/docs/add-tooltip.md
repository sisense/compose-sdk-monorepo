Add a hover tooltip to the Visualization component.

The user will specify: what data to show in the tooltip (e.g. dimension label, measure value, formatted value, or custom content).

---

## React/JSX rendering (plain DOM, Recharts, SVG)

### Step 1 — Add tooltip state

```tsx
import { useState } from 'react';

interface TooltipState {
  x: number;
  y: number;
  label: string;
  value: string;
}

const [tooltip, setTooltip] = useState<TooltipState | null>(null);
```

### Step 2 — Attach mouse handlers to data point elements

```tsx
<div
  key={i}
  style={{ cursor: 'pointer' }}
  onMouseEnter={(e) =>
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      label: row[0].text ?? String(row[0].data),
      value: row[1].text ?? String(row[1].data), // prefer .text — it includes number formatting
    })
  }
  onMouseMove={(e) =>
    setTooltip((prev) =>
      prev ? { ...prev, x: e.clientX, y: e.clientY } : null
    )
  }
  onMouseLeave={() => setTooltip(null)}
>
  {/* your rendered element */}
</div>
```

### Step 3 — Render the tooltip

Place this **outside** any scrollable or `overflow: hidden` container so it is never clipped. `position: fixed` with `clientX`/`clientY` positions it relative to the viewport regardless of parent transforms:

```tsx
return (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* ... your chart/visualization ... */}

    {tooltip && (
      <div
        style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y + 12,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: '6px 10px',
          fontSize: 12,
          pointerEvents: 'none',   // must not intercept mouse events
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontWeight: 600 }}>{tooltip.label}</div>
        <div style={{ color: '#555' }}>{tooltip.value}</div>
      </div>
    )}
  </div>
);
```

---

## Imperative libraries (Highcharts, Plotly, D3)

Use the library's built-in tooltip API — no React state needed.

### Highcharts

```tsx
const options: Highcharts.Options = {
  tooltip: {
    formatter(this: Highcharts.TooltipFormatterContextObject) {
      return `<b>${this.x}</b><br/>${this.series.name}: ${this.y}`;
    },
  },
};
```

### Plotly

```tsx
const trace: Plotly.Data = {
  // ...
  hovertemplate: '<b>%{x}</b><br>Value: %{y}<extra></extra>',
};
```

Or configure display globally via `Plotly.newPlot(el, [trace], { hoverlabel: { bgcolor: '#fff', font: { size: 12 } } })`.

### D3

Attach native `mouseenter`/`mousemove`/`mouseleave` handlers inside `useEffect`, then let React render the tooltip overlay using the same `<div>` from Step 3:

```tsx
// Inside useEffect, after rendering your SVG elements:
svg
  .selectAll('rect')
  .on('mouseenter', (event: MouseEvent, d) => {
    setTooltip({
      x: event.clientX,
      y: event.clientY,
      label: String(d.label),
      value: String(d.value),
    });
  })
  .on('mousemove', (event: MouseEvent) => {
    setTooltip((prev) =>
      prev ? { ...prev, x: event.clientX, y: event.clientY } : null
    );
  })
  .on('mouseleave', () => setTooltip(null));
```

D3 sets the coordinates; React renders the overlay. The `setTooltip` ref must be stable across re-renders — if the `useEffect` re-runs and re-attaches handlers, the state setter from `useState` is always stable so no `useCallback` is needed.

---

## Complete example (plain DOM rows)

```tsx
import type { DataOptions, StyleOptions } from '../types.js';
import type {
  CustomVisualization,
  CustomVisualizationProps,
} from '@sisense/sdk-ui';
import {
  extractDimensionsAndMeasures,
  formatDataSet,
  useExecuteQuery,
} from '@sisense/sdk-ui';
import { useMemo, useState } from 'react';

interface TooltipState {
  x: number;
  y: number;
  label: string;
  value: string;
}

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const { dimensions, measures } = useMemo(
    () => extractDimensionsAndMeasures(props.dataOptions),
    [props.dataOptions]
  );
  const {
    data: rawData,
    isLoading,
    isError,
  } = useExecuteQuery({
    dataSource: props.dataSource,
    dimensions,
    measures,
    filters: props.filters,
    highlights: props.highlights,
  });
  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions]
  );

  if (isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (isError || !data || data.rows.length === 0)
    return <div style={{ padding: 16 }}>No data</div>;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
      }}
    >
      {data.rows.map((row, i) => (
        <div
          key={i}
          style={{ cursor: 'pointer', padding: '4px 8px' }}
          onMouseEnter={(e) =>
            setTooltip({
              x: e.clientX,
              y: e.clientY,
              label: row[0].text ?? String(row[0].data),
              value: row[1].text ?? String(row[1].data),
            })
          }
          onMouseMove={(e) =>
            setTooltip((prev) =>
              prev ? { ...prev, x: e.clientX, y: e.clientY } : null
            )
          }
          onMouseLeave={() => setTooltip(null)}
        >
          {row[0].text ?? String(row[0].data)}
        </div>
      ))}

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: 4,
            padding: '6px 10px',
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 600 }}>{tooltip.label}</div>
          <div style={{ color: '#555' }}>{tooltip.value}</div>
        </div>
      )}
    </div>
  );
};
```
