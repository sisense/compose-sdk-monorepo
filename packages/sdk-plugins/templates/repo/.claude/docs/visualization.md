# Visualization Component

## Signature

```tsx
import type { DataOptions, StyleOptions } from '../types.js';
import type {
  CustomVisualization,
  CustomVisualizationProps,
} from '@sisense/sdk-ui';

export type VisualizationProps = CustomVisualizationProps<
  DataOptions,
  StyleOptions
>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  // ...
  return <div />;
};
```

The generic parameters are optional — omitting them defaults to `GenericDataOptions` and `CustomVisualizationStyleOptions`.

---

## Props received

| Prop                     | Type                                       | Notes                                             |
| ------------------------ | ------------------------------------------ | ------------------------------------------------- |
| `dataSource`             | `DataSource \| undefined`                  | Datasource identifier; pass to `useExecuteQuery`  |
| `dataOptions`            | `DataOptions`                              | Dimensions + measures from the data panel         |
| `styleOptions`           | `StyleOptions \| undefined`                | **Starts as `{}`** — always provide defaults      |
| `filters`                | `Filter[] \| FilterRelations \| undefined` | Dashboard filters; pass to query hooks            |
| `highlights`             | `Filter[] \| undefined`                    | Cross-widget selection; pass to `useExecuteQuery` |
| `onDataPointClick`       | `handler \| undefined`                     | May be `undefined` — always call with `?.`        |
| `onDataPointContextMenu` | `handler \| undefined`                     | Same                                              |
| `onDataPointsSelected`   | `handler \| undefined`                     | Same                                              |

---

## Rendering environment

Your component renders inside:

```
WidgetContainer → DynamicSizeContainer → ErrorBoundary → Visualization
```

- The container fills 100% of the widget's allocated space.
- `width: '100%'; height: '100%'` on your root element uses the full widget area.
- If your component throws, the ErrorBoundary catches it and shows an error state — the rest of the dashboard is unaffected.

---

## Wrapping a built-in SDK chart

When your plugin is a thin config layer over an existing chart type, pass props directly:

```tsx
import { LineChart } from '@sisense/sdk-ui';
import type { LineStyleOptions } from '@sisense/sdk-ui';

// Narrow StyleOptions to only the LineChart props you expose
export type StyleOptions = Pick<LineStyleOptions, 'legend' | 'markers'>;

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => (
  <LineChart
    dataSet={props.dataSource}
    dataOptions={{
      category: props.dataOptions.category ?? [],
      value: props.dataOptions.value ?? [],
      breakBy: props.dataOptions.breakBy ?? [],
    }}
    filters={props.filters}
    styleOptions={{ ...props.styleOptions }}
  />
);
```

> **Note:** `filters` and `highlights` are passed automatically by built-in chart components when used this way — you do not need to call `useExecuteQuery` separately.

---

## State rendering pattern

Always handle the three states: loading, error/empty, and data ready.

```tsx
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
  });
  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions]
  );

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        Loading…
      </div>
    );
  }
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

  return <YourChart data={data} styleOptions={props.styleOptions} />;
};
```

---

## External visualization libraries

Any React-compatible library can be used — add it as a `dependency` in `package.json` and it will be bundled into the plugin output.

### Highcharts ✅ all build targets

`highcharts-react-official` only uses `useRef` and `useEffect`, which are fully covered by the Preact compatibility layer used for the cross-framework (Angular/Vue) build. Highcharts itself is vanilla JS and has no framework dependency.

```bash
npm install highcharts highcharts-react-official
```

```tsx
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  // Build your Highcharts options from props.dataOptions and props.styleOptions.
  // See https://api.highcharts.com for all chart types and configuration options.
  const options: Highcharts.Options = {
    chart: { backgroundColor: 'transparent' },
    title: { text: undefined },
    credits: { enabled: false },
    // series: [...],  // populate from data — see useExecuteQuery + formatDataSet
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

For charts requiring add-on modules (3D, heatmap, sankey, etc.), import them as side effects at module level. **Highcharts v12 changed this** — modules now self-register on import and are no longer callable functions. Calling them throws `TypeError: X is not a function`.

```ts
import Highcharts from 'highcharts';
// bubble, gauge, polar
import 'highcharts/highcharts-3d';
// sets window._Highcharts; must come first
// Modules self-register when imported — do NOT call them.
import 'highcharts/highcharts-more';
// 3D charts
import 'highcharts/modules/heatmap';

