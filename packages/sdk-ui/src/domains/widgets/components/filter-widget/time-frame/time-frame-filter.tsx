/**
 * The Time Frame control — a single-select dropdown over a curated relative-window
 * catalogue. Picking a row commits at once and closes the panel; the trigger's `×`
 * clears.
 *
 * Publish model is one-click at the control level: unlike List / Calendar /
 * Condition, there is no footer and no draft inside the control. That does not
 * mean there is no outer transaction — an embedding widget editor's own Cancel /
 * Apply still owns the outer commit; the control just does not add a second layer.
 *
 * The panel is a flat row list in catalogue order (Days → Weeks → Months → Quarters
 * → Years; see `time-frame-catalogue.ts`) plus a preview bar. The bar reads what
 * range the hovered row means right now in primary ink; at rest it reads the
 * selected row's range if any, and otherwise the dimension's `min` – `max` span
 * in secondary ink.
 * @internal
 */
import { useCallback, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { FIELD_RADIUS, panel, spacing, typography } from '../components/design-tokens';
import type { FieldRadius } from '../components/design-tokens';
import type { FieldOwnProps } from '../components/field';
import { fwFallback, fwFieldShadow, fwVar } from '../components/field-palette';
import { Icon } from '../components/icons';
import { Selector } from '../components/selector';
import { useFieldId } from '../components/use-field-id';
import { resolveRelative } from './time-frame-arithmetic';
import type { ExactRange } from './time-frame-arithmetic';
import { specKey } from './time-frame-catalogue';
import type { RelativeSpec } from './time-frame-catalogue';
import { useDataSpanLabel, useTimeFrameLabel, useTimeFrameRangeLabel } from './time-frame-labels';

/**
 * How tall the row list gets before it scrolls. A ~9-row fixed-height box
 * (10 × 30px = 300px) that scrolls once the offered set exceeds it. The default
 * 11-frame catalogue and larger curated sets scroll inside this cap; there is no
 * attempt to auto-grow.
 */
const LIST_HEIGHT = 300;

/** @internal */
export type TimeFrameFilterProps = FieldOwnProps & {
  /**
   * The frames the filter offers, already read through the guard in
   * `time-frame-catalogue.ts` (unknown keys dropped, order canonical, ≥ 2 entries).
   */
  offered: readonly RelativeSpec[];
  /**
   * The frame currently selected — a `specKey` string, or `undefined` for
   * nothing-selected. A key not in `offered` is treated as no selection: a picked
   * frame withdrawn from the set later resets to the `Set filter` placeholder.
   */
  selectedKey: string | undefined;
  /**
   * Commits the picked frame. `null` clears the selection (published as include-all
   * by the widget owner).
   */
  onPick: (spec: RelativeSpec | null) => void;
  /**
   * The civil "now" the ranges resolve against. Passed in so a demo, a test or a
   * time-machined SDK consumer can freeze it; defaults to `new Date()`.
   */
  today?: Date;
  /** Dimension `min`, for the at-rest span on the preview bar. */
  earliestData?: Date;
  /** Dimension `max`, for the at-rest span on the preview bar. */
  latestData?: Date;
  /** Placeholder when nothing is selected. Defaults to the shared `Set filter`. */
  placeholder?: string;
  id?: string;
};

/**
 * The Time Frame control.
 * @param props - The offered set, the current selection and the pick / clear callbacks;
 *   see {@link TimeFrameFilterProps}.
 * @returns The trigger and the row-list popover the panel opens into.
 * @internal
 */
export function TimeFrameFilter(props: TimeFrameFilterProps) {
  // Destructured in the body rather than the signature so the JSDoc @param stays a single
  // reference to the props interface — every field's own contract lives on the interface,
  // and repeating the whole list here would drift the moment either side changes.
  const {
    offered,
    selectedKey,
    onPick,
    today,
    earliestData,
    latestData,
    placeholder,
    id,
    label,
    error,
    disabled,
    state,
    size,
    radius,
    width,
    controlStyle,
    className,
  } = props;
  const { t } = useTranslation();
  const fieldId = useFieldId(id);
  const [isOpen, setOpen] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | undefined>(undefined);
  /**
   * Which row the arrow keys most recently landed on. `undefined` before the panel opens.
   * A stale value — a row the designer removed from the offered set while the panel was
   * open — is normalised on read (see `activeKey` below) rather than through a setState-
   * in-effect, which the lint rule (and React) discourages.
   */
  const [rawActiveKey, setRawActiveKey] = useState<string | undefined>(undefined);

  const panelRadius: FieldRadius = radius ?? 's';

  const offeredKeys = useMemo(() => offered.map(specKey), [offered]);

  /** The selected spec, if any — resolved against `offered` so a withdrawn key clears. */
  const selectedSpec = useMemo(
    () => (selectedKey ? offered.find((frame) => specKey(frame) === selectedKey) : undefined),
    [offered, selectedKey],
  );

  const triggerLabel = useTimeFrameLabel(selectedSpec ?? offered[0]);
  const selectedLabel = selectedSpec ? triggerLabel : undefined;

  /**
   * Exact-range label for the selected frame — the "Sep 20, 2026 – Sep 26, 2026" the
   * trigger's hover reveals. Trigger only ever shows the frame's NAME; hovering it
   * says which concrete dates that name resolves to right now. `useMemo` for stable
   * identity so the hint popover doesn't remount on every render.
   */
  const selectedRange = useMemo<ExactRange | undefined>(
    () => (selectedSpec ? resolveRelative(selectedSpec, today) : undefined),
    [selectedSpec, today],
  );
  const selectedRangeLabel = useTimeFrameRangeLabel(selectedRange);

  // Do NOT seed `rawActiveKey` on open — the row-level `$active` background paints the
  // same grey as `:hover`, so seeding it to the selection makes the selected row look
  // pre-hovered. Selection is marked by the trailing ✓ glyph instead (mirrors the
  // shared `Dropdown`'s single-mode contract at dropdown.tsx:391). The first arrow-key
  // press falls through `handleKey` and lands on the correct starting row from there.
  const open = useCallback(() => {
    setOpen(true);
    setRawActiveKey(undefined);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setHoveredKey(undefined);
  }, []);

  /**
   * The row the arrow keys are on, normalised against the current offered set. Stays
   * `undefined` until the user actually navigates — otherwise every fresh open would
   * paint the first row with the same grey `:hover` uses (Row's `$active` and `:hover`
   * both resolve to `fwVar('rowHover')`, so an auto-seeded active row is visually
   * indistinguishable from a hovered one — see the "top frame reads as pre-hovered"
   * report). A raw key that no longer names a row is normalised to `undefined` too;
   * `handleKey` seeds from `offeredKeys[0]` on the first ArrowDown/ArrowUp/Home so
   * keyboard navigation still has a starting point.
   */
  const activeKey =
    rawActiveKey !== undefined && offeredKeys.includes(rawActiveKey) ? rawActiveKey : undefined;

  const pick = useCallback(
    (spec: RelativeSpec) => {
      // Clicking the already-selected row is a no-op — the selection stays, no republish,
      // panel closes on the same click as any other row.
      const key = specKey(spec);
      if (key !== selectedKey) {
        onPick(spec);
      }
      close();
    },
    [onPick, selectedKey, close],
  );

  const clear = useCallback(() => {
    onPick(null);
  }, [onPick]);

  const handleKey = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (offered.length === 0) return;
      const index = activeKey ? offeredKeys.indexOf(activeKey) : -1;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = index < 0 ? 0 : Math.min(offered.length - 1, index + 1);
        setRawActiveKey(offeredKeys[next]);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const next = index <= 0 ? 0 : index - 1;
        setRawActiveKey(offeredKeys[next]);
      } else if (event.key === 'Home') {
        event.preventDefault();
        setRawActiveKey(offeredKeys[0]);
      } else if (event.key === 'End') {
        event.preventDefault();
        setRawActiveKey(offeredKeys[offered.length - 1]);
      } else if ((event.key === 'Enter' || event.key === ' ') && activeKey) {
        // Merged with the Enter/Space branch — the outer if is only useful with the inner one.
        const spec = offered.find((frame) => specKey(frame) === activeKey);
        if (spec) {
          event.preventDefault();
          pick(spec);
        }
      }
    },
    [activeKey, offered, offeredKeys, pick],
  );

  const listboxId = `${fieldId}-listbox`;

  const panelNode = isOpen ? (
    <PanelShell
      $radius={panelRadius}
      role="listbox"
      id={listboxId}
      aria-label={t('filterWidget.timeFrame.listboxLabel')}
      tabIndex={-1}
      // Every row keys off the panel's own focus, so the keyboard user does not have to move focus
      // to a row before arrow keys work.
      onKeyDown={handleKey}
      data-testid="filter-widget-time-frame-panel"
    >
      <RowList
        data-testid="filter-widget-time-frame-list"
        onMouseLeave={() => setHoveredKey(undefined)}
      >
        {offered.map((frame) => {
          const key = specKey(frame);
          const isSelected = key === selectedKey;
          const isActive = key === activeKey;
          return (
            <Row
              key={key}
              spec={frame}
              rowKey={key}
              isSelected={isSelected}
              isActive={isActive}
              onHover={setHoveredKey}
              onPick={pick}
            />
          );
        })}
      </RowList>
      <PreviewFoot>
        <PreviewBar
          hoveredSpec={
            hoveredKey ? offered.find((frame) => specKey(frame) === hoveredKey) : undefined
          }
          selectedSpec={selectedSpec}
          earliestData={earliestData}
          latestData={latestData}
          today={today}
        />
      </PreviewFoot>
    </PanelShell>
  ) : null;

  return (
    <Selector
      id={fieldId}
      label={label}
      error={error}
      disabled={disabled}
      state={state}
      size={size}
      radius={radius}
      width={width}
      controlStyle={controlStyle}
      className={className}
      dataTestId="filter-widget-time-frame-trigger"
      value={selectedLabel}
      placeholder={placeholder ?? t('filterWidget.placeholders.setFilter')}
      /*
       * The trigger only ever shows the frame's NAME ("Last week"). Its hover reveals
       * the exact dates that name resolves to right now ("Sep 20, 2026 – Sep 26, 2026")
       * — always, once a frame is selected. Uses `hint` (Selector's always-on hover
       * popover) rather than `title`/`tooltip`, because those only fire when the box has
       * abbreviated its value, and "Last week" always fits. Mirrors the designer's
       * DatePresets contract.
       */
      hint={selectedSpec ? selectedRangeLabel : undefined}
      searchable={false}
      clearable={selectedSpec !== undefined}
      onClear={clear}
      open={isOpen}
      onOpenChange={(next) => (next ? open() : close())}
      popover={panelNode}
      listboxId={listboxId}
      activeOptionId={activeKey ? `${fieldId}-opt-${activeKey}` : undefined}
      popupRole="listbox"
    />
  );
}

