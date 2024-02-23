import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { BasicMemberFilterTile as BasicMemberFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { BasicMemberFilterTileProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the BasicMemberFilterTile Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the BasicMemberFilterTile.
 *
 * @example
 * Here's how you can use the BasicMemberFilterTile component in a Vue application:
 * ```vue
 * <template>
 *   <BasicMemberFilterTile :props="basicMemberFilterTileProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import BasicMemberFilterTile from '@sisense/sdk-ui-vue/BasicMemberFilterTile';
 *
 * const basicMemberFilterTileProps = ref({
 *   // Configure your BasicMemberFilterTileProps here
 * });
 * </script>
 * ```
 * @internal
 */
export const BasicMemberFilterTile = defineComponent({
  props: {
    allMembers: Object as PropType<BasicMemberFilterTileProps['allMembers']>,
    initialSelectedMembers: Object as PropType<
      BasicMemberFilterTileProps['initialSelectedMembers']
    >,
    isDependent: Boolean as PropType<BasicMemberFilterTileProps['isDependent']>,
    maxAllowedMembers: Number as PropType<BasicMemberFilterTileProps['maxAllowedMembers']>,
    onUpdateSelectedMembers: Function as PropType<
      BasicMemberFilterTileProps['onUpdateSelectedMembers']
    >,
    shouldUpdateSelectedMembers: Boolean as PropType<
      BasicMemberFilterTileProps['shouldUpdateSelectedMembers']
    >,
    title: String as PropType<BasicMemberFilterTileProps['title']>,
  },
  setup: (props) => setupHelper(BasicMemberFilterTilePreact, props),
});
