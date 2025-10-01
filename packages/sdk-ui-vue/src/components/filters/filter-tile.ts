import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { FilterTile as FilterTilePreact } from '@ethings-os/sdk-ui-preact';
import type { FilterTileProps as FilterTilePropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!FilterTile | `FilterTile`} component.
 */
export interface FilterTileProps extends FilterTilePropsPreact {}

/**
 * UI component that renders a filter tile based on filter type
 *
 * @example
 * Here’s how to render a filter model as a filter tile.
 * ```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FilterTile } from '@ethings-os/sdk-ui-vue';
import { filterFactory, type Filter } from '@ethings-os/sdk-data';
import * as DM from '../assets/sample-ecommerce-model.js';

const filter = ref<Filter>(filterFactory.members(DM.Commerce.Gender, ['Male', 'Female']));
const handleFilterChange = (updatedFilter: Filter | null) => {
  if (updatedFilter) {
    filter.value = updatedFilter;
  }
};
</script>

<template>
  <FilterTile :filter="filter" :onChange="handleFilterChange" />
</template>
 * ```
 * <img src="media://vue-filter-tile-example.png" width="225px" />
 * @param props - FilterTile props
 * @returns FilterTile component
 * @group Filter Tiles
 * @shortDescription Facade component rendering a filter tile based on filter type
 */
export const FilterTile = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!FilterTileProps.filter}
     */
    filter: {
      type: Object as PropType<FilterTileProps['filter']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!FilterTileProps.defaultDataSource}
     */
    defaultDataSource: [String, Object] as PropType<FilterTileProps['defaultDataSource']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!FilterTileProps.onChange}
     */
    onChange: {
      type: Function as PropType<FilterTileProps['onChange']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!FilterTileProps.onDelete}
     */
    onDelete: Function as PropType<FilterTileProps['onDelete']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!FilterTileProps.onEdit}
     */
    onEdit: Function as PropType<FilterTileProps['onEdit']>,
  },
  setup: (props) => setupHelper(FilterTilePreact, props),
});
