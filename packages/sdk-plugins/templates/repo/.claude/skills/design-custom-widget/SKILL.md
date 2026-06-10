---
name: design-custom-widget
description: Use when the developer describes a visualization goal or asks to build or implement a chart. Reads current plugin state, asks clarifying questions, then implements everything: data inputs, library install, chart code, cross-filtering, resize handling, style controls, and type checks. No further commands needed after this.
argument-hint: <visualization description>
allowed-tools: Bash(npm install *) Bash(npm run *) Bash(npx tsc *) Bash(npx @sisense/sdk-cli *) Read Write Edit
---

# Build a visualization

$ARGUMENTS

---

## Step 1 — Read current plugin state

Before asking any questions or writing any code, read the following files (skip gracefully if a file does not yet exist):

- `src/index.tsx` — data panel inputs, plugin name, requiredApiVersion
- `src/types.ts` — DataOptions and StyleOptions field names and types
- `src/components/Visualization.tsx` — which library is used, which hook, what state is handled
- `src/dev-preview-props.ts` — which model is imported, current dataOptions shape
- The model file currently imported in `dev-preview-props.ts` (e.g. `dev/models/sample-ecommerce.ts`) — note which tables and columns are available

Also read `.env.local` if it exists and note `VITE_APP_SISENSE_URL` and `VITE_APP_SISENSE_TOKEN`.

If none of the `src/` files exist (brand new project), assume `category` (dimension, maxItems 1) and `value` (measure, maxItems 1) as starting defaults.

---

## Step 2 — Ask clarifying questions

Check which of the questions below are already answered by what you read or by the developer's request. Only ask the ones that remain unanswered. Ask all remaining questions at once — do not start implementing until you have all answers.

1. **What does the visualization show?** Plain language description — e.g. "a bar chart showing sales by product category", "a KPI card with a single revenue number", "a circle packing chart of product hierarchy sized by revenue". _(Skip if already described.)_

2. **Will users click data points to cross-filter other dashboard widgets?** _(Default: yes for interactive chart types; no for KPI cards and tables if not mentioned.)_

3. **Charting library preference?** Options: Recharts, Highcharts, D3, Plotly, ECharts, Chart.js — or no external library (plain React for KPI cards, tables, layouts; or wrapping a built-in SDK chart). Say "recommend one" to let me choose. _(Skip if the library was named in the request.)_

4. **Will users configure visual styling** (colors, font size, labels on/off, etc.) from the widget editor sidebar? If yes, list the options. _(Default: no style options if not mentioned.)_

5. **Data source assessment** — work through the following decision tree. This may produce a question to ask the developer, or it may produce no question at all.

   **A — User named a specific data source** (e.g. "using Sample Healthcare", "from the Sales cube"):
   The user has explicitly chosen a model. Do not ask whether to load it — just prepare to generate it in Step 4h.
   Ask for credentials only if either is missing from `.env.local`:

   > "To generate the `[data source name]` model I'll need your Sisense URL and credentials. What's the instance URL, and do you have an API token or prefer username/password?"

   **B — User did not name a data source, and the current model can serve the visualization**:
   Check whether the current model (read in Step 1) has columns that can reasonably fill each required data input. The default `sample-ecommerce` model covers categories, revenue, cost, quantity, dates, gender, age, brand, country — it works for most bar, line, area, pie, scatter, KPI, and table charts. If a good mapping exists, skip this question entirely and use the current model as-is.

   **C — User did not name a data source, and the current model cannot serve the visualization**:
   The current model is missing data the chart fundamentally needs (e.g. a Gantt chart needs two separate date columns per task; a patient flow chart needs admission/discharge records; a geo bubble map needs lat/lon coordinates). Inform the developer and offer to load a different model:

   > "The current `[model name]` model doesn't have [what's missing — be specific, e.g. 'separate start and end date columns per activity']. To build an accurate dev preview I'd need to load a different data source. Would you like to connect one? If yes, tell me the data source name and I'll also need the Sisense URL and credentials if they're not already configured."

   If the developer declines, use the closest available columns from the current model and note the mismatch in the final summary.

---

## Step 3 — Derive the implementation plan (internal — do not show to developer)

Before writing any code, reason through:

