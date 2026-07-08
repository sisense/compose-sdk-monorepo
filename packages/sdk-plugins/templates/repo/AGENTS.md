# Sisense Widget Plugin

This is a Sisense widget plugin — a custom visualization type that runs inside the Sisense Fusion dashboard editor. It is built with React and TypeScript using the Compose SDK plugin API.

## This plugin

At the start of every conversation, read these files to understand the current plugin state:

- `src/index.tsx` — plugin name, widget name, data panel inputs
- `src/types.ts` — DataOptions and StyleOptions fields
- `src/components/Visualization.tsx` — chart implementation and library used
- `src/dev-preview-props.ts` — configured data source and sample data

## Getting started

**Using Claude Code?** Run `/design-custom-widget` and describe your visualization goal in plain English — e.g. "a bar chart showing revenue by product category" or "a Gantt chart using Sample Healthcare". Claude will ask a few clarifying questions, then implement everything: data inputs, library install, chart code, cross-filtering, resize handling, and style controls. No further commands needed.

**Using another AI agent?** Describe your goal in plain language — the agent can read the guides in `.claude/docs/` and follow the same patterns. Common starting point: "I want to build a [chart type] showing [data]. Read `.claude/docs/scaffold-chart.md` and implement it."

> **Data model rule:** The template ships with `@models/sample-ecommerce` (categories, revenue, dates, gender, country). It is a valid default for most standard charts — bar, line, pie, scatter, KPI, table. Column names must come from a model file that has actually been read, never invented.
>
> A new model is generated only when: (a) you explicitly name a different data source, or (b) the visualization needs data the current model cannot provide — in which case the agent will explain what's missing and ask before loading anything. See `.claude/docs/data-model.md`.

If the plugin already has some implementation, ask the AI to "check for issues" or "debug the plugin" before adding features.

## Files to edit

| File                                    | What to change                                                              |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `src/types.ts`                          | Add fields to `DataOptions` and `StyleOptions`                              |
| `src/components/Visualization.tsx`      | Implement the chart or visualization                                        |
| `src/components/DesignPanel.tsx`        | Implement style controls shown in the editor sidebar                        |
| `src/dev-preview-props.ts`              | Update sample props for the dev server preview                              |
| `src/index.tsx`                         | Update `dataPanel.config.inputs` when adding/removing data inputs           |
| `src/components/Visualization.test.tsx` | Update test `dataOptions` when renaming or adding data inputs in `types.ts` |

## Files NOT to edit

- `vite.config.ts` — dual-build config (React + cross-framework Preact); changing targets breaks Fusion deployment
- `dev/main.tsx` — DevApp wiring; only `dev-preview-props.ts` needs updating for sample data
- `package.json` exports map — Angular/Vue hosts rely on the exact `./vue` and `./angular` paths

## The three TypeScript contracts

### 1. Visualization component

The main rendering component. Receives data config, style options, and event handler callbacks:

```tsx
// src/components/Visualization.tsx
export const Visualization: CustomVisualization<VisualizationProps> = (
  props
) => {
  // props.dataSource      — data source identifier
  // props.dataOptions     — column definitions (keyed by dataPanel input names)
  // props.styleOptions    — current style settings from the design panel
  // props.filters         — dashboard-level filters (restrict rows returned)
  // props.highlights      — cross-widget selection (dim non-matching rows)
  // props.onDataPointClick, onDataPointContextMenu, onDataPointsSelected — event handlers
  // props.customOptions   — plugin-specific runtime state persisted across reloads (4th type param)
  // props.onChange         — persist a styleOptions/customOptions patch; undefined outside a dashboard
};
```

### 2. Design panel component

Renders the style controls in the editor sidebar. Reads `styleOptions` and emits updated values:

```tsx
// src/components/DesignPanel.tsx
export const DesignPanel: React.FC<DesignPanelProps<StyleOptions>> = ({
  styleOptions,
  onChange,
}) => {
  // Always spread styleOptions when calling onChange to preserve other properties:
  // onChange({ ...styleOptions, myProp: newValue })
};
```

### 3. Plugin manifest

Declares identity and data panel configuration. Edit the `inputs` array when adding data inputs:

```tsx
// src/index.tsx
const plugin: WidgetPlugin<VisualizationProps> = {
  name: 'PLUGIN_NAME', // unique across all plugins registered in a Sisense instance
  version: '1.0.0', // semver
  requiredApiVersion: '^2.0.0', // SDK API version — do not change unless you know the requirement
  pluginType: 'widget',
  customWidget: {
    name: 'WIDGET_NAME', // unique across all plugins registered in a dashboard
    dataPanel: {
      config: {
        inputs: [
          // Each name must match a key in DataOptions (src/types.ts).
          // Name inputs after what they represent visually, not generically.
          // 'category'/'value' are placeholders — rename for your chart type:
          //   coordinate charts → x, y   |   geo → lat, lon
          //   multi-series → breakBy     |   hierarchy → path
          // See .claude/docs/data-panel.md for a chart-type naming table.
          {
            name: 'category',
            displayName: 'Category',
            type: 'dimension',
            maxItems: 1,
          },
          { name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
        ],
      },
    },
  },
};
```

## Data input types

In `src/types.ts`, each input `name` maps to a TypeScript type:

```ts
type: 'dimension'  →  StyledColumn[]
type: 'measure'    →  StyledMeasureColumn[]
```

## Fetching data

```tsx
import {
  extractDimensionsAndMeasures,
  formatDataSet,
  useExecuteQuery,
} from '@sisense/sdk-ui';
import { useMemo } from 'react';

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
  highlights: props.highlights, // pass even without cross-filtering — highlight-mode filters depend on it
  enabled: dimensions.length > 0,
});

// formatDataSet reads numberFormatConfig/date format from dataOptions and writes cell.text
const data = useMemo(
  () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
  [rawData, props.dataOptions]
);
// data.columns[].name  — column names; order is always [...dimensions, ...measures]
// data.rows[i][j].data — raw value
// data.rows[i][j].text — formatted string (populated by formatDataSet)
```

For cross-filtering support, ask the AI to "add cross-filtering" or read `.claude/docs/add-cross-filtering.md`. For theming, call `useTheme()` to read the host dashboard's resolved theme.

## Commands

```bash
npm run dev          # Dev server at http://localhost:3000 (hot reload)
npm test             # Run unit tests
npm run test:watch   # Tests in watch mode
npm run lint:fix     # Fix lint errors
npm run build        # Build React + cross-framework bundles
npm run build:fusion # Build Fusion deployment zip (dist-fusion/plugin.zip)
npm run deploy       # Deploy to Sisense Fusion (requires .env.local)
```

## CustomVisualizationProps — all fields

