/**
 * Date Condition control for FilterWidget — Last / This / Next and Before /
 * On or before / After / On or after, behind a trigger. Apply publishes; Cancel
 * and outside click abandon the draft. Typed-date errors keep the panel open.
 *
 * Panel chrome: {@link ConditionFilterShell}; navigation state:
 * {@link useConditionFilterPanel}. Calendar for anchors is inline and collapsed
 * until the field is clicked.
 * @internal
 */
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import { type Attribute, DateLevels, type Filter } from '@sisense/sdk-data';

import { CalendarGrid } from './calendar-grid.js';
import {
  DATE_CONDITION_GRAIN_LABEL_KEYS,
  DATE_CONDITION_GRAINS,
  DATE_CONDITION_OPERATORS,
  type DateConditionDraft,
  type DateConditionGrain,
  type DateConditionOp,
  dateConditionToFilter,
  dateOperatorOf,
  defaultDateConditionDraft,
  describeDateCondition,
  filterToDateConditionDraft,
  firstAvailableDateConditionGrain,
  forgetIncompleteDateDraft,
  isDateConditionComplete,
  isEditableDateConditionFilter,
  parseDateConditionCount,
  readIncompleteDateDraft,
  rememberIncompleteDateDraft,
  summariseDateCondition,
  summariseDateConditionDraft,
} from './condition-date.js';
import { Stack } from './condition-filter-layout.js';
import { CONDITION_PANEL_SIZE, ConditionFilterShell } from './condition-filter-shell.js';
import { DateEntry } from './date-entry.js';
import {
  dateProblemMessage,
  formatDateInput,
  parseDateInput,
  validateDateInput,
} from './date-text.js';
import type { DateEntryProblem } from './date-text.js';
import { typography } from './design-tokens.js';
import type { DropdownItem } from './dropdown';
import type { FieldOwnProps } from './field';
import { fwFallback, fwVar } from './field-palette.js';
import { Icon } from './icons';
import { PanelCountInput } from './panel-count-input.js';
import { Selector } from './selector';
import { useConditionFilterPanel } from './use-condition-filter-panel.js';
import { useDateMask } from './use-date-mask.js';

/** Date Condition panel is 276px; text/numeric stay on the shared 260px shell. */
export const DATE_CONDITION_PANEL_MIN_WIDTH = '276px';

const CountRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const CountSlot = styled.div`
  flex: 0 0 88px;
  width: 88px;
`;

const GrainSlot = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const IncludingCurrent = styled.button`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 0;
  font-family: inherit;
  font-size: ${typography.label.size};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  text-align: left;
  cursor: pointer;
  background: none;
  border: 0;
`;

const Preview = styled.p`
  margin: 0;
  font-size: ${typography.paragraph.size};
  line-height: ${typography.paragraph.lineHeight};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
`;

/** @internal */
export type ConditionFilterDateProps = FieldOwnProps & {
  attribute: Attribute;
  filter?: Filter | null;
  onFilterUpdate?: (filter: Filter | null) => void;
  placeholder?: string;
  id?: string;
  /** Injectable so a test renders the same on any day. */
  today?: Date;
  /** Earliest day the data covers. Greys earlier days and aims the quick chips; never blocks a pick. */
  earliestData?: Date;
  /** Latest day the data covers. Greys later days and aims the quick chips; never blocks a pick. */
  latestData?: Date;
  /**
   * Levels another filter already claims on this dim — same prop List uses.
   * Hidden from Last/This/Next grain; Days also hides Before/After anchors.
   */
  excludedDateLevels?: readonly string[];
};

/**
 * @param props - Attribute, linked filter, clock, data bounds, and publish callback
 * @returns The date Condition trigger and its drill-in panel
 * @internal
 */