/* ---------------------------------------------------------------- *
 * Row
 * ---------------------------------------------------------------- */

type RowProps = {
  spec: RelativeSpec;
  rowKey: string;
  isSelected: boolean;
  isActive: boolean;
  onHover: (key: string) => void;
  onPick: (spec: RelativeSpec) => void;
};

/**
 * One selectable frame. Kept in its own component so `useTimeFrameLabel` — a hook —
 * can be called per row inside a `.map`, which the rule of hooks forbids inline.
 * @param props - The frame's spec, its key for equality, and the pick / hover callbacks.
 * @returns The row.
 */
function Row(props: RowProps) {
  const { spec, rowKey, isSelected, isActive, onHover, onPick } = props;
  const label = useTimeFrameLabel(spec);
  return (
    <RowLi
      $active={isActive}
      role="option"
      aria-selected={isSelected}
      data-testid={`filter-widget-time-frame-row-${rowKey}`}
      data-time-frame-key={rowKey}
      // Redundant with `aria-selected`, but the shorter attribute name is what other filter
      // widgets already publish for e2e locators (`[data-selected="true"]`).
      data-selected={isSelected ? 'true' : 'false'}
      // Same, for the arrow-key highlight — tests can assert which row the panel is on.
      data-active={isActive ? 'true' : 'false'}
      onMouseEnter={() => onHover(rowKey)}
      onMouseMove={() => onHover(rowKey)}
      onClick={() => onPick(spec)}
    >
      <RowLabel>{label}</RowLabel>
      {isSelected && <Icon name="check" />}
    </RowLi>
  );
}

