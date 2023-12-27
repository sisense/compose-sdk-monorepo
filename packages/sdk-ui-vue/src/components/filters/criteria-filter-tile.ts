import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { CriteriaFilterTile as CriteriaFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { CriteriaFilterTileProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the CriteriaFilterTile Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the CriteriaFilterTile.
 *
 * @example
 * Here's how you can use the CriteriaFilterTile component in a Vue application:
 * ```vue
 * <template>
 *   <CriteriaFilterTile :props="criteriaFilterTileProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import {CriteriaFilterTile} from '@sisense/sdk-ui-vue';
 *
 * const criteriaFilterTileProps = ref({
 *   // Configure your CriteriaFilterTileProps here
 * });
 * </script>
 * ```
 */
export const CriteriaFilterTile = defineComponent({
  props: {
    arrangement: Object as PropType<CriteriaFilterTileProps['arrangement']>,
    filter: Object as PropType<CriteriaFilterTileProps['filter']>,
    measures: Object as PropType<CriteriaFilterTileProps['measures']>,
    onUpdate: Function as PropType<CriteriaFilterTileProps['onUpdate']>,
    title: Object as PropType<CriteriaFilterTileProps['title']>,
  },

  setup: (props) => setupHelper(CriteriaFilterTilePreact, props),
});
