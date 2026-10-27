import {
  type PointerEvent,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import Markdown from 'markdown-to-jsx';

import { getBaseDateFnsLocale } from '@/domains/visualizations/core/chart-data-processor/data-table-date-period';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import type { Themable } from '@/infra/contexts/theme-provider/types';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { formatDate } from '@/infra/formatting/format-date';
import Tooltip from '@/modules/ai/common/tooltip';
import { LoadingOverlay } from '@/shared/components/loading-overlay';
import { useElementHeight } from '@/shared/hooks/use-element-height';
import { WarningIcon } from '@/shared/icons/warning-icon.js';
import { XCircleIcon } from '@/shared/icons/x-circle-icon.js';
import { applyOpacity } from '@/shared/utils/color/index.js';

import { NarrativeGenerateIcon } from '../narrative-generate-icon.js';
import { InsightCard } from './insight-card.js';
import { NARRATIVE_MARKDOWN_OPTIONS } from './narrative-markdown.js';
import type { NarrativeData, NarrativeErrorKind, NarrativeProps } from './types.js';

/** Insights sharing one row; more wrap onto further rows. */
const INSIGHTS_PER_ROW = 3;

/** Spacing lifted from the reference design. */
const GAP_PX = 16;
const FOOTER_GAP_PX = 4;
/** Divider to the footer row, and the footer row to the card's bottom edge. */
const FOOTER_EDGE_PX = 8;
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

/** The design hides the AI context hint on a widget narrower than this. */
const AI_CONTEXT_HINT_MIN_WIDGET_PX = 650;

/** Content-box width below which the AI context hint is hidden, measured as for the insights row. */
const AI_CONTEXT_HINT_BREAKPOINT_PX = AI_CONTEXT_HINT_MIN_WIDGET_PX - CARD_BORDERS_PX - 2 * GAP_PX;

/** Mark size from the design. */
const ICON_PX = 16;

/** Box of the error states' leading mark in the design. */
const ERROR_MARK_BOX_PX = 24;

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

const Body = styled.div<Themable & { hasFooter: boolean }>`
  position: relative;
  box-sizing: border-box;
  container: narrative / inline-size;
  display: flex;
  flex-direction: column;
  gap: ${GAP_PX}px;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: ${GAP_PX}px ${GAP_PX}px ${({ hasFooter }) => (hasFooter ? FOOTER_EDGE_PX : GAP_PX)}px;
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

const InsightRow = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  align-items: start;
  column-gap: ${INSIGHT_GAP_PX}px;
  row-gap: ${GAP_PX}px;

  @container narrative (width < ${INSIGHTS_STACK_BREAKPOINT_PX}px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/**
 * The generated text; the only part of the widget that scrolls. Takes the room the footer leaves,
 * so the footer stays pinned to the bottom edge whatever the content height.
 */
const Content = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
`;

/** The generated text at its natural height, measured to size the widget to it. */
const ContentFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${GAP_PX}px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${FOOTER_EDGE_PX}px;
`;

// Translucent through its colour, never `opacity`: older html2canvas builds, which host image exports
// use, carry an element's opacity over to everything painted after it.
const FooterDivider = styled.div<Themable>`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => applyOpacity(theme.widget.borderColor, 0.5)};
`;

// One line at any width: the disclaimer gives way, the timestamp and actions never wrap.
const FooterRow = styled.div<Themable>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${GAP_PX}px;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.typography.secondaryTextColor};
`;

const FooterActions = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${GAP_PX / 2}px;
  margin-left: auto;
  white-space: nowrap;
`;

const DisclaimerText = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type FooterDisclaimerProps = {
  /** Disclaimer text. */
  text: string;
};

/**
 * The disclaimer, cut with an ellipsis when the row is too narrow; the full text shows on hover.
 * @param props - Component props.
 * @returns The disclaimer element.
 */
function FooterDisclaimer(props: FooterDisclaimerProps) {
  const { text } = props;
  const [isTruncated, setIsTruncated] = useState(false);
  const measure = (event: PointerEvent<HTMLSpanElement>) => {
    const { scrollWidth, clientWidth } = event.currentTarget;
    setIsTruncated(scrollWidth > clientWidth);
  };
  return (
    <Tooltip title={isTruncated ? text : ''}>
      <DisclaimerText data-testid="csdk-narrative-disclaimer" onPointerEnter={measure}>
        {text}
      </DisclaimerText>
    </Tooltip>
  );
}

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
  min-height: 0;
  text-align: center;
`;