/* ---------------------------------------------------------------- *
 * PreviewBar — hovered row's range in primary ink, or at-rest span in secondary
 * ---------------------------------------------------------------- */

type PreviewBarProps = {
  hoveredSpec: RelativeSpec | undefined;
  selectedSpec: RelativeSpec | undefined;
  earliestData: Date | undefined;
  latestData: Date | undefined;
  today: Date | undefined;
};

function PreviewBar({
  hoveredSpec,
  selectedSpec,
  earliestData,
  latestData,
  today,
}: PreviewBarProps) {
  // Precedence: hovered wins the primary-ink slot; then the currently selected row;
  // finally the dimension's data span in the secondary-ink slot. Below every ink,
  // an empty widget with no `min`/`max` reads the shared `Set filter` prompt.
  const hoveredRange = useMemo<ExactRange | undefined>(
    () => (hoveredSpec ? resolveRelative(hoveredSpec, today) : undefined),
    [hoveredSpec, today],
  );
  const selectedRange = useMemo<ExactRange | undefined>(
    () => (selectedSpec ? resolveRelative(selectedSpec, today) : undefined),
    [selectedSpec, today],
  );
  const activeRange = hoveredRange ?? selectedRange;
  const activeLabel = useTimeFrameRangeLabel(activeRange);
  const spanLabel = useDataSpanLabel(earliestData, latestData);
  const { t } = useTranslation();

  const isPrimary = activeRange !== undefined;
  const text = isPrimary ? activeLabel : spanLabel || t('filterWidget.placeholders.setFilter');
  // Which of the four states the bar is showing right now, exposed for e2e locators so
  // a Playwright test can assert `hovered` vs `selected` vs `data-span` vs `empty` without
  // reasoning about text or computed style — mirrors the `data-*` state hooks the Selector
  // and Field publish for their own states.
  const state: 'hovered' | 'selected' | 'data-span' | 'empty' = hoveredRange
    ? 'hovered'
    : selectedRange
    ? 'selected'
    : spanLabel
    ? 'data-span'
    : 'empty';

  return (
    <PreviewBarRoot
      $primary={isPrimary}
      role="status"
      aria-live="polite"
      data-testid="filter-widget-time-frame-preview"
      data-state={state}
    >
      {text}
    </PreviewBarRoot>
  );
}