| Prop                     | Type                                       | Description                                                                                                                                                                                                                               |
| ------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataSource`             | `DataSource \| undefined`                  | Datasource identifier string (e.g. `'Sample ECommerce'`)                                                                                                                                                                                  |
| `dataOptions`            | `DataOptions`                              | Your typed data options — dimensions and measures mapped from the data panel                                                                                                                                                              |
| `styleOptions`           | `StyleOptions \| undefined`                | Current style settings from the design panel. **Starts as `{}` on first render — always provide defaults**                                                                                                                                |
| `filters`                | `Filter[] \| FilterRelations \| undefined` | Dashboard filters in "Slice" mode. Pass to `useExecuteQuery` to restrict rows returned                                                                                                                                                    |
| `highlights`             | `Filter[] \| undefined`                    | Dashboard filters in "Highlight" mode **or** cross-widget click selections. Pass to `useExecuteQuery` — all rows returned but non-matching ones have `cell.blur = true`. SDK routes dashboard filters into the correct prop automatically |
| `onDataPointClick`       | `(dataPoint, nativeEvent) => void`         | Fire on click to participate in cross-filtering. See `.claude/docs/add-cross-filtering.md`                                                                                                                                                |
| `onDataPointContextMenu` | `(dataPoint, nativeEvent) => void`         | Fire on right-click to show Sisense context menu                                                                                                                                                                                          |
| `onDataPointsSelected`   | `(dataPoints, nativeEvent) => void`        | Fire on shift-click to broadcast multi-selection                                                                                                                                                                                          |
| `customOptions`          | `CustomOptions \| undefined`               | Plugin-specific runtime state (4th type param of `CustomVisualizationProps`), persisted across reloads. See `.claude/docs/add-persistence.md`                                                                                             |
| `onChange`               | `(update) => void \| undefined`            | Persist a partial `{ styleOptions?, customOptions? }` patch. `undefined` outside a dashboard — **always call with `?.`**. See `.claude/docs/add-persistence.md`                                                                           |

## Data row ordering

`useExecuteQuery` always returns columns in **dimensions-first** order, regardless of the key order in `dataOptions`:

```text
row[0 … D-1]  → dimensions  (D = number of dimension inputs that have columns assigned)
row[D … end]  → measures
```

Example — if your `DataOptions` has `category` (1 dim) + `breakBy` (1 dim) + `value` (1 measure):

```tsx
const cat = row[0].text ?? String(row[0].data); // category (dim 0)
const breakBy = row[1].text ?? String(row[1].data); // breakBy  (dim 1)
const value = row[2].data as number; // value    (measure 0)
```

When accessing measure columns manually, use `dimensions.length + i` as the offset — `dimensions.length` from `extractDimensionsAndMeasures(dataOptions)` correctly accounts for all assigned dimension inputs, not just `category`.

## Adding an external npm library

Before installing any charting or visualization library, check these four things:

**1. Browser-safe?**
The plugin runs in the browser only. Reject any library that imports Node.js built-ins (`fs`, `path`, `crypto`, `stream`, etc.) at the top level. `d3`, `recharts`, `highcharts`, `plotly.js-dist-min`, and `echarts` are all browser-safe.

**2. TypeScript version compatible?**
The scaffold is pinned to `typescript: ~4.9.3`. Some modern `@types/*` packages use TypeScript 5 syntax. If type-check fails with `TS1139` or `TS1005` errors inside `node_modules/@types/`, see `.claude/docs/errors.md` for the fix (pin via `overrides` in `package.json`).

**3. `dependencies` vs `devDependencies`?**
The plugin is bundled by Vite — runtime libraries must be in `dependencies`, not `devDependencies`. Type packages (`@types/*`) belong in `devDependencies`.

```json
"dependencies": {
  "d3": "^7.9.0"
},
"devDependencies": {
  "@types/d3": "^7.4.3"
}
```

**4. Angular/Vue compatible?**
The cross-framework bundle aliases `react` → `preact/compat`. Libraries that use React DOM portals or call `ReactDOM.render()` directly will throw in Angular/Vue hosts. Recharts, D3, Highcharts, Plotly, and ECharts are all cross-framework safe.

## Constraints

- Style options are persisted as JSON — keep them serializable (no functions or class instances). The same applies to `customOptions`
- To persist runtime state (current page, selected tab) across reloads, use `onChange` + `useSyncedState` — see `.claude/docs/add-persistence.md`
- Plugin `name` must be unique; duplicate names are silently deduplicated at runtime
- Always provide defaults in Visualization — `styleOptions` starts as `{}` on first render

## AI commands

> The `/design-custom-widget` and `/deploy` commands require **Claude Code**. With other AI agents, describe your goal in plain language and reference the guides in `.claude/docs/` directly.

### Main flow

| Command                 | What it does                                                                                                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/design-custom-widget` | **Full implementation in one command.** Describe your goal — Claude asks a few questions then implements everything: data inputs, library install, chart code, resize observer, style controls, and type checks. No further commands needed. |
| `/deploy`               | Pre-flight checks then deploy to Sisense Fusion                                                                                                                                                                                              |

### Adding features to an existing plugin

Describe what you want in plain language — the AI reads the guides in `.claude/docs/` automatically. Common requests:

- "Add cross-filtering" → follows `.claude/docs/add-cross-filtering.md`
- "Add a style option for color / legend / font size" → follows `.claude/docs/add-style-prop.md`
- "Add a number format selector" → follows `.claude/docs/add-number-format.md`
- "Add a tooltip on hover" → follows `.claude/docs/add-tooltip.md`
- "Add a resize observer" → follows `.claude/docs/add-resize-observer.md`
- "Persist the current page / selected tab / state across reloads" → follows `.claude/docs/add-persistence.md`
- "Add a data input / remove a data input / rename an input" → follows `.claude/docs/add-data-input.md`, `remove-data-input.md`, `rename-input.md`
- "Generate a data model from my Sisense instance" → follows `.claude/docs/generate-model.md`

### Diagnostics

Ask the AI to "check for issues" or "debug the plugin" — it follows `.claude/docs/debug.md` to inspect all known failure patterns.

## Further reference

The `.claude/` folder contains additional reference material:

| File                                    | Contents                                                                                                         | When to read                                                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `.claude/docs/types-reference.md`       | All SDK types used in plugins with field-by-field docs                                                           | When working with `StyledColumn`, `DataPoint`, or SDK type shapes                                                      |
| `.claude/docs/hooks-reference.md`       | Every hook and utility available from `@sisense/sdk-ui`                                                          | Before calling `useExecuteQuery`, `useTheme`, or any SDK hook                                                          |
| `.claude/docs/errors.md`                | Common errors, their causes, and fixes                                                                           | When any error occurs — check here before diagnosing manually                                                          |
| `.claude/docs/visualization.md`         | Visualization component patterns, external libraries (Highcharts, Recharts, D3, Plotly)                          | Before implementing cross-filtering with Highcharts or Plotly                                                          |
| `.claude/docs/scaffold-chart.md`        | Full scaffold code for Recharts, Highcharts, D3, Plotly, plain React, and SDK built-in charts                    | When implementing a new chart component from scratch                                                                   |
| `.claude/docs/data-model.md`            | DM module structure, attribute types (Column vs DateDimension vs measure), dev-preview-props guidance            | Before generating a data model or writing `dev-preview-props.ts`                                                       |
| `.claude/docs/data-fetching.md`         | Data fetching patterns, result shape, and `buildHierarchy` for hierarchy charts                                  | When building circle packing, treemap, sunburst, or icicle charts — or before accessing `data.rows` for the first time |
| `.claude/docs/data-panel.md`            | Data panel configuration reference and chart-type → input naming table                                           | When choosing input names for a new chart type, or adding/removing/renaming inputs                                     |
| `.claude/docs/add-data-input.md`        | How to add a dimension or measure input across all plugin files                                                  | When adding a new data input                                                                                           |
| `.claude/docs/remove-data-input.md`     | How to remove a data input and clean up all references                                                           | When removing a data input                                                                                             |
| `.claude/docs/rename-input.md`          | How to rename a data input across all plugin files                                                               | When renaming a data input                                                                                             |
| `.claude/docs/design-panel.md`          | Design panel implementation patterns                                                                             | When adding style controls to `DesignPanel.tsx`                                                                        |
| `.claude/docs/add-style-prop.md`        | How to add a style option field and its matching design panel control                                            | When adding a style option                                                                                             |
| `.claude/docs/add-number-format.md`     | How to add a number format selector for measure values                                                           | When adding number formatting                                                                                          |
| `.claude/docs/event-handling.md`        | Cross-filtering and event handler reference                                                                      | Before wiring up `onDataPointClick` or multi-selection                                                                 |
| `.claude/docs/add-cross-filtering.md`   | Step-by-step implementation of outgoing click and incoming highlight blur                                        | When adding cross-filtering                                                                                            |
| `.claude/docs/add-tooltip.md`           | How to add a hover tooltip to data point elements                                                                | When adding a tooltip                                                                                                  |
| `.claude/docs/add-resize-observer.md`   | How to handle widget resize for D3 and Plotly                                                                    | When the chart doesn't resize with the widget                                                                          |
| `.claude/docs/add-persistence.md`       | How to persist runtime state (`styleOptions` / `customOptions`) across reloads via `onChange` + `useSyncedState` | When the widget should remember view-time state (current page, selected tab) across reloads                            |
| `.claude/docs/add-conditional-query.md` | How to skip the query until required inputs are filled, with a drop-prompt empty state                           | When preventing blank state on mount                                                                                   |
| `.claude/docs/generate-model.md`        | How to generate a TypeScript data model from a Sisense data source                                               | Before writing `dev-preview-props.ts` with real attribute names                                                        |
| `.claude/docs/check.md`                 | TypeScript, lint, format, and package placement checks                                                           | Before deploying or when diagnosing a silent failure                                                                   |
| `.claude/docs/debug.md`                 | 11 common runtime and type failure patterns with diagnostics                                                     | When the widget shows blank output, wrong values, or ignored clicks                                                    |
