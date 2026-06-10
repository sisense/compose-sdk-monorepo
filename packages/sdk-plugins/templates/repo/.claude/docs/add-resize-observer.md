Handle widget resize inside the Visualization component.

Most React-based chart libraries resize automatically:

- **Recharts** `<ResponsiveContainer>` — built-in, no action needed.
- **HighchartsReact** with `containerProps={{ style: { width: '100%', height: '100%' } }}` — built-in.

Use this command when you use an **imperative library** (D3, Plotly, Canvas API) that needs explicit pixel dimensions, or when your chart does not respond to widget resize.

---

## Add a ResizeObserver

```tsx
import { useEffect, useRef, useState } from 'react';

// 1. Ref pointing to the container element
const containerRef = useRef<HTMLDivElement>(null);

// 2. State holding the current pixel dimensions
const [size, setSize] = useState<{ width: number; height: number } | null>(
  null
);

// 3. Observe resize events
useEffect(() => {
  const el = containerRef.current;
  if (!el) return;

  const observer = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    setSize({ width, height });
  });

  observer.observe(el);
  return () => observer.disconnect();
}, []);
```

## Wire into your rendering element

```tsx
return (
  // containerRef must be on the element that fills the widget area
  <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
    {size && (
      <YourChart width={size.width} height={size.height} />
    )}
  </div>
);
```

The `size && (...)` guard defers rendering until the first measurement is available — avoids a 0×0 initial render on mount.

---

## Integration with D3

Use `size` in place of `getBoundingClientRect()` and add `size` to the `useEffect` dependency array so the chart re-renders when the container resizes:

```tsx
useEffect(() => {
  const el = svgRef.current;
  if (!el || !data || !size) return;

  const { width, height } = size;
  const margin = { top: 16, right: 16, bottom: 40, left: 48 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  d3.select(el).selectAll('*').remove();
  const svg = d3
    .select(el)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // ... d3 rendering using innerW and innerH
}, [data, size]); // re-render when data or container size changes

return (
  <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
    {size && (
      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        style={{ display: 'block' }}
      />
    )}
  </div>
);
```

---

## Integration with Plotly

`Plotly.relayout` resizes an already-plotted chart without a full re-render:

```tsx
useEffect(() => {
  const el = containerRef.current;
  if (!el || !size) return;

  Plotly.relayout(el, { width: size.width, height: size.height }).catch(() => {
    // relayout fails if Plotly.newPlot hasn't run yet — safe to ignore
  });
}, [size]);
```

Keep the separate `useEffect` that calls `Plotly.newPlot` (triggered by `data` changes) and this one (triggered by `size` changes) — don't merge them.

---

## Integration with Highcharts (direct chart instance)

`HighchartsReact` with `containerProps` handles resize automatically. Only use this if you access the chart instance directly via `chartRef`:

```tsx
const chartRef = useRef<HighchartsReact.RefObject>(null);

useEffect(() => {
  if (!size || !chartRef.current?.chart) return;
  chartRef.current.chart.setSize(size.width, size.height, false);
}, [size]);
```

---

## Why not `window.addEventListener('resize', ...)`?

`window resize` fires only for viewport changes — it misses widget panel opens, sidebar toggles, and responsive grid re-layouts that change only the widget container's dimensions. `ResizeObserver` fires precisely when the observed element's content box changes, regardless of cause.
