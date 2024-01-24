import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ContextMenu as ContextMenuPreact } from '@sisense/sdk-ui-preact';
import type { ContextMenuProps } from '@sisense/sdk-ui-preact';
import { setupHelperWithChildren } from '../setup-helper';

export const ContextMenu = defineComponent({
  props: {
    closeContextMenu: Function as PropType<ContextMenuProps['closeContextMenu']>,
    itemSections: Array as PropType<ContextMenuProps['itemSections']>,
    position: Object as PropType<ContextMenuProps['position']>,
  },
  setup: (props, { slots }) => setupHelperWithChildren(ContextMenuPreact, props, slots, []),
});
