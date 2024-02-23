import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { MemberFilterTile as MemberFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { MemberFilterTileProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * UI component that allows the user to select members to include/exclude in a
 * filter. A query is executed against the provided data source to fetch
 * all members that are selectable.
 *
 * @example
 * Below is an example for filtering countries in the `Country` dimension of the `Sample ECommerce` data model.
 * ```vue
 * <template>
 * <MemberFilterTile
 *   :title="memberFilterTileProps.title"
 *   :attribute="memberFilterTileProps.attribute"
 *   :filter="memberFilterTileProps.filter"
 *   :onChange={setCountryFilter}
 * />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import MemberFilterTile from '@sisense/sdk-ui-vue/MemberFilterTile';
 *
 * const memberFilterTileProps = ref({
 *   title: 'Country',
 *   attribute: DM.Country.Country,
 *   filter: countryFilter,
 * });
 *
 * const setCountryFilter = (filter: Filter | null) => {...}
 *
 * </script>
 * ```
 */

export const MemberFilterTile = defineComponent({
  props: {
    attribute: Object as PropType<MemberFilterTileProps['attribute']>,
    dataSource: Object as PropType<MemberFilterTileProps['dataSource']>,
    filter: Object as PropType<MemberFilterTileProps['filter']>,
    onChange: Function as PropType<MemberFilterTileProps['onChange']>,
    parentFilters: Object as PropType<MemberFilterTileProps['parentFilters']>,
    title: Object as PropType<MemberFilterTileProps['title']>,
  },
  setup: (props) => setupHelper(MemberFilterTilePreact, props),
});
