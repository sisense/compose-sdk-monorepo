import { RelativeDateFilterTile as RelativeDateFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { RelativeDateFilterTileProps as RelativeDateFilterTilePropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!RelativeDateFilterTile | `RelativeDateFilterTile`} component.
 */
export interface RelativeDateFilterTileProps extends RelativeDateFilterTilePropsPreact {}

/**
 * Relative Date Filter Tile component for filtering data by relative date.
 *
 * @example
 * Vue example of configuring the date min max values and handling onUpdate event.
 * ```vue
 * <template>
 *   <RelativeDateFilterTile
 *     :title="relativeDateFilter.title"
 *     :filter="relativeDateFilter.filter"
 *     :arrangement="relativeDateFilter.arrangement"
 *     :onUpdate="relativeDateFilter.onUpdate"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { RelativeDateFilterTile, type RelativeDateFilterTileProps } from '@sisense/sdk-ui-vue';
 * import { filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 *
 * const relativeDateFilterValue = ref<Filter | null>(filterFactory.dateRelativeTo(DM.DimDate.Date.Months, 0, 18);
 *
 * const relativeDateFilter = ref<RelativeDateFilterTileProps>({
 *   title: 'Relative Date Filter Tile',
 *   filter: relativeDateFilterValue.value!,
 *   arrangement: 'vertical',
 *   onUpdate(filter) {
 *     relativeDateFilterValue.value = filter;
 *   },
 * });
 * </script>
 * ```
 * <img src="media://vue-relative-date-filter-tile-example.png" width="800px" />
 * @param props - RelativeDateFilterTile props
 * @returns RelativeDateFilterTile component
 * @group Filter Tiles
 */
export const RelativeDateFilterTile = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.title}
     */
    title: {
      type: String as PropType<RelativeDateFilterTileProps['title']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.filter}
     */
    filter: {
      type: Object as PropType<RelativeDateFilterTileProps['filter']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.arrangement}
     */
    arrangement: String as PropType<RelativeDateFilterTileProps['arrangement']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.onUpdate}
     */
    onUpdate: {
      type: Function as PropType<RelativeDateFilterTileProps['onUpdate']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.limit}
     */
    limit: Object as PropType<RelativeDateFilterTileProps['limit']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.tileDesignOptions}
     * @internal
     */
    tileDesignOptions: Object as PropType<RelativeDateFilterTileProps['tileDesignOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.onDelete}
     */
    onDelete: Function as PropType<RelativeDateFilterTileProps['onDelete']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.onEdit}
     */
    onEdit: Function as PropType<RelativeDateFilterTileProps['onEdit']>,
  },
  setup: (props) => setupHelper(RelativeDateFilterTilePreact, props),
});
