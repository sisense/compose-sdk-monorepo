# Pattern: TSDoc adaptation per framework

Start with the React source's TSDoc. Preserve tags verbatim; rewrite `@example` and narrative text for the target framework.

## Preserved tags (copy unchanged)

- `@group`
- `@shortDescription`
- `@beta`, `@alpha`, `@internal`, `@sisenseInternal`
- `@deprecated`, `@remarks`
- `@param` names (prose may need tweaks — e.g. "props" in React vs "params" in Vue composable)
- `@returns` (rewrite content if return shape differs)

## Opening line

Rewrite the first sentence to match the framework:

- React: "A React component used for..."
- Angular: "An Angular component used for..."
- Vue: "A Vue component used for..."

Same for hooks:

- React: "A React hook that..."
- Angular service method: "Executes <X>..." (drop "hook" — it's a method now)
- Vue composable: "A Vue composable that..."

## `@example` rewrites

### React (reference)

````
/**
 * @example
 * ```tsx
 * <Chart chartType="column" dataSet={DM.DataSource} dataOptions={{...}} />
 * ```
 */
````

### Angular

Split into HTML template + TypeScript class. Use `<csdk-*>` selector, `[prop]` for data binding, `(event)` for Output:

````
/**
 * @example
 * An example of using the `Chart` component:
 *
 * ```html
 * <!-- component.html -->
 * <csdk-chart
 *   [chartType]="chart.chartType"
 *   [dataSet]="chart.dataSet"
 *   [dataOptions]="chart.dataOptions"
 *   (dataPointClick)="onPointClick($event)"
 * />
 * ```
 *
 * ```ts
 * // component.ts
 * chart = {
 *   chartType: 'column' as ChartType,
 *   dataSet: DM.DataSource,
 *   dataOptions: { /* ... */ },
 * };
 * ```
 */
````

For service methods:

````
/**
 * @example
 * ```ts
 * const { data } = await this.queryService.executeCsvQuery({
 *   dataSource: DM.DataSource,
 *   dimensions: [DM.Commerce.AgeRange],
 *   measures: [measureFactory.sum(DM.Commerce.Revenue)],
 * });
 * ```
 */
````

### Vue

Use `<script setup lang="ts">` + `<template>` with `:prop` binding:

````
/**
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { Chart } from '@sisense/sdk-ui-vue';
 * import type { ChartProps } from '@sisense/sdk-ui-vue';
 *
 * const chartProps = ref<ChartProps>({
 *   chartType: 'column',
 *   dataSet: DM.DataSource,
 *   dataOptions: { /* ... */ },
 * });
 * </script>
 *
 * <template>
 *   <Chart
 *     :chartType="chartProps.chartType"
 *     :dataSet="chartProps.dataSet"
 *     :dataOptions="chartProps.dataOptions"
 *   />
 * </template>
 * ```
 */
````

For composables:

````
/**
 * @example
 * ```ts
 * const { data, isLoading } = useExecuteCsvQuery({
 *   dataSource: DM.DataSource,
 *   dimensions: [DM.Commerce.AgeRange],
 *   measures: [measureFactory.sum(DM.Commerce.Revenue)],
 * });
 * ```
 */
````

## Narrative prose

If the React TSDoc references "hook", "React component", "JSX", "ReactNode", or "children prop", rewrite the corresponding sentence for each target. Keep the rest of the prose.

## iframes

React sources sometimes have playground iframes. Drop such iframes, but mention it in result summary.

## Don't

- Do not copy React `@example` verbatim into Angular/Vue — `<Chart prop={...}/>` won't compile.
- Do not invent new `@group` values. If the React source has `@group Charts`, use `@group Charts` everywhere.
- Do not remove `@beta`/`@alpha` — stability tags must propagate.
