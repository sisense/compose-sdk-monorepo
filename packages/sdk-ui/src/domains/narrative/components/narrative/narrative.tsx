import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import Markdown from 'markdown-to-jsx';

import { getBaseDateFnsLocale } from '@/domains/visualizations/core/chart-data-processor/data-table-date-period';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import type { Themable } from '@/infra/contexts/theme-provider/types';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { formatDate } from '@/infra/formatting/format-date';
import Tooltip from '@/modules/ai/common/tooltip';
import { LoadingOverlay } from '@/shared/components/loading-overlay';
import { WarningIcon } from '@/shared/icons/warning-icon.js';
import { XCircleIcon } from '@/shared/icons/x-circle-icon.js';

import { NarrativeGenerateIcon } from '../narrative-generate-icon.js';
import { InsightCard } from './insight-card.js';
import { NARRATIVE_MARKDOWN_OPTIONS } from './narrative-markdown.js';
import type { NarrativeData, NarrativeErrorKind, NarrativeProps } from './types.js';

/** The PRD allows at most three insights; anything beyond is not drawn. */
const MAX_INSIGHTS = 3;

/** Spacing lifted from the reference design. */
const GAP_PX = 16;
const FOOTER_GAP_PX = 4;
const INSIGHT_GAP_PX = 24;

/** The design's Responsiveness frame keeps the insights in a row at a widget this wide. */
const INSIGHTS_ROW_MIN_WIDGET_PX = 600;

/** The widget card's left + right 1px borders, sitting between the widget edge and `Body`. */
const CARD_BORDERS_PX = 2;

/**
 * Content-box width below which the insights stop sharing a row, so a narrow widget stays
 * readable. The `@container` query measures `Body`'s content box, which is the design's
 * 600 px widget minus the card borders and `Body`'s own side padding; the row must survive
 * at exactly that width, so stacking starts strictly below it.
 */
const INSIGHTS_STACK_BREAKPOINT_PX = INSIGHTS_ROW_MIN_WIDGET_PX - CARD_BORDERS_PX - 2 * GAP_PX;

/** Mark size from the design. */
const ICON_PX = 16;

/** One of the SDK's locale-aware masks: short date plus time. */
const TIMESTAMP_MASK = 'short';

/**
 * Formats a generation timestamp in the conventions of the given language.
 * @remarks
 * `formatDate` falls back to en-US unless a locale is passed, so the active translation language is
 * resolved explicitly.
 * @param generatedAt - ISO 8601 timestamp.
 * @param language - Active translation language, e.g. `de-DE`.
 * @returns The formatted timestamp.
 * @internal
 */
export function formatNarrativeTimestamp(
  generatedAt: string,
  language: string | undefined,
): string {
  return formatDate(generatedAt, TIMESTAMP_MASK, { locale: getBaseDateFnsLocale(language) });
}

const Body = styled.div<Themable>`
  box-sizing: border-box;
  container: narrative / inline-size;
  display: flex;
  flex-direction: column;
  gap: ${GAP_PX}px;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: ${GAP_PX}px ${GAP_PX}px ${FOOTER_GAP_PX}px;
  overflow-x: hidden;
  overflow-y: hidden;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.typography.primaryTextColor};
  font-size: 13px;
  line-height: 16px;
`;

const Overview = styled.div`
  overflow-wrap: break-word;

  strong,
  b {
    font-weight: 700;
  }
`;

const InsightRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${INSIGHT_GAP_PX}px;

  @container narrative (width < ${INSIGHTS_STACK_BREAKPOINT_PX}px) {
    flex-direction: column;
    gap: ${GAP_PX}px;
  }
`;

/**
 * The generated text; the only part of the widget that scrolls. Takes the room the footer leaves,
 * so the footer stays pinned to the bottom edge whatever the content height.
 */
const Content = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${GAP_PX}px;
  min-height: 0;
  overflow-y: auto;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${FOOTER_GAP_PX}px;
`;

const FooterDivider = styled.div<Themable>`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.widget.borderColor};
  opacity: 0.5;
`;

const FooterRow = styled.div<Themable>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${GAP_PX}px;
  flex-wrap: wrap;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.typography.secondaryTextColor};
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${GAP_PX / 2}px;
  margin-left: auto;
