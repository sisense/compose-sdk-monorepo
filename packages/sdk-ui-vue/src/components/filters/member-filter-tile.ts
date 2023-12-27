import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { MemberFilterTile as MemberFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { MemberFilterTileProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the MemberFilterTile Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the MemberFilterTile.
 *
 * @example
 * Here's how you can use the MemberFilterTile component in a Vue application:
 * ```vue
 * <template>
 *   <MemberFilterTile :props="memberFilterTileProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import MemberFilterTile from '@sisense/sdk-ui-vue/MemberFilterTile';
 *
 * const memberFilterTileProps = ref({
 *   // Configure your MemberFilterTileProps here
 * });
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
