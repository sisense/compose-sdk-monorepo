import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { CriteriaFilterTile as CriteriaFilterTilePreact } from '@ethings-os/sdk-ui-preact';
import type { CriteriaFilterTileProps as CriteriaFilterTilePropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!CriteriaFilterTile | `CriteriaFilterTile`} component.
 */
export interface CriteriaFilterTileProps extends CriteriaFilterTilePropsPreact {}

/**
 * UI component that allows the user to filter numeric or text attributes according to
 * a number of built-in operations defined in the numeric filter, text filter, or ranking filter.
 *
 * The arrangement prop determines whether the filter is rendered vertically or horizontally, with the latter intended for toolbar use and omitting title, enable/disable, and collapse/expand functionality.
 *
 * @example
 * Here's how you can use the CriteriaFilterTile component in a Vue application:
 * ```vue
 * <template>
 *   <CriteriaFilterTile
 *     :title="criteriaFilterTileProps.title"
 *     :filter="criteriaFilterTileProps.filter"
 *     :onUpdate="onUpdate"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { CriteriaFilterTile } from '@ethings-os/sdk-ui-vue';
 * import { filterFactory } from '@ethings-os/sdk-data';
 *
 * const criteriaFilterTileProps = ref({
 *  title: 'Revenue',
 *  filter: filterFactory.greaterThanOrEqual(DM.Commerce.Revenue, 10000)
 * });
 *
 * const onUpdate = (filter: Filter | null) => {
 *  ...
 * }
 * </script>
 * ```
 * <img src="media://vue-criteria-filter-tile-example.png" width="600px" />
 * @param props - Criteria filter tile props
 * @returns Criteria filter tile component
 * @group Filter Tiles
 */
export const CriteriaFilterTile = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.arrangement}
     */
    arrangement: String as PropType<CriteriaFilterTileProps['arrangement']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.filter}
     */
    filter: {
      type: Object as PropType<CriteriaFilterTileProps['filter']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.measures}
     */
    measures: Array as PropType<CriteriaFilterTileProps['measures']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.onUpdate}
     */
    onUpdate: {
      type: Function as PropType<CriteriaFilterTileProps['onUpdate']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.title}
     */
    title: {
      type: String as PropType<CriteriaFilterTileProps['title']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.onDelete}
     */
    onDelete: Function as PropType<CriteriaFilterTileProps['onDelete']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.onEdit}
     */
    onEdit: Function as PropType<CriteriaFilterTileProps['onEdit']>,
  },

  setup: (props) => setupHelper(CriteriaFilterTilePreact, props),
});
