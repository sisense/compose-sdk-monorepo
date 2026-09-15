import styled from '@emotion/styled';
import Markdown from 'markdown-to-jsx';

import { useThemeContext } from '@/infra/contexts/theme-provider';

import { NARRATIVE_MARKDOWN_OPTIONS } from './narrative-markdown.js';
import { NarrativeStatusIcon } from './status-icon.js';
import type { NarrativeInsight, NarrativeInsightStatus } from './types.js';

/**
 * Sentiment palette from the design, not `colors.semantic` — the shared success token is teal where the
 * design calls for green. Neutral is the body text colour and comes from the theme, so it stays legible
 * on dark themes.
 * @internal
 */
const STATUS_COLORS: Record<Exclude<NarrativeInsightStatus, 'neutral'>, string> = {
  positive: '#12b76a',
  negative: '#d12d04',
};

const GAP_ICON_TO_TEXT_PX = 8;

const Row = styled.div`
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  align-items: flex-start;
  gap: ${GAP_ICON_TO_TEXT_PX}px;
`;

/** Emphasis adopts the sentiment colour; the surrounding prose stays in the body colour. */
const Text = styled.div<{ $accent: string }>`
  flex: 1 1 0;
  min-width: 0;
  overflow-wrap: break-word;

  strong,
  b {
    font-weight: 700;
    color: ${({ $accent }) => $accent};
  }
`;

/**
 * Renders one narrative insight: a status mark and a sentence whose figures are emphasised.
 * @remarks
 * Markdown is limited to emphasis — the sentence originates from a language model, so markup must stay inert.
 * @param props - Component props.
 * @param props.insight - The insight to render.
 * @returns The insight card.
 * @internal
 */
export function InsightCard({ insight }: { insight: NarrativeInsight }) {
  const { themeSettings } = useThemeContext();
  const accent =
    insight.status === 'neutral'
      ? themeSettings.typography.primaryTextColor
      : STATUS_COLORS[insight.status];

  return (
    <Row data-testid="csdk-narrative-insight" data-status={insight.status}>
      <span style={{ color: accent, display: 'flex' }}>
        <NarrativeStatusIcon status={insight.status} />
      </span>
      <Text $accent={accent}>
        <Markdown options={NARRATIVE_MARKDOWN_OPTIONS}>{insight.text}</Markdown>
      </Text>
    </Row>
  );
}