`;

/** Hosts the shared loading overlay, which positions itself absolutely inside its parent. */
const LoadingArea = styled.div`
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
`;

const Centered = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${FOOTER_GAP_PX}px;
  min-height: 0;
  text-align: center;
`;

/** Mark and title on one line, per the design's error states. */
const ErrorHeading = styled.div`
  display: flex;
  align-items: center;
  gap: ${FOOTER_GAP_PX}px;

  svg {
    flex-shrink: 0;
  }
`;

const ErrorTitle = styled.div`
  font-weight: 600;
`;

const Muted = styled.div<Themable>`
  color: ${({ theme }) => theme.typography.secondaryTextColor};
  line-height: 18px;
`;

/**
 * Text colour follows the body text — `general.buttons.*` tokens are not dark-theme-aware, so on a
 * dark theme they would leave the label unreadable. The resting fill is deliberately none (the design
 * draws an outline); hover and focus paint the design system's state layer, 8% of the text colour.
 */
const ActionButton = styled.button<Themable>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid ${({ theme }) => theme.widget.borderColor};
  border-radius: 4px;
  background-color: transparent;
  color: ${({ theme }) => theme.typography.primaryTextColor};
  font: inherit;
  font-size: 13px;
  cursor: pointer;

  &:hover:not(:disabled),
  &:focus-visible {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const QuotaNote = styled.div<Themable>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.typography.secondaryTextColor};
  font-size: 11px;
  line-height: 16px;
`;

/** Scales the shared 18px warning mark down to this widget's 16px marks. */
const QuotaIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;

  svg {
    width: ${ICON_PX}px;
    height: ${ICON_PX}px;
  }
`;

/**
 * Renders the primary action: the sparkle mark plus a label.
 * @param props - Component props.
 * @param props.label - Button text.
 * @param props.onClick - Called when the button is clicked.
 * @param props.disabled - Whether the button is inert.
 * @returns The action button.
 * @internal
 */
function GenerateButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { themeSettings } = useThemeContext();

  return (
    <ActionButton
      theme={themeSettings}
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid="csdk-narrative-generate"
    >
      <NarrativeGenerateIcon size={ICON_PX} />
      {label}
    </ActionButton>
  );
}

/**
 * Warns that the AI allowance is nearly spent: spelled out (`inline`) beneath the idle action, a mark
 * with a tooltip (`tooltip`) beside the footer action.
 * @param props - Component props.
 * @param props.usagePercentage - Share of the allowance already used, in percent.
 * @param props.presentation - Whether the message is spelled out or shown on hover.
 * @returns The warning.
 * @internal
 */
function QuotaWarning({
  usagePercentage,
  presentation,
}: {
  usagePercentage: number;
  presentation: 'inline' | 'tooltip';
}) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();

  const message = t('narrativeWidget.creditsUsed', {
    usagePercentage,
    interpolation: { escapeValue: false },
  });

  if (presentation === 'tooltip') {
    return (
      <Tooltip title={message}>
        <QuotaIcon data-testid="csdk-narrative-quota-warning">
          <WarningIcon />
        </QuotaIcon>
      </Tooltip>
    );
  }

  return (
    <QuotaNote theme={themeSettings} data-testid="csdk-narrative-quota-warning">
      <QuotaIcon>
        <WarningIcon />
      </QuotaIcon>
      {message}
    </QuotaNote>
  );
}

/**
 * Renders the generated narrative: summary, up to three insights, then provenance and the
 * regenerate action.
 * @param props - Component props.
 * @param props.data - The narrative to render.
 * @param props.quotaWarning - Near-limit credit warning, when one applies.
 * @param props.onGenerate - Requests regeneration.
 * @returns The ready-state body.
 * @internal
 */