/** What `Centered` centres, at its natural height, measured to size the widget to it. */
const CenteredStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${FOOTER_GAP_PX}px;
`;

/** The error states' message block, then the action 16px below it, per the design. */
const ErrorStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${GAP_PX}px;
`;

/** Heading and description of an error state. */
const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${FOOTER_GAP_PX}px;
`;

/** Mark and title on one line, per the design's error states. */
const ErrorHeading = styled.div`
  display: flex;
  align-items: center;
  gap: ${FOOTER_GAP_PX}px;
`;

/** The design's 24px box around the 18px error marks. */
const ErrorMark = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${ERROR_MARK_BOX_PX}px;
  height: ${ERROR_MARK_BOX_PX}px;
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
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
  min-height: 28px;
  padding: 4px 16px;
  border: 1px solid color-mix(in srgb, currentColor 50%, transparent);
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

// Anchors the AI context hint to the content's top-right corner, so the arrow stays under the host
// header's three-dot menu whatever the widget width. Hidden by visibility, not display, while it would
// crowd the generate action, so it can still be measured.
const AiContextHintArea = styled.div<Themable & { isCrowded: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  color: ${({ theme }) => theme.typography.secondaryTextColor};
  pointer-events: none;
  visibility: ${({ isCrowded }) => (isCrowded ? 'hidden' : 'visible')};

  @container narrative (width < ${AI_CONTEXT_HINT_BREAKPOINT_PX}px) {
    display: none;
  }
`;

const AiContextHintText = styled.div`
  position: absolute;
  top: 17px;
  right: 52px;
  font-size: 13px;
  line-height: 16px;
  text-align: center;
  white-space: nowrap;

  strong {
    font-weight: 600;
  }
`;

const AiContextHintArrow = styled.svg`
  position: absolute;
  top: 8px;
  right: 18px;
`;

/**
 * Whether two boxes come closer than `gap` side by side while sharing a horizontal band. Boxes
 * with no size, such as hidden or not yet laid out ones, never crowd anything.
 * @param a - One box.
 * @param b - The other box.
 * @param gap - Least horizontal distance that keeps them apart.
 * @returns `true` when they are too close.
 */
function isCrowding(a: DOMRect, b: DOMRect, gap: number): boolean {
  if (a.width === 0 || b.width === 0) return false;
  const sharesBand = a.top < b.bottom && b.top < a.bottom;
  return sharesBand && a.left < b.right + gap && b.left < a.right + gap;
}

type AiContextHintProps = {
  /** The idle action stack; its first child is the generate action the hint must keep clear of. */
  actions: RefObject<HTMLElement | null>;
};

/**
 * Suggests adding AI context, with an arrow up to the three-dot menu that offers it. Hidden while its
 * text would come closer than the design's gap to the generate action — a long translation on a
 * widget just above the width breakpoint.
 * @param props - Component props.
 * @returns The hint.
 * @internal
 */
