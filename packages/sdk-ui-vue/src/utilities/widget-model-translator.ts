import {
  widgetModelTranslator as widgetModelTranslatorPreact,
  type WidgetModel,
  type TextWidgetProps,
  type ExecutePivotQueryParams,
  type ExecuteQueryParams,
  type PivotTableWidgetProps,
} from '@ethings-os/sdk-ui-preact';
import type { ChartProps, PivotTableProps, TableProps } from '../components/charts';
import type { ChartWidgetProps } from '../components/widgets';

/**
 * Translates a {@link WidgetModel} to the parameters for executing a query for the widget.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, useExecuteQuery } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid',
});

const executeQueryParams = computed(() =>
  widgetModel.value
    ? widgetModelTranslator.toExecuteQueryParams(widgetModel.value)
    : { enabled: false },
);

const { data, isLoading, isError } = useExecuteQuery(executeQueryParams);
</script>
 * ```
 *
 * Note: this method is not supported for getting pivot query.
 * Use {@link toExecutePivotQueryParams} instead for getting query parameters for the pivot widget.
 */
export const toExecuteQueryParams = (widgetModel: WidgetModel): ExecuteQueryParams => {
  return widgetModelTranslatorPreact.toExecuteQueryParams(widgetModel);
};

/**
 * Translates a {@link WidgetModel} to the parameters for executing a query for the pivot widget.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, useExecuteQuery } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid',
});

const executePivotQueryParams = computed(() =>
  widgetModel.value ? widgetModelTranslator.toExecutePivotQueryParams(widgetModel.value): { enabled: false },
);

const { data, isLoading, isError } = useExecutePivotQuery(executePivotQueryParams);
</script>
 * ```
 *
 * Note: this method is supported only for getting pivot query.
 * Use {@link toExecuteQueryParams} instead for getting query parameters for non-pivot widgets.
 */
export const toExecutePivotQueryParams = (widgetModel: WidgetModel): ExecutePivotQueryParams => {
  return widgetModelTranslatorPreact.toExecutePivotQueryParams(widgetModel);
};

/**
 * Translates a {@link WidgetModel} to the props for rendering a chart.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, Chart } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid',
});

const chartProps = computed(() =>
  widgetModel.value ? widgetModelTranslator.toChartProps(widgetModel.value) : null,
);
</script>

<template>
  <Chart
    v-if="chartProps"
    :chartType="chartProps.chartType"
    :dataSet="chartProps.dataSet"
    :dataOptions="chartProps.dataOptions"
    :filters="chartProps.filters"
    :highlights="chartProps.highlights"
    :styleOptions="chartProps.styleOptions"
  />
</template>
 * ```
 *
 * Note: this method is not supported for pivot widgets.
 * Use {@link toPivotTableProps} instead for getting props for the {@link PivotTable}.
 */
export function toChartProps(widgetModel: WidgetModel): ChartProps {
  return widgetModelTranslatorPreact.toChartProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a table.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, Table } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid',
});

const tableProps = computed(() =>
  widgetModel.value ? widgetModelTranslator.toTableProps(widgetModel.value) : null,
);
</script>

<template>
  <Table
    v-if="tableProps"
    :dataSet="tableProps.dataSet"
    :dataOptions="tableProps.dataOptions"
    :filters="tableProps.filters"
    :styleOptions="tableProps.styleOptions"
  />
</template>
 * ```
 *
 * Note: this method is not supported for chart and pivot widgets.
 * Use {@link toChartProps} instead for getting props for the {@link Chart}.
 * Use {@link toPivotTableProps} instead for getting props for the {@link PivotTable}.
 */
export function toTableProps(widgetModel: WidgetModel): TableProps {
  return widgetModelTranslatorPreact.toTableProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a pivot table.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, PivotTable } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid',
});

const pivotTableProps = computed(() =>
  widgetModel.value ? widgetModelTranslator.toPivotTableProps(widgetModel.value) : null,
);
</script>

<template>
  <PivotTable
    v-if="pivotTableProps"
    :dataSet="pivotTableProps.dataSet"
    :dataOptions="pivotTableProps.dataOptions"
    :filters="pivotTableProps.filters"
    :styleOptions="pivotTableProps.styleOptions"
  />
</template>
 * ```
 *
 * Note: this method is not supported for chart or table widgets.
 * Use {@link toChartProps} instead for getting props for the {@link Chart}.
 * Use {@link toTableProps} instead for getting props for the {@link Table}.
 */
export function toPivotTableProps(widgetModel: WidgetModel): PivotTableProps {
  return widgetModelTranslatorPreact.toPivotTableProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a chart widget.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, ChartWidget } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid',
});

const chartWidgetProps = computed(() =>
  widgetModel.value ? widgetModelTranslator.toChartWidgetProps(widgetModel.value) : null,
);
</script>

<template>
  <ChartWidget
    v-if="chartWidgetProps"
    :chartType="chartWidgetProps.chartType"
    :dataSource="chartWidgetProps.dataSource"
    :dataOptions="chartWidgetProps.dataOptions"
    :filters="chartWidgetProps.filters"
    :highlights="chartWidgetProps.highlights"
    :styleOptions="chartWidgetProps.styleOptions"
  />
</template>
 * ```
 *
 * Note: this method is not supported for pivot widgets.
 */
export function toChartWidgetProps(widgetModel: WidgetModel): ChartWidgetProps {
  return widgetModelTranslatorPreact.toChartWidgetProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a pivot table widget.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid',
});

const pivotTableWidgetProps = computed(() =>
  widgetModel.value ? widgetModelTranslator.toPivotTableWidgetProps(widgetModel.value) : null,
);
</script>
 * ```
 *
 * Note: this method is not supported for chart or table widgets.
 * Use {@link toChartWidgetProps} instead for getting props for the {@link ChartWidget}.
 */
export function toPivotTableWidgetProps(widgetModel: WidgetModel): PivotTableWidgetProps {
  return widgetModelTranslatorPreact.toPivotTableWidgetProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a text widget.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid',
});

const textWidgetProps = computed(() =>
  widgetModel.value ? widgetModelTranslator.toTextWidgetProps(widgetModel.value) : null,
);
</script>
 * ```
 *
 * Note: this method is not supported for chart or pivot widgets.
 * Use {@link toChartWidgetProps} instead for getting props for the {@link ChartWidget}.
 * Use {@link toPivotTableWidgetProps} instead for getting props for the pivot table widget.
 */
export function toTextWidgetProps(widgetModel: WidgetModel): TextWidgetProps {
  return widgetModelTranslatorPreact.toTextWidgetProps(widgetModel);
}
