import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ContextMenu as ContextMenuPreact } from '@sisense/sdk-ui-preact';
import type { ContextMenuProps } from '@sisense/sdk-ui-preact';
import { setupHelperWithChildren } from '../setup-helper';

/**
 * `ContextMenu` component from the `@sisense/sdk-ui-vue` package.
 * This component provides a context menu that can be customized with different items and sections.
 * It allows for flexible positioning and can be easily integrated into Vue applications.
 *
 * @example
 * Here's how to use the `ContextMenu` component:
 * ```vue
 * <template>
 *   <ContextMenu :closeContextMenu="closeMenu" :itemSections="sections" :position="menuPosition">
 *   </ContextMenu>
 * </template>
 *
 * <script>
 * import { ref } from 'vue';
 * import ContextMenu from './ContextMenu.vue';
 *
 * export default {
 *   components: { ContextMenu },
 *   setup() {
 *     const sections = ref([...]);
 *     const menuPosition = ref({ top: 0, left: 0 });
 *     const closeMenu = () => {};
 *    }
 * };
 * </script>
 * ```
 *
 * @prop {Function} closeContextMenu - Function to close the context menu. It should be a function that sets the visibility of the context menu to false.
 * @prop {Array} itemSections - An array of sections, each containing an array of items to be rendered in the context menu. Each item can be a string or an object specifying the item's properties.
 * @prop {Object} position - An object specifying the position of the context menu. It should contain `top` and `left` properties to position the menu on the screen.
 * @group Drilldown
 */
export const ContextMenu = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!ContextMenuProps.closeContextMenu}
     */
    closeContextMenu: Function as PropType<ContextMenuProps['closeContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ContextMenuProps.itemSections}
     */
    itemSections: Array as PropType<ContextMenuProps['itemSections']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ContextMenuProps.position}
     */
    position: Object as PropType<ContextMenuProps['position']>,
  },
  setup: (props, { slots }) => setupHelperWithChildren(ContextMenuPreact, props, slots, []),
});