**Data inputs** — derive names and cardinality from the canonical table in `.claude/docs/data-panel.md` ("Choosing inputs for your chart type"). Examples:

- Bar/line (single series): `x` (dimension, maxItems 1), `value` (measure, maxItems 1)
- Hierarchy: `path` (dimension, no `maxItems`), `value` (measure, maxItems 1)

Apply `maxItems` and `minItems` rules as specified in that file.

**Library selection** (if developer said "recommend"):

| Goal                                           | Recommended library     | Reason                                          |
| ---------------------------------------------- | ----------------------- | ----------------------------------------------- |
| KPI card, stat tile, text-based, table         | None — plain React      | Zero bundle cost                                |
| Wrapping an existing SDK chart                 | None — use the built-in | Inherits filtering and styling automatically    |
| Standard bar / line / area / pie               | Recharts                | Easiest React integration; cross-framework safe |
| Finance / scientific / 3D / unusual types      | Highcharts              | Most chart types; requires a license            |
| Custom SVG, layouts, hierarchy, force-directed | D3                      | Full DOM control                                |
| Interactive (zoom, pan, selection boxes)       | Plotly                  | Built-in interactivity                          |
| Large datasets (100k+ rows), animations        | ECharts                 | Fastest canvas renderer                         |

**Features to include** — decide based on answers:

| Feature                 | Include when                                                                 |
| ----------------------- | ---------------------------------------------------------------------------- |
| Conditional query guard | Almost always — prevents blank state before required inputs are filled       |
| Cross-filtering         | Developer said yes                                                           |
| Tooltip on hover        | Requested, or implied by an interactive chart type                           |
| Resize observer         | D3 or Plotly (both require it); Recharts and Highcharts handle it internally |
| Number formatting       | Developer wants decimal/currency control from the sidebar                    |
| Design panel controls   | Developer said yes to style options                                          |

**External library checklist** (if using one):

- Browser-safe: no Node.js built-ins at the top level
- TypeScript compatibility: scaffold is pinned to `typescript: ~4.9.3` — if `@types/*` packages use TS5 syntax, add an `overrides` entry in `package.json` to pin them (see `.claude/docs/errors.md`)
- Put the library in `dependencies`, `@types/*` in `devDependencies`

---

## Step 4 — Implement everything

After the developer answers the questions above, implement all of the following in order. Do not begin until all questions are answered. Do not ask the developer to run any commands — do it all.

### 4a. Data inputs

Read the current inputs from `src/index.tsx`. For each mismatch with the derived inputs:

- **Rename**: update the `name` field in `src/index.tsx`, the key in `DataOptions` in `src/types.ts`, and every reference in `src/components/Visualization.tsx` and `src/dev-preview-props.ts`
- **Add**: add the input entry to `dataPanel.config.inputs` in `src/index.tsx` and the corresponding typed field to `DataOptions` in `src/types.ts`
- **Remove**: remove the input entry and clean up all references across `src/types.ts`, `src/components/Visualization.tsx`, and `src/dev-preview-props.ts`

### 4b. Install the library (if external)

Run `npm install` with the correct packages:

- Runtime library → `dependencies`
- Type packages → `devDependencies`

### 4c. Scaffold the visualization

Write `src/components/Visualization.tsx` using the patterns from `.claude/docs/scaffold-chart.md` for the chosen library. Always include:

- `extractDimensionsAndMeasures` + `useExecuteQuery` + `formatDataSet` data flow
- `enabled` guard so the query does not fire until required inputs are filled
- Loading and empty-data states
- `highlights` passed to `useExecuteQuery` even without cross-filtering

For hierarchy charts (D3 pack/treemap/sunburst): use the `buildHierarchy` pattern from `.claude/docs/data-fetching.md`.

### 4d. Add cross-filtering (if requested)

Follow the patterns in `.claude/docs/add-cross-filtering.md`:

- Outgoing: build a `DataPoint` with `attribute` set and call `onDataPointClick?.(point, e.nativeEvent)` on click
- Incoming: read `cell.blur` per row and apply ~0.25 opacity to dimmed rows

### 4e. Add resize observer (if D3 or Plotly)

Follow `.claude/docs/add-resize-observer.md`. D3 and Plotly do not reflow automatically — without this the chart will not resize when the widget is resized in a dashboard.

