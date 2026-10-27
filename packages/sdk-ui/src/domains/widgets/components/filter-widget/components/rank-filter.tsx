/**
 * Rank control for FilterWidget — Top / Bottom N of a text, numeric or datetime attribute,
 * ranked by a measure the dashboard designer fixed. The user picks a direction, a count and,
 * on a datetime attribute, a date level; the measure is shown, never chosen.
 *
 * Panel chrome: {@link ConditionFilterShell}; navigation and draft: {@link useRankFilterPanel}.
 * This file owns the value fields and what Apply publishes.
 * @internal
 */
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import type { Attribute, Filter, Measure } from '@sisense/sdk-data';
import { isLevelAttribute, isRankingFilter } from '@sisense/sdk-data';

import { getRankingMeasureDisplayName } from '@/domains/data-browser/add-measure-popover/measure-ranking-title';
import { dateLevelGranularities } from '@/domains/filters/components/filter-editor-popover/sections/common/granularities';
import { getFilterAttributeValueType } from '@/domains/filters/shared/filter-attribute-value-type.js';

import { Row, RowGrow, Stack } from './condition-filter-layout.js';
import { CONDITION_PANEL_SIZE, ConditionFilterShell } from './condition-filter-shell.js';
import { FIELD_RADIUS, spacing, typography } from './design-tokens';
import type { FieldRadius } from './design-tokens';
import type { DropdownItem } from './dropdown';
import type { FieldOwnProps } from './field';
import { fwFallback, fwVar } from './field-palette';
import { PanelCountInput } from './panel-count-input.js';
import {
  isRankDraftComplete,
  rankDraftToFilter,
  rankEmptyLabel,
  rankEmptyRows,
  sanitiseRankCount,
  stepRankCount,
  summariseRank,
  summariseRankRows,
} from './rank.js';
import type { RankDirection } from './rank.js';
import { Selector } from './selector';
import { useRankFilterPanel } from './use-rank-filter-panel.js';

const DIRECTION_NAME_KEY = 'filterWidget.rank.direction';

const DIRECTION_LABEL_KEYS: Record<RankDirection, string> = {
  top: 'filterEditor.conditions.top',
  bottom: 'filterEditor.conditions.bottom',
};

/* A caption, so it reads in the secondary text colour; the measure's name under it is the value
   and keeps the primary one. */
const RankedByLabel = styled.div`
  padding-bottom: ${spacing.m};
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
`;

/* The measure is fixed by whoever set the widget up, so it reads as plain text on the lightest
   tint rather than as a field: no border, no caret, no click. Long names wrap instead of
   being cut, because the whole name is the point of the box. */
const RankedByBox = styled.div<{ $radius: FieldRadius }>`
  box-sizing: border-box;
  padding: 6px ${spacing.m};
  font-size: ${typography.label.size};
  line-height: ${typography.label.lineHeight};
  font-variant-numeric: tabular-nums;
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  overflow-wrap: anywhere;
  cursor: default;
  background: ${fwVar('surfaceMuted', fwFallback.surfaceMuted)};
  border: ${spacing.borderWidth} solid transparent;
  border-radius: ${({ $radius }) => FIELD_RADIUS[$radius]};
`;

/** @internal */
export type RankFilterProps = FieldOwnProps & {
  attribute: Attribute;
  /** The measure the filter ranks by. Without one the control is disabled. */
  rankBy?: Measure;
  /** Linked dashboard filter; anything but a ranking filter reads as nothing applied. */
  filter?: Filter | null;
  /** Publishes on Apply and on the closed-trigger ✕. */
  onFilterUpdate?: (filter: Filter | null) => void;
  id?: string;
};

/**
 * @param props - Attribute, the measure to rank by, the linked filter, and the publish callback.
 * @returns The Rank trigger and its panel.
 * @internal
 */