// heatmap
```

> **License:** Highcharts requires a paid license for commercial use. See [highcharts.com/license](https://www.highcharts.com/license).

---

### Highcharts + cross-filtering

Highcharts fires click events through `plotOptions.series.point.events.click`. The callback runs with `this` bound to the clicked `Highcharts.Point` — use `this.index` to map the click back to a row in `data.rows`.

Because `HighchartsReact` rebuilds the chart config on every render, the callback always closes over the latest `props` and `data` — no `propsRef` is needed (unlike Plotly's imperative `useEffect` registration).

```tsx
import type { Attribute } from '@sisense/sdk-data';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  // ...data fetching (useExecuteQuery + formatDataSet)...

  // Incoming blur: dim non-matching rows when another widget cross-filters
  const hasHighlights =
    data?.rows.some((row) => row[0].blur !== undefined) ?? false;

  const options: Highcharts.Options = {
    // ...
    plotOptions: {
      series: {
        cursor: 'pointer',
        point: {
          events: {
            // 'this' is the clicked Highcharts.Point; this.index is the row index in data.rows.
            click: function (event: Highcharts.PointClickEventObject) {
              const col = props.dataOptions.category?.[0];
              if (!col || !data) return;

              const row = data.rows[this.index];
              props.onDataPointClick?.(
                {
                  entries: {
                    category: [
                      {
                        dataOption: col,
                        value: String(row[0].data),
                        displayValue: row[0].text ?? undefined,
                        attribute: col.column as Attribute, // required — enables cross-filtering
                      },
                    ],
                  },
                },
                // browserEvent is the native MouseEvent — not in all Highcharts type versions
                (event as unknown as { browserEvent: MouseEvent }).browserEvent
              );
            },
          },
        },
      },
    },
    series: [
      {
        type: 'column',
        name: data?.columns[dimensions.length]?.name ?? 'Value',
        data:
          data?.rows.map((row) => ({
            y: row[dimensions.length].data as number,
            // Per-point opacity for incoming blur — supported by most Highcharts chart types
            opacity: hasHighlights && row[0].blur === true ? 0.25 : 1,
          })) ?? [],
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

**Key notes:**

- `this.index` inside `plotOptions.series.point.events.click` is the 0-based point index — it maps directly to `data.rows[this.index]`.
- For right-click: add `contextmenu` in `plotOptions.series.point.events` and call `props.onDataPointContextMenu?.()`. Call `event.preventDefault?.()` on the `browserEvent` to suppress the browser's native menu.
- For the `buildDataPoint` helper pattern (multiple inputs, typed entries), see `.claude/docs/add-cross-filtering.md`.
- For area/line charts where per-point blur isn't directly supported, see the continuous-chart note in `.claude/docs/add-cross-filtering.md`.

---

### Recharts ✅ all build targets

Works in React and cross-framework builds — Preact compat covers all Recharts internals.

```bash
npm install recharts
```

#### Recharts + cross-filtering: attaching click handlers to rendered elements

Recharts components fire `onClick` on the whole chart or series, not individual data points. To attach both `onClick` and `onContextMenu` to individual rendered elements (dots, bars, cells, etc.), use the element's render prop and render your own SVG element.

For example, on a `<Line>` the `dot` render prop accepts a function but Recharts' TypeScript types don't expose this cleanly — cast to `any`:

```tsx
// Recharts' dot prop accepts a React element or a function returning one, but the type
// definitions only expose a subset — cast to any to use the function form.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderDot = (seriesKey: string) => (dotProps: any) => {
  const { cx, cy, payload } = dotProps;
  const categoryValue = payload?.x as string;
  const isSelected = selectedKey === categoryValue;

  return (
    <circle
      key={`${seriesKey}-${categoryValue}`}
      cx={cx}
      cy={cy}
      r={isSelected ? 6 : 4}
      fill={isSelected ? '#1565C0' : dotProps.fill ?? dotProps.stroke}
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        setSelectedKey(categoryValue);
        onDataPointClick?.(buildDataPoint(categoryValue), e.nativeEvent);
      }}
      onContextMenu={(e) => {
        e.preventDefault(); // suppress browser native context menu
        onDataPointContextMenu?.(buildDataPoint(categoryValue), e.nativeEvent);
      }}
    />
  );
};
```

Pass `activeDot={false}` alongside your custom `dot` prop — otherwise Recharts renders an `activeDot` on top on hover, which can intercept your `onContextMenu`.

The same pattern applies to other Recharts chart types: use `<Bar shape={...}>`, `<Cell>`, or `<Scatter shape={...}>` to get per-element click control.

---

### D3.js ✅ all build targets

Framework-agnostic; renders directly to the DOM via a `ref`. D3 does not measure its own container — use a `ResizeObserver` on a wrapper `div` to get real dimensions and store them in state. The D3 effect depends on `[data, size]` and skips when dimensions are zero, so the chart renders correctly on first mount and re-renders on every widget resize.

```tsx
import * as d3 from 'd3';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Strip colons: React generates ':r0:' which breaks CSS url(#id) references.
  const uid = useId().replace(/:/g, '');
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Effect 1 — measure the container. getBoundingClientRect() returns 0×0 on first render
  // for percentage-sized containers; ResizeObserver fires with real dimensions at mount.
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

  // Effect 2 — D3 rendering. Re-runs when data or container size changes.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const { width, height } = size;
    if (width === 0 || height === 0) return; // skip until layout is ready

    const svg = d3.select(el);
    svg.selectAll('*').remove();
    // ... D3 rendering using width and height
  }, [data, size]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
```

#### SVG `id` collisions — multiple widget instances

SVG `id` attributes are **document-scoped**, not component-scoped. If two instances of your widget appear on the same dashboard (no iframes), IDs like `arrowhead` in `<defs>` will collide — the second definition overwrites the first, breaking `markerEnd`/`markerStart` references on one of the widgets.

**Fix:** prefix every SVG ID with a per-instance unique value using React's `useId` hook:

```tsx
import { useId } from 'react';

export const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  // Strip colons: React generates ':r0:' which is valid HTML but breaks CSS url(#id) references.
  const uid = useId().replace(/:/g, '');
  const markerId = `${uid}-arrowhead`;

  return (
    <svg style={{ width: '100%', height: '100%' }}>
      <defs>
        <marker id={markerId} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
        </marker>
      </defs>
      {/* reference by the per-instance ID, not a hardcoded string */}
      <line markerEnd={`url(#${markerId})`} ... />
    </svg>
  );
};
```

`useId` is available in React 18 and is already included in the plugin's React dependency. Any SVG element with an `id` that is referenced elsewhere (gradients, clip-paths, filters, markers, patterns) should follow this pattern.

---

### Plotly and other imperative event APIs ✅ all build targets

Libraries like Plotly register events through their own API (`el.on('plotly_click', ...)`) rather than React event props. Cross-filtering requires keeping callbacks fresh without re-registering on every render — use a **`propsRef`** for this.

```bash
npm install plotly.js-dist-min
npm install --save-dev @types/plotly.js
```

```tsx
import type { DataOptions, StyleOptions } from '../types.js';
import type { Attribute, Measure } from '@sisense/sdk-data';
import type {
  AbstractDataPointWithEntries,
  CustomVisualization,
  CustomVisualizationProps,
  DataPointEntry,
} from '@sisense/sdk-ui';
import { extractDimensionsAndMeasures, useExecuteQuery } from '@sisense/sdk-ui';
import Plotly from 'plotly.js-dist-min';
import { useEffect, useRef } from 'react';

type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: { category: DataPointEntry[]; value: DataPointEntry[] };
}

export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  const { dimensions, measures } = extractDimensionsAndMeasures(
    props.dataOptions
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep a stable ref to props so imperative event handlers always see the latest values
  // without needing to re-register on every render.
  const propsRef = useRef(props);
  propsRef.current = props; // update on every render — no re-effect needed

  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: props.dataSource,
    dimensions,
    measures,
    filters: props.filters,
    highlights: props.highlights, // required — dims rows when another widget cross-filters
    enabled: dimensions.length > 0 && measures.length > 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !data || data.rows.length === 0) return;

    const { dimensions: currentDims } = extractDimensionsAndMeasures(
      propsRef.current.dataOptions
    );

    // Compute blur-based opacity for cross-filter highlighting.
    // cell.blur === true → row doesn't match the active highlight → dim it.
    // cell.blur === undefined → no highlights active → full opacity.
    const hasHighlights = data.rows.some((row) => row[0].blur !== undefined);
    const opacities = data.rows.map((row) =>
      hasHighlights && row[0].blur === true ? 0.25 : 1
    );

    // Build your Plotly trace(s) from data.rows.
    // See https://plotly.com/javascript/ for all trace types (scatter, heatmap, bar, etc.).
    // Pass opacities into marker.opacity (or equivalent) to apply cross-filter dimming.
    const trace: Plotly.Data = {
      // type: 'scatter',  // choose your chart type
      // x: data.rows.map((row) => ...),
      // y: data.rows.map((row) => ...),
      marker: { opacity: opacities },
    };

    Plotly.newPlot(
      el,
      [trace],
      { margin: { t: 0 } },
      { displayModeBar: false }
    );

    (el as unknown as Plotly.PlotlyHTMLElement).on(
      'plotly_click',
      (event: Plotly.PlotMouseEvent) => {
        const point = event.points?.[0];
        if (point == null) return;

        const { dataOptions, onDataPointClick } = propsRef.current;
        const { dimensions: dims } = extractDimensionsAndMeasures(dataOptions);
        const rowIndex = point.pointIndex;
        const row = data.rows[rowIndex];

        // Build entries to match your dataPanel.config.inputs — keys must match input names.
        // Replace 'category'/'value' with your actual input names (e.g. x, y, lat, lon, size).
        const dataPoint: MyDataPoint = {
          entries: {
            category: dataOptions.category.map((col, i) => ({
              dataOption: col,
              value: row[i].data as string,
              displayValue: row[i].text ?? undefined,
              attribute: col.column as Attribute, // required for cross-filtering
            })),
            value: dataOptions.value.map((col, i) => ({
              dataOption: col,
              value: row[dims.length + i].data as number,
              displayValue: row[dims.length + i].text ?? undefined,
              measure: col.column as Measure,
            })),
          },
        };

        // event.event is the original native MouseEvent from Plotly
        onDataPointClick?.(dataPoint, event.event);
      }
    );

    // Plotly.purge removes the chart and all event listeners — always call on cleanup.
    return () => Plotly.purge(el);
  }, [data, dimensions.length]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {(isLoading || isError || !data || data.rows.length === 0) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
          }}
        >
          {isLoading ? 'Loading…' : 'No data'}
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
```

**Key patterns for imperative libraries:**

| Pattern                                     | Why                                                                                                                                                                                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `propsRef.current = props` on every render  | Handlers are registered once in `useEffect`; without this they close over stale props                                                                                                                                                                   |
| `el as unknown as Plotly.PlotlyHTMLElement` | `Plotly.newPlot()` augments the DOM element into a `PlotlyHTMLElement`, but the ref type stays `HTMLDivElement`. Cast via `unknown` (not `any`) to call `.on()` with full type safety — the cast is correct because Plotly mutates the element in place |
| `event.event` as the native `MouseEvent`    | Plotly wraps the original event — pass it to `onDataPointClick` so the SDK can position menus                                                                                                                                                           |
| `Plotly.purge(el)` in cleanup               | Destroys the chart and removes all Plotly event listeners                                                                                                                                                                                               |
| Container div always rendered               | The `useEffect` checks `!data` before plotting, so loading/error states coexist with the ref                                                                                                                                                            |

> **D3 with events:** Use the same `propsRef` pattern when wiring D3 event listeners via `selection.on('click', ...)`.

---

### Bundle size note

External libraries are bundled into `dist/react/main.js` and `dist/cross-framework/main.js` — they are **not** externalized. A library like Highcharts (~300 KB gzipped) will noticeably increase the plugin bundle size. Prefer tree-shakeable libraries where possible.

---

## Widget header visibility

To hide the widget title in the Fusion editor:

```tsx
// src/index.tsx
customWidget: {
  config: {
    header: { visible: false },
  },
  // ...
}
```
