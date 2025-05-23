import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { GetNlgInsights as GetNlgInsightsPreact } from '@sisense/sdk-ui-preact/ai';
import type { GetNlgInsightsProps as GetNlgInsightsPropsPreact } from '@sisense/sdk-ui-preact/ai';
import { createDefaultContextConnectors, setupHelper } from '../../helpers/setup-helper';
import { createAiContextConnector } from '../helpers/context-connectors';

/**
 * Props of the {@link @sisense/sdk-ui-vue!GetNlgInsights | `GetNlgInsights`} component.
 */
export interface GetNlgInsightsProps extends GetNlgInsightsPropsPreact {}

/**
 * A Vue component that fetches and displays a collapsible analysis of the provided query using natural language generation (NLG).
 * Specifying a query is similar to providing parameters to a {@link @sisense/sdk-ui-vue!useExecuteQuery | `useExecuteQuery`} composable, using dimensions, measures, and filters.
 *
 * @example
 * Here's how you can use the GetNlgInsights component in a Vue application:
 * ```vue
<script setup lang="ts">
import { GetNlgInsights, type GetNlgInsightsProps } from '@sisense/sdk-ui-vue/ai';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from '../assets/sample-retail-model';

const props: GetNlgInsightsProps = {
  dataSource: DM.DataSource.title,
  dimensions: [DM.DimProducts.CategoryName],
  measures: [measureFactory.sum(DM.DimProducts.Price)],
};
</script>

<template>
  <GetNlgInsights
    :dataSource="props.dataSource"
    :dimensions="props.dimensions"
    :measures="props.measures"
  />
</template>
 * ```
 * <img src="media://vue-get-nlg-insights-example.png" width="700"/>
 *
 * @param props - {@link GetNlgInsightsProps}
 * @returns Collapsible container wrapping a text summary
 * @group Generative AI
 */
export const GetNlgInsights = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.dataSource}
     */
    dataSource: {
      type: [String, Object] as PropType<GetNlgInsightsProps['dataSource']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.dimensions}
     */
    dimensions: Array as PropType<GetNlgInsightsProps['dimensions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.measures}
     */
    measures: Array as PropType<GetNlgInsightsProps['measures']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.filters}
     */
    filters: [Array, Object] as PropType<GetNlgInsightsProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.verbosity}
     */
    verbosity: String as PropType<GetNlgInsightsProps['verbosity']>,
  },
  setup: (props) =>
    setupHelper(GetNlgInsightsPreact, props, [
      ...createDefaultContextConnectors(),
      createAiContextConnector(),
    ]),
});
