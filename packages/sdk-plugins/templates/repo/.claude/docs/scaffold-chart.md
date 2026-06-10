Scaffold a working visualization component.

## Before writing any code

Run this to check actual data input names (do not assume template defaults):

```bash
grep -A2 "name:" src/index.tsx | grep "name:" | head -10
```

Then ask the developer (all at once):

1. **Which library?** Recharts, Highcharts, D3, Plotly, other — or **none** (plain React for KPI cards, tables, custom layouts) — or **SDK built-in** (wrap an existing `LineChart`, `BarChart`, etc.).
2. **Which chart type?** (e.g. bar, line, KPI number, data table, scatter, pie)
3. **Confirm input names:** show the names found above and ask if they're correct.

Replace every occurrence of `category` and `value` in the scaffolds below with the developer's actual input names before writing the file.

**For external libraries: install first, then replace `src/components/Visualization.tsx`.**
**For no-library / SDK built-in: no install step — just replace `src/components/Visualization.tsx`.**

---

## The query + formatting pattern

All scaffolds below use the same three-piece pattern for data:

```tsx
import {
  extractDimensionsAndMeasures,
  formatDataSet,
  useExecuteQuery,
} from '@sisense/sdk-ui';
import { useMemo } from 'react';

// 1. Convert dataOptions → raw Attribute[]/Measure[] for the query
const { dimensions, measures } = useMemo(
  () => extractDimensionsAndMeasures(props.dataOptions),
  [props.dataOptions]
);

// 2. Run the query
const {
  data: rawData,
  isLoading,
  isError,
} = useExecuteQuery({
  dataSource: props.dataSource,
  dimensions,
  measures,
  filters: props.filters,
  highlights: props.highlights, // always pass — highlight-mode dashboard filters depend on it
  enabled: dimensions.length > 0,
});

// 3. Apply formatting declared in dataOptions → populates cell.text
const data = useMemo(
  () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
  [rawData, props.dataOptions]
);
```

---

## No library — plain React

No install step. Best for: KPI cards, stat tiles, text summaries, leaderboards, simple tables, and any layout-based visualization where a charting library would add bundle weight without benefit.

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
import { useMemo } from 'react';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
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
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions]
  );

  if (dimensions.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#aaa',
          fontSize: 13,
        }}
      >
        Add a dimension to start
      </div>
    );
  }
  if (isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (isError || !data || data.rows.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#888',
        }}
      >
        No data
      </div>
    );
  }

  // data.columns order is always [...dimensions, ...measures]
  // Adapt this rendering to your specific layout (KPI card, table rows, etc.)
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      {data.rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 0',
            borderBottom: '1px solid #eee',
            fontSize: 14,
          }}
        >
          <span>{row[0].text ?? String(row[0].data)}</span>
          <span style={{ fontWeight: 600 }}>
            {row[1].text ?? String(row[1].data)}
          </span>
        </div>
      ))}
    </div>
  );
};
```

**KPI card variant** — single value, no loop:

```tsx
// Replace the return at the bottom with:
const label = data.columns[0]?.name ?? 'Value';
const value = data.rows[0]?.[1].text ?? String(data.rows[0]?.[1].data ?? '—');

return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
    <div style={{ fontSize: 36, fontWeight: 700, color: '#1976D2' }}>{value}</div>
    <div style={{ fontSize: 13, color: '#666' }}>{label}</div>
  </div>
);
```

---

## No library — wrapping a built-in SDK chart

No install step. Best for: when your plugin is a thin configuration layer over an existing SDK chart type. The built-in chart handles data fetching, cross-filtering, filter/highlight routing, and number formatting automatically — you just pass props through.

```tsx
import type { DataOptions } from '../types.js';
import type {
  CustomVisualization,
  CustomVisualizationProps,
} from '@sisense/sdk-ui';
// Replace LineChart with the built-in chart type you want to wrap:
// BarChart, AreaChart, PieChart, ScatterChart, FunnelChart, TreemapChart, etc.
import { LineChart } from '@sisense/sdk-ui';
import type { LineStyleOptions } from '@sisense/sdk-ui';