export function RankFilter(props: RankFilterProps) {
  const {
    attribute,
    rankBy,
    filter = null,
    onFilterUpdate,
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
  const isDate = getFilterAttributeValueType(attribute) === 'datetime';
  // The level control needs a level to start from; a datetime attribute without one has none to offer.
  const hasLevel = isDate && isLevelAttribute(attribute);

  const rankingFilter = filter && isRankingFilter(filter) ? filter : null;
  const panel = useRankFilterPanel({ filter: rankingFilter, isDate });
  const { isOpen, screen, draft, setDraft, open, back, close, abandon, clearDraft } = panel;

  const directionItems: DropdownItem[] = useMemo(
    () => [
      { id: 'top', label: t(DIRECTION_LABEL_KEYS.top) },
      { id: 'bottom', label: t(DIRECTION_LABEL_KEYS.bottom) },
    ],
    [t],
  );

  const selectLevelLabel = t('filterWidget.controls.selectDateLevel');
  const count = Number(draft.count) || 1;
  const levelLabelOf = (level: string) => {
    const known = dateLevelGranularities.find((entry) => entry.value === level);
    return known ? t(known.displayValue, { count }) : level;
  };
  const levelItems: DropdownItem[] = dateLevelGranularities.map((entry) => ({
    id: entry.value,
    label: levelLabelOf(entry.value),
  }));

  const rankedByName = rankBy ? getRankingMeasureDisplayName(rankBy, t) : '';
  const summary = rankingFilter ? summariseRank(rankingFilter, t) : undefined;
  const emptyLabel = rankBy ? rankEmptyLabel(rankBy, t) : undefined;
  const isLocked = !rankBy;
  /* A parent can drop the measure while the panel is open. With nothing to rank by, the panel goes
     with the control locking: an Apply left behind could only publish an include-all, wiping the
     ranking the dashboard holds. */
  useEffect(() => {
    if (isLocked && isOpen) abandon();
  }, [isLocked, isOpen, abandon]);
  /* The hover says the same thing as the trigger, laid out in two rows so a long measure name
     gets a line to itself: the rule (`Top 10 By:`), then the measure. */
  const hintRows = isLocked
    ? null
    : rankingFilter
    ? summariseRankRows(rankingFilter, t)
    : rankBy
    ? rankEmptyRows(rankBy, t)
    : null;

  const commit = () => {
    if (!isRankDraftComplete(draft)) {
      onFilterUpdate?.(null);
      close();
      return;
    }
    const config = filter?.config ? { ...filter.config } : undefined;
    onFilterUpdate?.(rankDraftToFilter(draft, attribute, rankBy, t, config));
    close();
  };

  const drill =
    screen.kind === 'operator'
      ? {
          title: t(DIRECTION_NAME_KEY),
          items: directionItems,
          selected: [draft.direction],
          onSelect: (next: string) => {
            setDraft((prev) => ({ ...prev, direction: next as RankDirection }));
            back();
          },
        }
      : screen.kind === 'grain'
      ? {
          title: selectLevelLabel,
          items: levelItems,
          selected: draft.level ? [draft.level] : [],
          onSelect: (next: string) => {
            setDraft((prev) => ({ ...prev, level: next }));
            back();
          },
        }
      : null;

  const directionField = (
    <Selector
      dataTestId="filter-widget-rank-direction"
      title={t(DIRECTION_NAME_KEY)}
      size={CONDITION_PANEL_SIZE}
      radius={radius}
      width="100%"
      value={t(DIRECTION_LABEL_KEYS[draft.direction])}
      ariaLabel={t(DIRECTION_NAME_KEY)}
      searchable={false}
      clearable={false}
      controlStyle={controlStyle}
      onOpenChange={(next) => {
        if (next) panel.openDrill({ kind: 'operator' });
      }}
    />
  );

  const countField = (
    <PanelCountInput
      value={draft.count}
      onChange={(next) => setDraft((prev) => ({ ...prev, count: next }))}
      normalize={sanitiseRankCount}
      step={stepRankCount}
      placeholder={t('filterWidget.controls.enterValue')}
      ariaLabel={t('filterWidget.rank.count')}
      dataTestId="filter-widget-rank-count"
      radius={radius}
      controlStyle={controlStyle}
    />
  );

  const levelField = (
    <Selector
      dataTestId="filter-widget-rank-grain"
      title={selectLevelLabel}
      size={CONDITION_PANEL_SIZE}
      radius={radius}
      width="100%"
      value={draft.level ? levelLabelOf(draft.level) : ''}
      placeholder={selectLevelLabel}
      ariaLabel={selectLevelLabel}
      searchable={false}
      clearable={false}
      controlStyle={controlStyle}
      onOpenChange={(next) => {
        if (next) panel.openDrill({ kind: 'grain' });
      }}
    />
  );

  const valueBody = (
    <Stack>
      {directionField}
      {hasLevel ? (
        <Row>
          <RowGrow>{countField}</RowGrow>
          <RowGrow>{levelField}</RowGrow>
        </Row>
      ) : (
        countField
      )}
      <div>
        <RankedByLabel>{t('filterWidget.rank.rankedByLabel')}</RankedByLabel>
        <RankedByBox $radius={radius ?? 's'} data-testid="filter-widget-rank-ranked-by">
          {rankedByName}
        </RankedByBox>
      </div>
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
      placeholder={emptyLabel}
      isOpen={isOpen}
      triggerValue={summary}
      showPlaceholder={!summary}
      hint={
        hintRows ? (
          <>
            <span>{hintRows[0]}</span>
            <span>{hintRows[1]}</span>
          </>
        ) : (
          t('filterWidget.rank.chooseRankedBy')
        )
      }
      locked={isLocked}
      triggerTestId="filter-widget-rank-trigger"
      panelTestId="filter-widget-rank-panel"
      onOpen={isLocked ? () => undefined : open}
      onAbandon={abandon}
      onClearFilter={() => onFilterUpdate?.(null)}
      onClearDraft={clearDraft}
      onApply={commit}
      screen={screen}
      onBack={back}
      query=""
      onQueryChange={() => undefined}
      valueBody={valueBody}
      drill={drill}
    />
  );
}