function ReadyBody({
  data,
  quotaWarning,
  onGenerate,
}: { data: NarrativeData } & Pick<NarrativeProps, 'quotaWarning' | 'onGenerate'>) {
  const { t, i18n } = useTranslation();
  const { themeSettings } = useThemeContext();

  return (
    <>
      <Content data-testid="csdk-narrative-content">
        <Overview data-testid="csdk-narrative-overview">
          <Markdown options={NARRATIVE_MARKDOWN_OPTIONS}>{data.overview}</Markdown>
        </Overview>

        {data.insights.length > 0 && (
          <InsightRow data-testid="csdk-narrative-insights">
            {data.insights.slice(0, MAX_INSIGHTS).map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </InsightRow>
        )}
      </Content>

      <Footer data-testid="csdk-narrative-footer">
        <FooterDivider theme={themeSettings} />
        <FooterRow theme={themeSettings}>
          <span>{t('narrativeWidget.disclaimer')}</span>
          <FooterActions>
            <span data-testid="csdk-narrative-timestamp">
              {t('narrativeWidget.updatedAt', {
                timestamp: formatNarrativeTimestamp(data.generatedAt, i18n.language),
                // React already escapes; i18next escaping would turn date separators into entities.
                interpolation: { escapeValue: false },
              })}
            </span>
            <GenerateButton
              label={t('narrativeWidget.regenerate')}
              onClick={onGenerate}
              disabled={quotaWarning?.exceeded}
            />
            {quotaWarning && (
              <QuotaWarning usagePercentage={quotaWarning.usagePercentage} presentation="tooltip" />
            )}
          </FooterActions>
        </FooterRow>
      </Footer>
    </>
  );
}

/**
 * Renders a failure state. Only `failed` offers an action — its copy asks the reader to try again;
 * retrying cannot help `no-data`, and `quota-exceeded` is out of the reader's hands.
 * @param props - Component props.
 * @param props.kind - Which failure to describe.
 * @param props.onGenerate - Requests a retry.
 * @returns The error-state body.
 * @internal
 */
function ErrorBody({
  kind,
  onGenerate,
}: Pick<NarrativeProps, 'onGenerate'> & { kind: NarrativeErrorKind }) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();

  if (kind === 'quota-exceeded') {
    return (
      <Centered data-testid="csdk-narrative-error" data-error-kind={kind}>
        <ErrorHeading>
          <XCircleIcon />
          <ErrorTitle>{t('ai.quota.exceededErrorTitle')}</ErrorTitle>
        </ErrorHeading>
        <Muted theme={themeSettings}>{t('ai.quota.exceededErrorDescription')}</Muted>
      </Centered>
    );
  }

  const isNoData = kind === 'no-data';

  return (
    <Centered data-testid="csdk-narrative-error" data-error-kind={kind}>
      <ErrorHeading>
        {isNoData ? <WarningIcon /> : <XCircleIcon />}
        <ErrorTitle>
          {isNoData ? t('narrativeWidget.noDataTitle') : t('narrativeWidget.failedTitle')}
        </ErrorTitle>
      </ErrorHeading>
      <Muted theme={themeSettings}>
        {isNoData ? t('narrativeWidget.noDataDescription') : t('narrativeWidget.failedDescription')}
      </Muted>
      {!isNoData && <GenerateButton label={t('narrativeWidget.retry')} onClick={onGenerate} />}
    </Centered>
  );
}

/**
 * Renders the content area of the dashboard narrative widget.
 * @remarks
 * Presentational — every outcome arrives through {@link NarrativeProps.state}. The surrounding
 * container and header (title, copy action, three-dot menu) belong to the host widget.
 * @param props - Dashboard narrative props.
 * @returns The content for the current state.
 * @internal
 */
export const Narrative = asSisenseComponent({
  componentName: 'Narrative',
  shouldSkipSisenseContextWaiting: true,
})(function Narrative({
  state,
  quotaWarning,
  onGenerate,
  showLoadingOverlay = true,
}: NarrativeProps) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();

  return (
    <Body theme={themeSettings} data-testid="csdk-narrative">
      {state.status === 'loading' && (
        <LoadingArea data-testid="csdk-narrative-loading">
          {showLoadingOverlay && <LoadingOverlay />}
        </LoadingArea>
      )}

      {state.status === 'ready' && (
        <ReadyBody data={state.data} quotaWarning={quotaWarning} onGenerate={onGenerate} />
      )}

      {state.status === 'error' && <ErrorBody kind={state.kind} onGenerate={onGenerate} />}

      {state.status === 'idle' && (
        <Centered data-testid="csdk-narrative-idle">
          <GenerateButton label={t('narrativeWidget.generate')} onClick={onGenerate} />
          {quotaWarning && (
            <QuotaWarning usagePercentage={quotaWarning.usagePercentage} presentation="inline" />
          )}
        </Centered>
      )}
    </Body>
  );
});