// Narrow StyleOptions to only the built-in props you want to expose in the design panel.
// You can use Pick<LineStyleOptions, 'legend' | 'markers'> to expose a subset.
export type StyleOptions = LineStyleOptions;

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => (
  <LineChart
    dataSet={props.dataSource}
    dataOptions={{
      // Map your data panel input names to the built-in chart's dataOptions shape.
      // Replace 'category' and 'value' with your actual input names:
      category: props.dataOptions.category ?? [],
      value: props.dataOptions.value ?? [],
      breakBy: props.dataOptions.breakBy ?? [],
    }}
    filters={props.filters}
    highlights={props.highlights}
    styleOptions={props.styleOptions}
    onDataPointClick={props.onDataPointClick}
    onDataPointContextMenu={props.onDataPointContextMenu}
    onDataPointsSelected={props.onDataPointsSelected}
  />
);
```

**Notes:**

- Built-in charts handle `filters` and `highlights` routing internally — you just pass them through.
- Cross-filtering is fully automatic when you pass the event handlers through.
- `StyleOptions` can be `Pick<LineStyleOptions, 'legend' | 'markers'>` to expose only specific controls in the design panel, rather than the full built-in options type.
- For other chart types, replace `LineChart` + `LineStyleOptions` with the matching chart component and style options type (e.g. `BarChart` + `BarStyleOptions`).

---

## Recharts

```bash
npm install recharts
```

Recharts uses React JSX components. Transform `data.rows` once into a plain object array before passing to the chart.

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
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
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
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions]
  );

  if (dimensions.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#aaa',
          fontSize: 13,
        }}
      >
        Add a dimension to start
      </div>
    );
  }
  if (isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (isError || !data || data.rows.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#888',
        }}
      >
        No data
      </div>
    );
  }

  // data.columns order is always [...dimensions, ...measures]
  const chartData = data.rows.map((row) => ({
    label: row[0].text ?? String(row[0].data), // dimension at index 0
    value: row[1].data as number, // measure at index 1
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" fill="#1976D2" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

**Adapt to your schema:** Replace `row[0]`/`row[1]` indices with your actual positions. Switch `<BarChart>` to `<LineChart>`, `<AreaChart>`, `<ScatterChart>`, etc. For multiple measures, map `data.columns` to `<Bar>`/`<Line>` elements dynamically.

For cross-filtering with Recharts, see `/add-cross-filtering` — Recharts requires custom `dot`, `shape`, or `<Cell>` render props to attach per-element click handlers.

---

## Highcharts

```bash
npm install highcharts highcharts-react-official
```

> **License:** Highcharts requires a paid license for commercial use. See [highcharts.com/license](https://www.highcharts.com/license).

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
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
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
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions]
  );

  if (dimensions.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#aaa',
          fontSize: 13,
        }}
      >
        Add a dimension to start
      </div>
    );
  }
  if (isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (isError || !data || data.rows.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#888',
        }}
      >
        No data
      </div>
    );
  }

  // data.columns order is always [...dimensions, ...measures]
  const categories = data.rows.map((row) => row[0].text ?? String(row[0].data));
  const seriesData = data.rows.map((row) => row[1].data as number);

  const options: Highcharts.Options = {
    chart: { type: 'column', backgroundColor: 'transparent', animation: false },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: { categories },
    yAxis: { title: { text: undefined } },
    series: [
      {
        type: 'column',
        name: data.columns[1]?.name ?? 'Value',
        data: seriesData,
        color: '#1976D2',
      },
    ],
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      containerProps={{ style: { width: '100%', height: '100%' } }}
    />
  );
};
```

**Notes:**

- For add-on chart types (3D, heatmap, sankey, treemap, etc.) import them as side effects at module level — Highcharts v12 modules self-register on import and are **not** callable functions: `import 'highcharts/highcharts-more';` (no call). The main `import Highcharts from 'highcharts'` must appear first.
- `HighchartsReact` with `containerProps` handles resize automatically via its internal `ResizeObserver` — no `/add-resize-observer` needed.
- For cross-filtering with Highcharts, use the imperative pattern with `propsRef`. See `.claude/docs/visualization.md` for the full pattern.

---

## D3.js

```bash
npm install d3
npm install --save-dev @types/d3
```

