import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLineHeight } from '@/domains/narrative/hooks/use-line-height';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import ErrorBoundaryBox from '@/infra/error-boundary/error-boundary-box';
import { LoadingOverlay } from '@/shared/components/loading-overlay';

type CollapsibleProps = {
  text: string;
  /**
   * Overrides default `Collapsed Lines` count with an explicit pixel value, snapped to whole text rows
   * internally. Treated as a max-height cap unless `reserveCollapsedHeight` is true.
   */
  maxCollapsedHeightPx?: number;
  /**
   * Maximum height of the expanded state in pixels.
   * Content scrolls rather than exceeding this limit. No cap when omitted.
   */
  maxExpandedHeightPx?: number;
  /**
   * When true the component always occupies exactly `collapsedHeight` pixels even when
   * text is shorter — prevents widget layout shifts during data loads.
   * Defaults to false (`max-height` behaviour, container shrinks to content).
   */
  reserveCollapsedHeight?: boolean;
  /** Disables collapsing entirely. */
  noCollapse?: boolean;
  /**
   * Shows a loading overlay at the settled collapsed height.
   * Only renders `LoadingOverlay` (which requires SisenseContext) when this is `true`.
   */
  isLoading?: boolean;
  /** Shows an error state instead of content. */
  isError?: boolean;
  /** Fired when the collapsed state toggles. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
  /** Additional CSS class applied to the text container. */
  textClassName?: string;
  /**
   * When true, renders an AI disclaimer line below the narrative text.
   * The disclaimer is always visible (not clipped when collapsed) but its height is
   * subtracted from the available text area so the total component height stays within
   * the configured limit. Defaults to false.
   */
  showDisclaimer?: boolean;
};

/** Matches `ai-xs` line height in theme; used as the fallback before measurement resolves. */
const FALLBACK_LINE_HEIGHT_PX = 18;
const DEFAULT_COLLAPSED_LINES = 5;

/**
 * Text container with an expand/collapse button for text that overflows the collapsed height.
 *
 * Uses `max-height` + `overflow: hidden` when collapsed (not `line-clamp`), because
 * `white-space: pre-wrap` is incompatible with `-webkit-line-clamp` in browsers.
 *
 * @internal
 */
export default function Collapsible({
  text,
  maxCollapsedHeightPx,
  maxExpandedHeightPx,
  reserveCollapsedHeight = false,
  noCollapse = false,
  isLoading = false,
  isError = false,
  onCollapsedChange,
  textClassName,
  showDisclaimer = false,
}: CollapsibleProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [showExpandControl, setShowExpandControl] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const disclaimerRef = useRef<HTMLDivElement>(null);
  const [disclaimerHeight, setDisclaimerHeight] = useState(0);
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();

  const measuredLineHeight = useLineHeight(ref);
  const lineHeight = measuredLineHeight ?? FALLBACK_LINE_HEIGHT_PX;

  const collapsedHeight = useMemo(() => {
    const hasExternalConstraint = maxCollapsedHeightPx !== undefined && maxCollapsedHeightPx > 0;
    if (hasExternalConstraint) {
      return Math.max(Math.floor(maxCollapsedHeightPx / lineHeight) * lineHeight, lineHeight);
    }
    return DEFAULT_COLLAPSED_LINES * lineHeight;
  }, [maxCollapsedHeightPx, lineHeight]);

  // Text area height = total budget minus the always-visible disclaimer, snapped to whole rows.
  const textCollapsedHeight = Math.max(
    Math.floor((collapsedHeight - disclaimerHeight) / lineHeight) * lineHeight,
    lineHeight,
  );

  // Fires when key parameters change, including when isLoading mounts/unmounts the text div
  // or showDisclaimer toggles the disclaimer div.
  useLayoutEffect(() => {
    const dh = disclaimerRef.current?.offsetHeight ?? 0;
    setDisclaimerHeight((prev) => (prev === dh ? prev : dh));

    if (noCollapse || !ref.current) return;
    const effectiveHeight = Math.max(
      Math.floor((collapsedHeight - dh) / lineHeight) * lineHeight,
      lineHeight,
    );
    setShowExpandControl(ref.current.scrollHeight > effectiveHeight);
  }, [noCollapse, collapsedHeight, lineHeight, isLoading, showDisclaimer]);

  // Re-check overflow when the text element resizes (e.g. widget width change causes reflow).
  useEffect(() => {
    if (noCollapse || !ref.current) return;
    const el = ref.current;
    const observer = new ResizeObserver(() => {
      setShowExpandControl(el.scrollHeight > textCollapsedHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [noCollapse, textCollapsedHeight]);

  // Re-measure disclaimer height when it resizes (e.g. window width change causes text reflow).
  useEffect(() => {
    const el = disclaimerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const dh = el.offsetHeight;
      setDisclaimerHeight((prev) => (prev === dh ? prev : dh));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [showDisclaimer, isLoading]);

  const handleShowMore = () => {
    setCollapsed(false);
    onCollapsedChange?.(false);
  };

  const handleShowLess = () => {
    setCollapsed(true);
    onCollapsedChange?.(true);
  };

  const handleKeyDown = (handler: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };

  const showExpandButton = !noCollapse && showExpandControl && collapsed;
  const showCollapseButton = !noCollapse && showExpandControl && !collapsed;

  const expandedMaxHeight = maxExpandedHeightPx
    ? maxExpandedHeightPx - disclaimerHeight
    : undefined;

  let outerStyle: React.CSSProperties;
  if (!noCollapse && collapsed) {
    outerStyle = reserveCollapsedHeight
      ? { height: textCollapsedHeight, overflow: 'hidden' }
      : { maxHeight: textCollapsedHeight, overflow: 'hidden' };
  } else {
    outerStyle = { overflow: 'auto', maxHeight: expandedMaxHeight };
  }

  if (isError) {
    return (
      <div style={{ width: '100%' }}>
        <ErrorBoundaryBox error={t('ai.errors.unexpected')} />
      </div>
    );
  }

  return (
    <div className="csdk-min-w-0 csdk-flex-1">
      <div style={outerStyle}>
        {isLoading ? (
          <LoadingOverlay isVisible />
        ) : (
          <div
            ref={ref}
            className={['csdk-whitespace-pre-wrap', textClassName].filter(Boolean).join(' ')}
            style={{ color: themeSettings.typography.primaryTextColor }}
          >
            {text}
          </div>
        )}
      </div>
      <div className="csdk-flex csdk-flex-row csdk-justify-between">
        {showDisclaimer && !isLoading && (
          <div
            ref={disclaimerRef}
            className="csdk-text-ai-xs csdk-pt-2"
            style={{ color: themeSettings.typography.secondaryTextColor }}
          >
            {t('ai.disclaimer.poweredByAi')}
          </div>
        )}
        {(showExpandButton || showCollapseButton) && (
          <div className="csdk-mt-3 csdk-flex csdk-justify-end">
            <div
              className="csdk-text-ai-xs csdk-text-text-link csdk-cursor-pointer"
              onClick={showExpandButton ? handleShowMore : handleShowLess}
              onKeyDown={handleKeyDown(showExpandButton ? handleShowMore : handleShowLess)}
              role="button"
              tabIndex={0}
            >
              {showExpandButton ? t('ai.buttons.readMore') : t('ai.buttons.collapse')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
