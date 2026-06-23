import Collapsible from '@/modules/ai/common/collapsible';

type NarrativeCollapsibleProps = {
  text: string;
  noCollapse?: boolean;
  /** When true, shows the loading overlay over the text area at its settled height. */
  isLoading?: boolean;
  isError?: boolean;
  /** Fired when the collapsed state toggles. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
  /**
   * Reserved height in pixels for the collapsed state (line-aligned internally).
   * The container always occupies this much vertical space; "show more" only appears when
   * the text overflows it. Defaults to 5 text rows when `undefined`.
   */
  constrainedHeightPx?: number;
  /**
   * Absolute pixel cap applied when the narrative is expanded.
   * Text scrolls rather than exceeding this limit.
   */
  maxConstrainedHeightPx?: number;
};

/**
 * Narrative-specific collapsible: always reserves the collapsed height to prevent widget
 * layout shifts during data loads.
 *
 * Thin wrapper around {@link Collapsible} that maps legacy prop names and sets
 * narrative-appropriate defaults.
 *
 * @internal
 */
export function NarrativeCollapsible({
  constrainedHeightPx,
  maxConstrainedHeightPx,
  ...rest
}: NarrativeCollapsibleProps) {
  return (
    <Collapsible
      {...rest}
      showDisclaimer
      maxCollapsedHeightPx={constrainedHeightPx}
      maxExpandedHeightPx={maxConstrainedHeightPx}
      reserveCollapsedHeight
      textClassName="csdk-text-[13px]"
    />
  );
}
