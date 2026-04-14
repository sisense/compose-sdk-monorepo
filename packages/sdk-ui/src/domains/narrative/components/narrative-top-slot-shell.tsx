import styled from '@emotion/styled';

import { Themable } from '@/infra/contexts/theme-provider/types.js';

/** Horizontal space before the AI icon in the default (interactive) narrative row. */
export const NARRATIVE_TOP_SLOT_LEADING_GUTTER_PX = 18;

/** Space after feedback controls (interactive) and plain narrative right inset. */
export const NARRATIVE_TOP_SLOT_TRAILING_GUTTER_PX = 12;

/** SVG width in {@link WidgetNarrativeInteractive} narrative row. */
const NARRATIVE_AI_ICON_WIDTH_PX = 0;

/** `gap` between icon and collapsible text in the narrative row. */
const NARRATIVE_ROW_ICON_TEXT_GAP_PX = 0;

const PLAIN_HORIZONTAL_PADDING_LEFT_PX =
  NARRATIVE_TOP_SLOT_LEADING_GUTTER_PX +
  NARRATIVE_AI_ICON_WIDTH_PX +
  NARRATIVE_ROW_ICON_TEXT_GAP_PX;

/**
 * Full-bleed chart panel styling for narrative content in a widget top slot,
 * so it visually continues into the chart content area (same colors, no gray gutters).
 *
 * Use `$horizontalInset` for plain narrative (no leading AI icon) so text aligns with the
 * interactive variant and sits off the container edge.
 *
 * @internal
 */
export const NarrativeTopSlotShell = styled.div<Themable & { $horizontalInset?: boolean }>`
  box-sizing: border-box;
  margin: 0;
  padding: ${({ $horizontalInset }) =>
    $horizontalInset
      ? `24px ${NARRATIVE_TOP_SLOT_TRAILING_GUTTER_PX}px 0 ${PLAIN_HORIZONTAL_PADDING_LEFT_PX}px`
      : '24px 0 0'};
  width: 100%;
  color: ${({ theme }) => theme.chart.textColor};
  background-color: ${({ theme }) => theme.chart.backgroundColor};
`;