D3 renders directly to a ref-attached `<svg>` element. All D3 work lives inside `useEffect`.

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
import * as d3 from 'd3';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // useId prefix for SVG id attributes (gradients, clip-paths, markers) — avoids collisions
  // when multiple widget instances share the DOM. Strip colons: React generates ':r0:' which
  // is valid HTML but breaks CSS url(#id) references (e.g. clip-path="url(#:r0:-clip)").
  const uid = useId().replace(/:/g, '');
  const [size, setSize] = useState({ width: 0, height: 0 });

  // ResizeObserver fires with real dimensions on mount and on every widget resize.
  // getBoundingClientRect() returns 0×0 on the first render for percentage-sized containers.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions]
  );

  useEffect(() => {
    const el = svgRef.current;
    if (!el || !data || data.rows.length === 0) return;
    const { width, height } = size;
    if (width === 0 || height === 0) return;

    const margin = { top: 16, right: 16, bottom: 40, left: 48 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    d3.select(el).selectAll('*').remove();

    const svg = d3
      .select(el)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // data.columns order: [...dimensions, ...measures]
    const labels = data.rows.map((row) => row[0].text ?? String(row[0].data));
    const values = data.rows.map((row) => row[1].data as number);

    const x = d3.scaleBand().domain(labels).range([0, innerW]).padding(0.2);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(values) ?? 0])
      .nice()
      .range([innerH, 0]);

    svg
      .append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y));

    svg
      .selectAll('rect')
      .data(data.rows)
      .join('rect')
      .attr('x', (_, i) => x(labels[i]) ?? 0)
      .attr('y', (_, i) => y(values[i]))
      .attr('width', x.bandwidth())
      .attr('height', (_, i) => innerH - y(values[i]))
      .attr('fill', '#1976D2');
  }, [data, size]);

  if (dimensions.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#aaa',
          fontSize: 13,
        }}
      >
        Add a dimension to start
      </div>
    );
  }
  if (isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (isError || !data || data.rows.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#888',
        }}
      >
        No data
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
```

**Notes:**

- The scaffold uses a `ResizeObserver` on a wrapper `div` to measure the container and stores the result in `size` state. The D3 effect depends on `[data, size]` and skips when `width === 0 || height === 0` — so the chart renders correctly on first mount and re-renders on every widget resize without any extra setup.
- For cross-filtering with D3, attach event listeners in the `useEffect` using the `propsRef` pattern described in `.claude/docs/visualization.md`.
- `useId` is required any time your SVG has `id` attributes (gradients, clip-paths, markers). Two widget instances on the same dashboard share the DOM — without unique IDs they collide. The `.replace(/:/g, '')` strips the colons that React includes in generated values (e.g. `:r0:`) — bare colons break CSS `url(#id)` references like `clip-path="url(#:r0:-clip)"`.
- **D3 TypeScript ergonomics:** D3's imperative selection API loses type information when chaining across transitions or reusing selections. Use `as any` casts at selection assignment boundaries where TypeScript cannot infer the narrowed element type — this is expected and not a design problem. Example: `const node = svg.selectAll('circle').data(nodes).join('circle') as d3.Selection<SVGCircleElement, Node, SVGGElement, unknown>;`
- **Hierarchical layouts (pack, treemap, partition/icicle):** Use the `buildHierarchy` helper from `.claude/docs/data-fetching.md` to convert flat `data.rows` into a nested D3 hierarchy tree — do not fold rows manually. The recommended input shape is a single `path` dimension with no `maxItems` limit.

---

## Plotly

```bash
npm install plotly.js-dist-min
npm install --save-dev @types/plotly.js
```

Plotly registers events through its own API (`el.on('plotly_click', ...)`), not React props. Use the **`propsRef`** pattern so event handlers always see the latest props without re-registering on every render.

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
import Plotly from 'plotly.js-dist-min';
import { useEffect, useMemo, useRef } from 'react';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // propsRef keeps handlers up-to-date without re-registering on every render
  const propsRef = useRef(props);
  propsRef.current = props;

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
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !data || data.rows.length === 0) return;

    // Cross-filter incoming: server marks non-matching rows with cell.blur = true
    const hasHighlights = data.rows.some((row) => row[0].blur !== undefined);
    const opacities = data.rows.map((row) =>
      hasHighlights && row[0].blur === true ? 0.25 : 1
    );

    // data.columns order is always [...dimensions, ...measures]
    const x = data.rows.map((row) => row[0].text ?? String(row[0].data));
    const y = data.rows.map((row) => row[1].data as number);

    const trace: Plotly.Data = {
      type: 'bar',
      x,
      y,
      marker: { color: '#1976D2', opacity: opacities },
    };

    Plotly.newPlot(
      el,
      [trace],
      { margin: { t: 20, r: 20, b: 40, l: 48 } },
      {
        displayModeBar: false,
        responsive: true,
      }
    );

    (el as unknown as Plotly.PlotlyHTMLElement).on(
      'plotly_click',
      (event: Plotly.PlotMouseEvent) => {
        const point = event.points?.[0];
        if (point == null) return;
        const { dataOptions, onDataPointClick } = propsRef.current;
        const col = dataOptions.category?.[0];
        if (!col) return;
        const rowIndex = point.pointIndex;
        const row = data.rows[rowIndex];
        onDataPointClick?.(
          {
            entries: {
              category: [
                {
                  dataOption: col,
                  value: String(row[0].data),
                  displayValue: row[0].text ?? undefined,
                  attribute: (col as any).column,
                },
              ],
            },
          },
          event.event
        );
      }
    );

    return () => Plotly.purge(el);
  }, [data]);

  if (dimensions.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#aaa',
          fontSize: 13,
        }}
      >
        Add a dimension to start
      </div>
    );
  }
  if (isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (isError || !data || data.rows.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#888',
        }}
      >
        No data
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
```

**Notes:**

- `el as unknown as Plotly.PlotlyHTMLElement` — Plotly mutates the DOM element; cast via `unknown` (not `any`) to call `.on()` safely.
- `Plotly.purge(el)` in the cleanup removes the chart and all event listeners.
- For cross-filtering, see `/add-cross-filtering` for the full typed `buildDataPoint` helper. The snippet above shows the minimal pattern.
- For more chart types (scatter, heatmap, pie, etc.) see [plotly.com/javascript](https://plotly.com/javascript/).

---

## Other libraries (Chart.js, ECharts, Victory, Vega-Lite, etc.)

For any imperative event-based library, use the **`propsRef`** pattern shown in the Plotly section above — register events once in `useEffect`, keep `propsRef.current = props` updated on every render so handlers always see the latest callbacks.

For React-component-based libraries (Victory, Nivo, visx), attach `onClick` and `onContextMenu` directly to the rendered chart elements as React event props — no `propsRef` needed.