function AiContextHint(props: AiContextHintProps) {
  const { actions } = props;
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const areaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isCrowded, setIsCrowded] = useState(false);

  useLayoutEffect(() => {
    const text = textRef.current;
    // The narrative body: resizing it moves both the hint and the action.
    const body = areaRef.current?.parentElement;
    // The stack: a quota line joining or leaving it moves the action without resizing it.
    const stack = actions.current;
    const action = stack?.firstElementChild;
    if (!text || !body || !stack || !action) return;
    const measure = () =>
      setIsCrowded(
        isCrowding(text.getBoundingClientRect(), action.getBoundingClientRect(), GAP_PX),
      );
    measure();
    const observer = new ResizeObserver(measure);
    [body, text, stack, action].forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [actions]);

  return (
    <AiContextHintArea
      ref={areaRef}
      theme={themeSettings}
      isCrowded={isCrowded}
      data-testid="csdk-narrative-ai-context-hint"
    >
      <AiContextHintText ref={textRef}>
        <Trans t={t} i18nKey="narrativeWidget.aiContextHint" />
      </AiContextHintText>
      <AiContextHintArrow
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 34C17 32.5 28.8 25 31.5 3M28 6.5L31.5 3L35 6.5" />
      </AiContextHintArrow>
    </AiContextHintArea>
  );
}

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
      <NarrativeGenerateIcon size={ICON_PX} trimmed />
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

type ReadyBodyProps = Pick<NarrativeProps, 'quotaWarning' | 'onGenerate' | 'showActions'> & {
  /** The narrative to render. */
  data: NarrativeData;
  /** Receives the generated text at its natural height. */
  contentRef?: Ref<HTMLDivElement>;
  /** Receives the footer. */
  footerRef?: Ref<HTMLDivElement>;
};

/**
 * Renders the generated narrative: summary, the insights three to a row, then provenance and the
 * regenerate action.
 * @param props - Component props.
 * @returns The ready-state body.
 * @internal
 */
