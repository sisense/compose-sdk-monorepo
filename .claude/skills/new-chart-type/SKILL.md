---
name: new-chart-type
description: Create a new restructured chart type in sdk-ui. Use when adding a new chart to the restructured charts architecture, scaffolding a ChartBuilder, or wiring up Highcharts-based chart types.
argument-hint: <chart-type-name>
disable-model-invocation: true
allowed-tools: Read Bash(yarn workspace @sisense/sdk-ui type-check)
---

# Create a New Restructured Chart Type

Chart type name: **$ARGUMENTS**

## Step 0: Read the architecture guides first

Read both guides in full before writing any code:

- `packages/sdk-ui/src/domains/visualizations/components/chart/restructured-charts/how-it-works.md`
- `packages/sdk-ui/src/domains/visualizations/components/chart/restructured-charts/highchart-based-charts/how-it-works.md`

Then decide: **Highcharts-based or custom-rendered?**
Most charts are Highcharts-based. Custom-rendered example: `areamap` (Leaflet-based map renderer).

---

## Path A: Custom renderer

```text
restructured-charts/
└── $ARGUMENTS-chart/
    ├── types.ts
    ├── $ARGUMENTS-chart-builder.ts
    ├── data-options/index.ts
    ├── data/index.ts
    ├── design-options/index.ts
    └── renderer/index.tsx
```

Reference implementation: `areamap-chart/`.

## Path B: Highcharts-based

```text
restructured-charts/highchart-based-charts/
└── <family>/               # cartesians/, categoricals/, or new family
    └── $ARGUMENTS-chart/
        ├── types.ts
        ├── $ARGUMENTS-chart-builder.ts
        ├── data-options/index.ts
        ├── data/index.ts
        ├── design-options/index.ts
        └── highchart-options/index.ts
```

Renderer: `createHighchartsBasedChartRenderer({ highchartsOptionsBuilder, getAlerts })` — no custom component needed.
Reference implementations: `line-chart/`, `column-chart/`.

---

## Files to update (both paths)

**1. `restructured-charts/types.ts`**

- Add `'$ARGUMENTS'` to `SupportedChartType` union
- Add conditional branches to all five `Typed*` mapped types: `TypedChartDataOptions`, `TypedDataOptionsInternal`, `TypedChartStyleOptions`, `TypedChartData`, `TypedChartRendererProps`

**2. `restructured-charts/utils.ts`**

- Add `'$ARGUMENTS'` to the `restructuredChartTypes` array in `isRestructuredChartType`

**3. `packages/sdk-ui/src/domains/visualizations/core/chart-options-processor/translations/types.ts`**

- Add `'$ARGUMENTS'` branch to `DesignOptions<SpecificChartType>` (exported from this module alongside related chart design option types)

**4. `chart-builder-factory.ts`**

- Import and register the new builder in `chartBuildersMap`

## Additional files (Highcharts path only)

**5. `highchart-based-charts/types.ts`** — add `'$ARGUMENTS'` to `HighchartBasedChartTypes` union

**6. `highchart-based-charts/highcharts-based-chart-renderer/utils.ts`** — add `'$ARGUMENTS'` to the `isHighchartsBasedChart` array

---

## Checklist

- [ ] All `Typed*` branches added to `restructured-charts/types.ts`
- [ ] `isRestructuredChartType` updated
- [ ] `DesignOptions` updated
- [ ] Builder registered in factory
- [ ] Highcharts-specific registration done (if applicable)
- [ ] Unit tests written for `data-options`, `data`, and `design-options` modules
- [ ] `yarn workspace @sisense/sdk-ui type-check` passes