/* ---------------------------------------------------------------- *
 * styles
 * ---------------------------------------------------------------- */

const PanelShell = styled.div<{ $radius: FieldRadius }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  align-items: stretch;
  box-sizing: border-box;
  width: ${panel.width};
  padding: 12px;
  font-family: ${fwVar('fontFamily', fwFallback.fontFamily)};
  background: ${fwVar('panelBg', fwFallback.panelBg)};
  border-radius: ${({ $radius }) => FIELD_RADIUS[$radius]};
  box-shadow: ${fwFieldShadow};

  /* The panel keeps focus while the pointer navigates the rows, so its own outline is muted;
     the highlighted row is what says which one is active. */
  &:focus {
    outline: none;
  }
`;

const RowList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  max-height: ${LIST_HEIGHT}px;
`;

const RowLi = styled.li<{ $active: boolean }>`
  flex: 0 0 auto;
  display: flex;
  gap: ${spacing.xs};
  align-items: center;
  /* Space-between so the trailing check glyph rests against the right edge (with the
     panel's own padding as the gutter), same layout the shared Dropdown uses in
     single mode (dropdown.tsx:207). */
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  height: ${panel.rowHeight};
  padding: 0 ${spacing.m};
  cursor: pointer;
  /* Selection is marked by the trailing check glyph, not by a background — otherwise
     a freshly opened panel reads "the selected row is being hovered". Only the
     arrow-key active state and real :hover paint the row-hover grey, matching the
     shared Dropdown component (dropdown.tsx:217–222). */
  background: ${({ $active }) =>
    $active ? fwVar('rowHover', fwFallback.rowHover) : 'transparent'};

  &:hover {
    background: ${fwVar('rowHover', fwFallback.rowHover)};
  }
`;

const RowLabel = styled.span`
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  font-size: ${typography.paragraph.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.paragraph.lineHeight};
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * Wrapper around the preview so the divider sits on top of the muted surface — the same
 * pattern the drill-in footer uses (`.foot` in `filter-widget-panel.tsx`), rather than a
 * free-floating rule between two gaps.
 */
const PreviewFoot = styled.div`
  padding-top: ${spacing.m};
  border-top: ${spacing.borderWidth} solid ${fwVar('divider', fwFallback.divider)};
`;

/* The preview bar sits on the field's muted-surface tint (same background the drill-in
   search box and other footer panels use), so it reads as a footer region rather than as
   a floating text line — matches the designer's `DatePresets` reference. */
const PreviewBarRoot = styled.div<{ $primary: boolean }>`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: ${panel.rowHeight};
  padding: 6px 8px;
  font-size: ${typography.label.size};
  line-height: ${typography.label.lineHeight};
  color: ${({ $primary }) =>
    $primary
      ? fwVar('textPrimary', fwFallback.textPrimary)
      : fwVar('textSecondary', fwFallback.textSecondary)};
  background: ${fwVar('surfaceMuted', fwFallback.surfaceMuted)};
  border: ${spacing.borderWidth} solid transparent;
  border-radius: ${FIELD_RADIUS.s};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
`;