export function ConditionFilterDate({
  attribute,
  filter = null,
  onFilterUpdate,
  placeholder,
  id,
  today: todayProp,
  earliestData,
  latestData,
  excludedDateLevels,
  label,
  error,
  disabled,
  state,
  size,
  radius,
  width,
  controlStyle,
  className,
}: ConditionFilterDateProps) {
  const { t } = useTranslation();
  const { mask, locale } = useDateMask();
  const today = todayProp ?? new Date();
  const [calendarShown, setCalendarShown] = useState(false);
  const [anchorProblem, setAnchorProblem] = useState<DateEntryProblem | null>(null);

  const excluded = useMemo(() => new Set(excludedDateLevels ?? []), [excludedDateLevels]);
  const daysTaken = excluded.has(DateLevels.Days);

  const operatorItems: DropdownItem[] = useMemo(
    () =>
      DATE_CONDITION_OPERATORS.filter(
        (op) => !(daysTaken && dateOperatorOf(op.id).shape === 'date'),
      ).map((op) => ({ id: op.id, label: t(op.labelKey) })),
    [t, daysTaken],
  );

  const makeDefaultDraft = useCallback(
    () => defaultDateConditionDraft(excludedDateLevels),
    [excludedDateLevels],
  );

  const toDraft = useMemo(
    () => (next: Filter | null | undefined) => filterToDateConditionDraft(next, mask),
    [mask],
  );
  /* Scoped by the linked filter's guid (Fusion's persisted dashboard-filter instanceid,
     stable across refresh/editor navigation — see rememberIncompleteDateDraft docs) in
     addition to the dimension, so two widgets on the same date column don't share a draft.
     Falls back to the bare expression only before a filter exists yet (brand-new widget). */
  const dimKey = filter?.config?.guid
    ? `${attribute.expression}::${filter.config.guid}`
    : attribute.expression;
  const resolveOpenDraft = useCallback(
    (fromFilter: DateConditionDraft) => {
      if (isEditableDateConditionFilter(filter)) return fromFilter;
      const remembered = readIncompleteDateDraft(dimKey);
      const candidate = remembered ?? fromFilter;
      /* Anchor ops publish at Days — if Days is already claimed, fall back to Last. */
      if (daysTaken && dateOperatorOf(candidate.op).shape === 'date') {
        return makeDefaultDraft();
      }
      /* Relative draft parked on a busy grain (or none was free when it was saved):
         snap to the first free one now, in case a level opened up since. */
      if (
        (dateOperatorOf(candidate.op).shape === 'relative' ||
          dateOperatorOf(candidate.op).shape === 'current') &&
        (candidate.grain === undefined || excluded.has(candidate.grain))
      ) {
        return { ...candidate, grain: firstAvailableDateConditionGrain(excludedDateLevels) };
      }
      return candidate;
    },
    [filter, dimKey, daysTaken, excluded, excludedDateLevels, makeDefaultDraft],
  );

  const panel = useConditionFilterPanel<
    DateConditionOp,
    { id: string; op: DateConditionOp },
    DateConditionDraft
  >({
    filter,
    toDraft,
    defaultDraft: makeDefaultDraft,
    operatorItems,
    chainOperatorItems: [],
    resolveOpenDraft,
  });

  const {
    isOpen,
    screen,
    query,
    setQuery,
    triedApply,
    setTriedApply,
    committed,
    draft,
    setDraft,
    open,
    back,
    close,
    abandon,
    clearDraft,
    openDrill,
    buildDrill,
  } = panel;

  const labelOf = (op: DateConditionOp) => t(dateOperatorOf(op).labelKey);
  const includingCurrentLabel = t(
    'filterWidget.dateCondition.includingCurrent',
    'including current',
  );
  const grainLabelOf = useCallback(
    (grain: DateConditionGrain, count: number) =>
      t(DATE_CONDITION_GRAIN_LABEL_KEYS[grain], { count }),
    [t],
  );
  const selectConditionLabel = t('filterWidget.controls.selectCondition', 'Select condition');
  const selectGrainLabel = t('filterWidget.controls.selectDateLevel', 'Select date level');

  const shape = dateOperatorOf(draft.op).shape;
  const committedLabel = isEditableDateConditionFilter(filter)
    ? summariseDateCondition(committed, labelOf, grainLabelOf, includingCurrentLabel, t)
    : undefined;
  const openLabel = summariseDateConditionDraft(
    draft,
    labelOf,
    grainLabelOf,
    includingCurrentLabel,
    t,
  );
  const showPlaceholder = !committedLabel;
  const tooltipLines = isEditableDateConditionFilter(filter)
    ? describeDateCondition(committed, mask, today, labelOf, grainLabelOf, includingCurrentLabel, t)
    : [];
  const hoverHint = !isOpen && tooltipLines.length === 1 ? tooltipLines[0] : undefined;

  const grainItems: DropdownItem[] = useMemo(() => {
    const count = shape === 'relative' ? parseDateConditionCount(draft.count) ?? 1 : 1;
    /* Same as List: hide busy levels, but keep naming the grain the draft is on. */
    const offered = DATE_CONDITION_GRAINS.filter(
      (grain) => !excluded.has(grain) || grain === draft.grain,
    );
    return offered.map((grain) => {
      return { id: grain, label: grainLabelOf(grain, count) };
    });
  }, [draft.count, draft.grain, shape, excluded, grainLabelOf]);

  const relativePreview = (() => {
    if (shape !== 'relative' && shape !== 'current') return undefined;
    if (shape === 'relative' && parseDateConditionCount(draft.count) === null) return undefined;
    return describeDateCondition(
      {
        ...draft,
        includingCurrent: shape === 'current' ? false : draft.includingCurrent,
      },
      mask,
      today,
      labelOf,
      grainLabelOf,
      includingCurrentLabel,
    )[0];
  })();

  const countError =
    triedApply && shape === 'relative' && parseDateConditionCount(draft.count) === null
      ? t('filterEditor.validationErrors.invalidNumber')
      : undefined;

  const anchorError = (() => {
    if (shape !== 'date') return undefined;
    if (anchorProblem) {
      const message = dateProblemMessage(mask, anchorProblem);
      return t(message.key, message.values);
    }
    if (triedApply && draft.anchor.trim() !== '' && parseDateInput(mask, draft.anchor) === null) {
      const { problem } = validateDateInput(mask, draft.anchor);
      if (!problem) return undefined;
      const message = dateProblemMessage(mask, problem);
      return t(message.key, message.values);
    }
    return undefined;
  })();

  const commit = () => {
    /* Empty Before/After clears like List Apply with no members — no JAQL — but keep
       the unfinished operator so reopen stays on Before rather than default Last. */
    if (shape === 'date' && draft.anchor.trim() === '') {
      rememberIncompleteDateDraft(dimKey, draft);
      onFilterUpdate?.(null);
      close();
      setCalendarShown(false);
      setAnchorProblem(null);
      return;
    }
    if (shape === 'date') {
      const { date, problem } = validateDateInput(mask, draft.anchor);
      if (!date) {
        setAnchorProblem(problem);
        setTriedApply(true);
        return;
      }
    }
    if (!isDateConditionComplete(draft)) {
      rememberIncompleteDateDraft(dimKey, draft);
      onFilterUpdate?.(null);
      close();
      setCalendarShown(false);
      setAnchorProblem(null);
      return;
    }
    /* Refuse publishing onto a level another filter already owns — UI should have
       hidden it, but Apply must not collide even if the draft still names it. isDateConditionComplete
       above already required a real grain for these two shapes when this line is reached. */
    if (
      (shape === 'relative' || shape === 'current') &&
      excluded.has(draft.grain as DateConditionGrain) &&
      !isEditableDateConditionFilter(filter)
    ) {
      setTriedApply(true);
      return;
    }
    if (shape === 'date' && daysTaken && !isEditableDateConditionFilter(filter)) {
      setTriedApply(true);
      return;
    }
    forgetIncompleteDateDraft(dimKey);
    const config = filter?.config ? { ...filter.config } : undefined;
    onFilterUpdate?.(dateConditionToFilter(attribute, draft, mask, config, t));
    close();
    setCalendarShown(false);
    setAnchorProblem(null);
  };

  const pickPrimaryOperator = (next: string) => {
    const op = next as DateConditionOp;
    setDraft((prev) => ({ ...prev, op }));
    setTriedApply(false);
    setAnchorProblem(null);
    setCalendarShown(false);
    back();
  };

  const drill =
    screen.kind === 'grain'
      ? {
          title: selectGrainLabel,
          items: grainItems,
          selected: draft.grain ? [draft.grain] : [],
          onSelect: (grainId: string) => {
            setDraft((prev) => ({ ...prev, grain: grainId as DateConditionGrain }));
            setTriedApply(false);
            back();
          },
        }
      : buildDrill({
          selectConditionLabel,
          onPickPrimary: pickPrimaryOperator,
          onPickChainOp: () => undefined,
        });

  const grainSelector = (
    <Selector
      dataTestId="filter-widget-condition-grain"
      size={CONDITION_PANEL_SIZE}
      radius={radius}
      width="100%"
      value={
        draft.grain
          ? grainLabelOf(
              draft.grain,
              shape === 'relative' ? parseDateConditionCount(draft.count) ?? 1 : 1,
            )
          : ''
      }
      placeholder={selectGrainLabel}
      searchable={false}
      clearable={false}
      controlStyle={controlStyle}
      onOpenChange={(next) => {
        if (!next) return;
        openDrill({ kind: 'grain' });
      }}
    />
  );

  const primaryOperatorField = (
    <Selector
      dataTestId="filter-widget-condition-operator"
      size={CONDITION_PANEL_SIZE}
      radius={radius}
      width="100%"
      value={labelOf(draft.op)}
      placeholder={selectConditionLabel}
      searchable={false}
      clearable={false}
      controlStyle={controlStyle}
      onOpenChange={(next) => {
        if (!next) return;
        openDrill({ kind: 'operator' });
      }}
    />
  );

  const valueBody = (
    <Stack>
      {primaryOperatorField}

      {shape === 'relative' && (
        <>
          <CountRow>
            <CountSlot>
              <PanelCountInput
                value={draft.count}
                onChange={(count) => {
                  setDraft((prev) => ({ ...prev, count }));
                  setTriedApply(false);
                }}
                error={countError}
                radius={radius}
                controlStyle={controlStyle}
                ariaLabel={labelOf(draft.op)}
              />
            </CountSlot>
            <GrainSlot>{grainSelector}</GrainSlot>
          </CountRow>
          <IncludingCurrent
            type="button"
            role="checkbox"
            aria-checked={draft.includingCurrent}
            data-testid="filter-widget-condition-including-current"
            onClick={() =>
              setDraft((prev) => ({ ...prev, includingCurrent: !prev.includingCurrent }))
            }
          >
            <Icon
              name={draft.includingCurrent ? 'checkboxChecked' : 'checkboxUnchecked'}
              box={12}
            />
            {t('filterWidget.dateCondition.includingCurrentLabel', 'Including current')}
          </IncludingCurrent>
          {relativePreview && (
            <Preview data-testid="filter-widget-condition-preview">{relativePreview}</Preview>
          )}
        </>
      )}

      {shape === 'current' && (
        <>
          {grainSelector}
          {relativePreview && (
            <Preview data-testid="filter-widget-condition-preview">{relativePreview}</Preview>
          )}
        </>
      )}

      {shape === 'date' && (
        <>
          <DateEntry
            mask={mask}
            value={draft.anchor}
            error={anchorError}
            radius={radius}
            width="100%"
            controlStyle={controlStyle}
            dataTestId="filter-widget-condition-anchor"
            open={calendarShown}
            onOpenChange={setCalendarShown}
            onChange={(text) => {
              setDraft((prev) => ({ ...prev, anchor: text }));
              setAnchorProblem(null);
              setTriedApply(false);
            }}
            onCommit={(_, raw) => {
              const { problem } = validateDateInput(mask, raw);
              setAnchorProblem(problem);
            }}
          />
          {calendarShown && (
            <div
              /* Keep the caret in the field: a day is a sibling of DateEntry, not its
                 popover, so mousedown would otherwise blur an empty input and Apply would
                 publish a clear (`Set filter`) instead of the picked date. */
              onMouseDown={(event) => event.preventDefault()}
            >
              <CalendarGrid
                mode="single"
                value={parseDateInput(mask, draft.anchor)}
                onChange={(picked) => {
                  setDraft((prev) => ({ ...prev, anchor: formatDateInput(mask, picked) }));
                  setAnchorProblem(null);
                  setTriedApply(false);
                }}
                earliestData={earliestData}
                latestData={latestData}
                today={today}
                locale={locale}
              />
            </div>
          )}
        </>
      )}
    </Stack>
  );

  return (
    <ConditionFilterShell
      id={id}
      label={label}
      error={error}
      disabled={disabled}
      state={state}
      size={size}
      radius={radius}
      width={width}
      controlStyle={controlStyle}
      className={className}
      placeholder={placeholder}
      isOpen={isOpen}
      triggerValue={isOpen ? openLabel : committedLabel}
      showPlaceholder={showPlaceholder}
      hint={hoverHint}
      onOpen={() => {
        setCalendarShown(false);
        setAnchorProblem(null);
        open();
      }}
      onAbandon={() => {
        setCalendarShown(false);
        setAnchorProblem(null);
        abandon();
      }}
      onClearFilter={() => {
        forgetIncompleteDateDraft(dimKey);
        onFilterUpdate?.(null);
      }}
      onClearDraft={() => {
        forgetIncompleteDateDraft(dimKey);
        clearDraft();
        setCalendarShown(false);
        setAnchorProblem(null);
      }}
      onApply={commit}
      screen={screen}
      onBack={back}
      query={query}
      onQueryChange={setQuery}
      valueBody={valueBody}
      drill={drill}
      panelMinWidth={DATE_CONDITION_PANEL_MIN_WIDTH}
    />
  );
}
