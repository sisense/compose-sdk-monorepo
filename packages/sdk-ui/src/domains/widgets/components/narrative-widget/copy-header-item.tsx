import {
  NarrativeCopyButton,
  type NarrativeCopyButtonProps,
} from '@/domains/narrative/components/narrative';
import type { WidgetHeaderItem } from '@/domains/widgets/shared/widget-header/types';

/**
 * Id of the copy action's header item.
 * @internal
 */
export const NARRATIVE_COPY_ITEM_ID = 'narrative-copy';

/**
 * Builds the header item that copies the generated narrative to the clipboard.
 *
 * Placed at the start of the trailing group, before the header menu.
 * @param options - The text the action copies and the callback fired after a copy.
 * @returns The header item.
 * @internal
 */
export const createNarrativeCopyItem = (options: NarrativeCopyButtonProps): WidgetHeaderItem => ({
  id: NARRATIVE_COPY_ITEM_ID,
  position: { type: 'auto' },
  component: () => <NarrativeCopyButton {...options} />,
});
