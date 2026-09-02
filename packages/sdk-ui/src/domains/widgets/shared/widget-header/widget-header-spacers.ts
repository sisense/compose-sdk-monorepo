import { HeaderItem, HeaderItemFill } from '@/domains/shared/header';
import { AlignmentTypes } from '@/types';

import { WidgetHeaderTargets } from './widget-header-targets.js';

/**
 * The `fill` of the two spacers that surround the title, for each title alignment.
 *
 * The title itself takes its content width, so its position in the row is decided entirely by which
 * of the surrounding spacers absorbs the free width:
 *
 * ```text
 * Left    [ Title ][ ←── Spacer ──→ ][ actions ]
 * Center  [ ←─ TitleAlignmentSpacer ─→ ][ Title ][ ←── Spacer ──→ ][ actions ]
 * Right   [ ←─ TitleAlignmentSpacer ─→ ][ Title ][ actions ]
 * ```
 *
 * A spacer that isn't absorbing anything stays in the header as a zero-width item (`content`)
 * rather than being dropped, so `before`/`after` positions anchored to it keep resolving to the same
 * spot whatever the alignment is.
 */
const TITLE_ALIGNMENT_FILLS: Record<
  AlignmentTypes,
  { titleAlignmentSpacer: HeaderItemFill; spacer: HeaderItemFill }
> = {
  Left: { titleAlignmentSpacer: 'content', spacer: 'grow' },
  Center: { titleAlignmentSpacer: 'grow', spacer: 'grow' },
  Right: { titleAlignmentSpacer: 'grow', spacer: 'content' },
};

/**
 * Resolves the alignment case-insensitively and falls back to `Left`.
 *
 * `titleAlignment` reaches the header from user style options, where the pre-existing behavior
 * (`type.toLowerCase()`) accepted a differently-cased value; keeping that tolerance means a
 * `'center'` style option still centers the title instead of silently falling back.
 */
const resolveAlignment = (alignment: AlignmentTypes): AlignmentTypes =>
  (Object.keys(TITLE_ALIGNMENT_FILLS) as AlignmentTypes[]).find(
    (known) => known.toLowerCase() === String(alignment).toLowerCase(),
  ) ?? 'Left';

/**
 * Builds the pair of spacer items that position the title, for the given title alignment.
 *
 * @param alignment - The resolved `titleAlignment` (style options, falling back to the theme).
 * @returns The leading and trailing spacer items.
 */
export const createWidgetHeaderSpacerItems = (
  alignment: AlignmentTypes,
): { titleAlignmentSpacerItem: HeaderItem; spacerItem: HeaderItem } => {
  const fills = TITLE_ALIGNMENT_FILLS[resolveAlignment(alignment)];
  return {
    titleAlignmentSpacerItem: {
      id: WidgetHeaderTargets.TitleAlignmentSpacer,
      fill: fills.titleAlignmentSpacer,
      component: () => null,
    },
    spacerItem: {
      id: WidgetHeaderTargets.Spacer,
      fill: fills.spacer,
      component: () => null,
    },
  };
};