### 4f. Add style props (if requested)

For each style option the developer listed, follow `.claude/docs/add-style-prop.md`:

- Add the field to `StyleOptions` in `src/types.ts`
- Add a control to `src/components/DesignPanel.tsx` (always spread `styleOptions` when calling `onChange`)
- Read the value in `src/components/Visualization.tsx` with a fallback default

### 4g. Add number formatting (if requested)

Follow `.claude/docs/add-number-format.md` to add a number format selector for the relevant measure column.

### 4h. Update dev preview

The approach depends on what was determined in Step 2 question 5:

---

#### Path A / B — Use the current model (no generation needed)

The currently imported model already has what's needed. Do not run the CLI.

Read the model file (already done in Step 1) and map each `DataOptions` key to a semantically appropriate column:

```ts
// src/dev-preview-props.ts — keep the existing import, update dataOptions only
import * as DM from '@models/sample-ecommerce';

// or whatever is currently imported

export const devPreviewProps = {
  dataSource: DM.DataSource,
  dataOptions: {
    // pick columns that fit the input semantics
    // For DateDimension columns, always use a granularity level:
    //   date: [{ column: DM.Commerce.Date.Months }]
    // For measures, wrap with measureFactory:
    //   value: [{ column: measureFactory.sum(DM.Commerce.Revenue) }]
  },
  filters: [],
  highlights: [],
  styleOptions: {},
};
```

Never invent column names — only use names that exist in the model file you already read.

---

#### Path A / C — Generate a new model (user named a different source, or confirmed after gap prompt)

**1. Derive the output path**

Convert the data source name to kebab-case and place it in `dev/models/`:

```
"Sample Healthcare" → dev/models/sample-healthcare.ts
"My Sales Data"     → dev/models/my-sales-data.ts
```

**2. Run the CLI**

Use credentials from `.env.local` if available; otherwise use what the developer provided. Choose the command matching the auth method:

```bash
# API token
npx @sisense/sdk-cli get-data-model \
  --url <sisense-url> \
  --token <token> \
  --dataSource "<data-source-name>" \
  --output dev/models/<kebab-name>.ts

# Web Access Token
npx @sisense/sdk-cli get-data-model \
  --url <sisense-url> \
  --wat <wat> \
  --dataSource "<data-source-name>" \
  --output dev/models/<kebab-name>.ts

# Username / password (CLI prompts for password interactively)
npx @sisense/sdk-cli get-data-model \
  --url <sisense-url> \
  --username "<username>" \
  --dataSource "<data-source-name>" \
  --output dev/models/<kebab-name>.ts
```

If the CLI fails (wrong credentials, unreachable instance, data source not found), report the error clearly and ask the developer to provide corrected values. Do not fall back to guessing column names.

**3. Read the generated model**

After the CLI succeeds, read `dev/models/<kebab-name>.ts` to understand:

- Which tables and columns exist
- Which are plain `Attribute` (text/numeric) vs `DateDimension` (requires a granularity level like `.Days`)
- Which numeric columns suit `measureFactory` aggregations

**4. Update `src/dev-preview-props.ts`**

Replace the previous model import and update `dataOptions` with real columns:

```ts
import * as DM from '@models/<kebab-name>';
// newly generated model
import { measureFactory } from '@sisense/sdk-data';

// only if measures are used

export const devPreviewProps = {
  dataSource: DM.DataSource,
  dataOptions: {
    // Use actual column names from the generated model.
    // For DateDimension: DM.Table.DateCol.Days (never pass the DateDimension itself)
    // For measures:      measureFactory.sum(DM.Table.NumericCol)
  },
  filters: [],
  highlights: [],
  styleOptions: {},
};
```

---

### 4i. Verify

Run `npx tsc --noEmit` and `npm run lint:fix`. Fix any errors before reporting done.

---

## What to tell the developer when done

Give a short summary:

- What was built and which library was used
- Which features were included (cross-filtering, resize, style controls, etc.)
- Which data source and columns the dev preview is wired to (or note any column mismatch if the developer declined a different model)
- How to start the dev server: `npm run dev` → http://localhost:3000
- What to do next: run `npm run dev` to preview (data is wired via `dev-preview-props.ts`); verify the chart renders, then run `npm run deploy` when ready
