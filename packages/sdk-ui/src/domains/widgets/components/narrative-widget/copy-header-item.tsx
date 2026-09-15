import { NarrativeCopyButton } from '@/domains/narrative/components/narrative';
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
 * @param options - The text the action copies.
 * @param options.copyText - The narrative as plain text with formatting preserved.
 * @returns The header item.
 * @internal
 */
export const createNarrativeCopyItem = ({ copyText }: { copyText: string }): WidgetHeaderItem => ({
  id: NARRATIVE_COPY_ITEM_ID,
  position: { type: 'auto' },
  component: () => <NarrativeCopyButton copyText={copyText} />,
});
