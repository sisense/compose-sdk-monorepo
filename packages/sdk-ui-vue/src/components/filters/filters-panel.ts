import { FiltersPanel as FiltersPanelPreact } from '@sisense/sdk-ui-preact';
import type {
  FiltersPanelConfig,
  FiltersPanelProps as FiltersPanelPropsPreact,
} from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/** Reexport related types */
export type { FiltersPanelConfig };

/**
 * Props of the {@link @sisense/sdk-ui-vue!FiltersPanel | `FiltersPanel`} component.
 */
export interface FiltersPanelProps extends FiltersPanelPropsPreact {}

/**
 * Filters panel component that renders a list of filter tiles
 *
 * @example
 * Here's how to render a filters panel with a set of filters.
 * ```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FiltersPanel } from '@sisense/sdk-ui-vue';
import { filterFactory, type Filter, type FilterRelations } from '@sisense/sdk-data';
import * as DM from '../assets/sample-ecommerce-model.js';

const filters = ref<Filter[]>([
  filterFactory.members(DM.Commerce.Gender, ['Male', 'Female']),
  filterFactory.members(DM.Commerce.AgeRange, ['0-18', '19-24']),
]);

const handleFiltersChange = (updatedFilters: Filter[] | FilterRelations) => {
  filters.value = updatedFilters as Filter[];
  console.log('Filters changed:', updatedFilters);
};
</script>

<template>
  <FiltersPanel
    :filters="filters"
    :defaultDataSource="DM.DataSource"
    :onFiltersChange="handleFiltersChange"
  />
</template>
 * ```
 * @param props - FiltersPanel props
 * @returns FiltersPanel component
 *
 * @group Filter Tiles
 */
export const FiltersPanel = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!FiltersPanelProps.filters}
     */
    filters: {
      type: [Array, Object] as PropType<FiltersPanelProps['filters']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!FiltersPanelProps.defaultDataSource}
     */
    defaultDataSource: [String, Object] as PropType<FiltersPanelProps['defaultDataSource']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FiltersPanelProps.dataSources}
     *
     * @internal
     */
    dataSources: Array as PropType<FiltersPanelProps['dataSources']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FiltersPanelProps.config}
     */
    config: Object as PropType<FiltersPanelProps['config']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FiltersPanelProps.onFiltersChange}
     */
    onFiltersChange: {
      type: Function as PropType<FiltersPanelProps['onFiltersChange']>,
      required: true,
    },
  },
  setup: (props) => setupHelper(FiltersPanelPreact, props),
});