function ReadyBody(props: ReadyBodyProps) {
  const { data, quotaWarning, onGenerate, showActions = true, contentRef, footerRef } = props;
  const { t, i18n } = useTranslation();
  const { themeSettings } = useThemeContext();

  return (
    <>
      <Content data-testid="csdk-narrative-content">
        <ContentFlow ref={contentRef}>
          <Overview data-testid="csdk-narrative-overview">
            <Markdown options={NARRATIVE_MARKDOWN_OPTIONS}>{data.overview}</Markdown>
          </Overview>

          {data.insights.length > 0 && (
            <InsightRow
              data-testid="csdk-narrative-insights"
              columns={Math.min(data.insights.length, INSIGHTS_PER_ROW)}
            >
              {data.insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </InsightRow>
          )}
        </ContentFlow>
      </Content>

      <Footer data-testid="csdk-narrative-footer" ref={footerRef}>
        <FooterDivider theme={themeSettings} />
        <FooterRow theme={themeSettings}>
          <FooterDisclaimer text={t('narrativeWidget.disclaimer')} />
          <FooterActions>
            <span data-testid="csdk-narrative-timestamp">
              {t('narrativeWidget.updatedAt', {
                timestamp: formatNarrativeTimestamp(data.generatedAt, i18n.language),
                // React already escapes; i18next escaping would turn date separators into entities.
                interpolation: { escapeValue: false },
              })}
            </span>
            {showActions && (
              <GenerateButton
                label={t('narrativeWidget.regenerate')}
                onClick={onGenerate}
                disabled={quotaWarning?.exceeded}
              />
            )}
            {quotaWarning && (
              <QuotaWarning usagePercentage={quotaWarning.usagePercentage} presentation="tooltip" />
            )}
          </FooterActions>
        </FooterRow>
      </Footer>
    </>
  );
}

type ErrorBodyProps = Pick<NarrativeProps, 'onGenerate' | 'showActions'> & {
  /** Which failure to describe. */
  kind: NarrativeErrorKind;
  /** Receives the centred content at its natural height. */
  contentRef?: Ref<HTMLDivElement>;
};

/**
 * Renders a failure state. Only `failed` offers an action — its copy asks the reader to try again;
 * retrying cannot help `no-data`, and `quota-exceeded` is out of the reader's hands.
 * @param props - Component props.
 * @returns The error-state body.
 * @internal
 */
function ErrorBody(props: ErrorBodyProps) {
  const { kind, onGenerate, showActions = true, contentRef } = props;
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();

  if (kind === 'quota-exceeded') {
    return (
      <Centered data-testid="csdk-narrative-error" data-error-kind={kind}>
        <ErrorStack ref={contentRef}>
          <ErrorMessage>
            <ErrorHeading>
              <ErrorMark>
                <XCircleIcon />
              </ErrorMark>
              <ErrorTitle>{t('ai.quota.exceededErrorTitle')}</ErrorTitle>
            </ErrorHeading>
            <Muted theme={themeSettings}>{t('ai.quota.exceededErrorDescription')}</Muted>
          </ErrorMessage>
        </ErrorStack>
      </Centered>
    );
  }

  const isNoData = kind === 'no-data';

  return (
    <Centered data-testid="csdk-narrative-error" data-error-kind={kind}>
      <ErrorStack ref={contentRef}>
        <ErrorMessage>
          <ErrorHeading>
            <ErrorMark>{isNoData ? <WarningIcon /> : <XCircleIcon />}</ErrorMark>
            <ErrorTitle>
              {isNoData ? t('narrativeWidget.noDataTitle') : t('narrativeWidget.failedTitle')}
            </ErrorTitle>
          </ErrorHeading>
          <Muted theme={themeSettings}>
            {isNoData
              ? t('narrativeWidget.noDataDescription')
              : t('narrativeWidget.failedDescription')}
          </Muted>
        </ErrorMessage>
        {!isNoData && showActions && (
          <GenerateButton label={t('narrativeWidget.retry')} onClick={onGenerate} />
        )}
      </ErrorStack>
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
  aiContextHint = false,
  onGenerate,
  showLoadingOverlay = true,
  showActions = true,
  onNaturalHeightChange,
}: NarrativeProps) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const { ref: observeContent, height: contentHeight } = useElementHeight<HTMLDivElement>();
  const { ref: footerRef, height: footerHeight } = useElementHeight<HTMLDivElement>();
  const contentNode = useRef<HTMLDivElement | null>(null);
  const contentRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentNode.current = node;
      observeContent(node);
    },
    [observeContent],
  );

  const { status } = state;
  useEffect(() => {
    if (status === 'loading' || contentHeight === 0 || !onNaturalHeightChange) return;
    // `scrollHeight`, not the box: inline text can overhang its line box by a pixel, and that
    // pixel would bring back the scrollbar.
    const content = Math.max(contentHeight, contentNode.current?.scrollHeight ?? 0);
    // The design's paddings: 16 above everything; the ready state keeps 16 before its footer and 8
    // below it, the centred states 16 below.
    const natural =
      status === 'ready'
        ? GAP_PX + content + GAP_PX + footerHeight + FOOTER_EDGE_PX
        : GAP_PX + content + GAP_PX;
    onNaturalHeightChange(Math.ceil(natural));
  }, [status, contentHeight, footerHeight, onNaturalHeightChange]);

  return (
    <Body theme={themeSettings} hasFooter={status === 'ready'} data-testid="csdk-narrative">
      {state.status === 'loading' && (
        <LoadingArea data-testid="csdk-narrative-loading">
          {showLoadingOverlay && <LoadingOverlay />}
        </LoadingArea>
      )}

      {state.status === 'ready' && (
        <ReadyBody
          data={state.data}
          quotaWarning={quotaWarning}
          onGenerate={onGenerate}
          showActions={showActions}
          contentRef={contentRef}
          footerRef={footerRef}
        />
      )}

      {state.status === 'error' && (
        <ErrorBody
          kind={state.kind}
          onGenerate={onGenerate}
          showActions={showActions}
          contentRef={contentRef}
        />
      )}

      {state.status === 'idle' && (
        <Centered data-testid="csdk-narrative-idle">
          <CenteredStack ref={contentRef}>
            {showActions && (
              <GenerateButton label={t('narrativeWidget.generate')} onClick={onGenerate} />
            )}
            {quotaWarning && (
              <QuotaWarning usagePercentage={quotaWarning.usagePercentage} presentation="inline" />
            )}
          </CenteredStack>
        </Centered>
      )}

      {/* After the action stack: the hint measures it in a layout effect, which runs once its ref is set. */}
      {state.status === 'idle' && showActions && aiContextHint && (
        <AiContextHint actions={contentNode} />
      )}
    </Body>
  );
});
