import { MemberFilterTile as MemberFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { MemberFilterTileProps as MemberFilterTilePropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!MemberFilterTile | `MemberFilterTile`} component.
 */
export interface MemberFilterTileProps extends MemberFilterTilePropsPreact {}

/**
 * UI component that allows the user to select members to include/exclude in a
 * filter. A query is executed against the provided data source to fetch
 * all members that are selectable.
 *
 * @example
 * Below is an example for filtering countries in the `Country` dimension of the `Sample ECommerce` data model.
 * ```vue
 * <template>
 *       <MemberFilterTile
 *         :attribute="memberFilter.attribute"
 *         :onChange="memberFilter.onChange"
 *         :dataSource="memberFilter.dataSource"
 *         :title="memberFilter.title"
 *       />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { MemberFilterTile, type MemberFilterTileProps } from '@sisense/sdk-ui-vue';
 *
 * const memberFilterValue = ref<Filter | null>(null);
 *
 * const memberFilter = ref<MemberFilterTileProps>({
 *   dataSource: DM.DataSource,
 *   title: 'Member Filter',
 *   attribute: DM.DimProducts.ProductName,
 *   filter: memberFilterValue.value,
 *   onChange(filter) {
 *     memberFilterValue.value = filter;
 *   },
 * });
 *
 *
 * </script>
 * ```
 * <img src="media://vue-member-filter-tile-example.png" width="600px" />
 * @param props - MemberFilterTile props
 * @returns MemberFilterTile component
 * @group Filter Tiles
 */

export const MemberFilterTile = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.attribute}
     */
    attribute: {
      type: Object as PropType<MemberFilterTileProps['attribute']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.dataSource}
     */
    dataSource: [String, Object] as PropType<MemberFilterTileProps['dataSource']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.filter}
     */
    filter: {
      type: [Object, null] as PropType<MemberFilterTileProps['filter']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.onChange}
     */
    onChange: {
      type: Function as PropType<MemberFilterTileProps['onChange']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.parentFilters}
     */
    parentFilters: Object as PropType<MemberFilterTileProps['parentFilters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.title}
     */
    title: {
      type: String as PropType<MemberFilterTileProps['title']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.onDelete}
     */
    onDelete: Function as PropType<MemberFilterTileProps['onDelete']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.onEdit}
     */
    onEdit: Function as PropType<MemberFilterTileProps['onEdit']>,
  },
  setup: (props) => setupHelper(MemberFilterTilePreact, props),
});
