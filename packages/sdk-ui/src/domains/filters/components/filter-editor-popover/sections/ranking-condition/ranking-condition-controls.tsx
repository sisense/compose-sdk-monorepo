import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import { BaseMeasure, DataSource, Measure } from '@sisense/sdk-data';

import { AddMeasurePopover } from '@/domains/data-browser/add-measure-popover/add-measure-popover';
import { getRankingMeasureDisplayName } from '@/domains/data-browser/add-measure-popover/measure-ranking-title';
import { MenuIcon } from '@/domains/filters/components/icons/menu-icon.js';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';

import { Input } from '../../common/input.js';
import { SingleSelect } from '../../common/select/single-select.js';
import { useFilterEditorContext } from '../../filter-editor-context.js';
import { dateLevelGranularities } from '../common/granularities.js';

const CountInput = styled(Input)<Themable>`
  width: 64px;
  margin-left: 6px;
  margin-right: 4px;
  background-color: ${({ theme }) => theme.general.popover.input.backgroundColor};
  color: ${({ theme }) => theme.general.popover.input.textColor};
`;

const DateLevelSelect = styled(SingleSelect<string>)`
  width: 112px;
  margin-left: 5px;
`;

const RankedByLabel = styled.span<Themable>`
  margin-left: 5px;
  margin-right: 8px;
  font-size: 13px;
  line-height: 28px;
  white-space: nowrap;
  color: ${({ theme }) => theme.general.popover.input.textColor};
`;

const RankedByField = styled.button<Themable & { disabled?: boolean }>`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  position: relative;
  width: 160px;
  height: 28px;
  background: ${({ theme }) => theme.general.popover.input.backgroundColor};
  border-radius: 4px;
  border: none;
  padding: 0 28px 0 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const RankedByFieldText = styled.span<Themable & { isPlaceholder: boolean }>`
  flex: 1;
  min-width: 0;
  font-size: 13px;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.general.popover.input.textColor};
  opacity: ${({ isPlaceholder }) => (isPlaceholder ? 0.6 : 1)};
`;

const RankedByFieldIcon = styled(MenuIcon)`
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

/**
 * Props for the ranking count, date level, and ranked-by measure controls.
 *
 * @property count - Current ranking count (minimum 1).
 * @property measure - Selected measure used to rank members, or null when unset.
 * @property onCountChange - Called when the user changes the ranking count.
 * @property onMeasureChange - Called when the user selects a measure from the popover.
 * @property showRankedBy - Whether to render the ranked-by measure selector (default true).
 * @property showDateLevel - Whether to render the date level selector (default false).
 * @property dateLevel - Current date granularity when `showDateLevel` is true.
 * @property onDateLevelChange - Called when the user changes the date level.
 * @property disabled - Disables count input and ranked-by selector when true.
 */
export type RankingConditionControlsProps = {
  count: number;
  measure: Measure | null;
  onCountChange: (count: number) => void;
  onMeasureChange: (measure: Measure) => void;
  showRankedBy?: boolean;
  showDateLevel?: boolean;
  dateLevel?: string;
  onDateLevelChange?: (granularity: string) => void;
  disabled?: boolean;
};

/**
 * Renders shared Top/Bottom ranking controls: count input, optional date level, and ranked-by measure.
 *
 * @param props - Ranking control state and change handlers.
 * @returns Fragment containing ranking UI controls.
 * @internal
 */
export const RankingConditionControls = ({
  count,
  measure,
  onCountChange,
  onMeasureChange,
  showRankedBy = true,
  showDateLevel = false,
  dateLevel,
  onDateLevelChange,
  disabled = false,
}: RankingConditionControlsProps) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const { dataSources } = useFilterEditorContext();
  const [measurePopoverAnchor, setMeasurePopoverAnchor] = useState<HTMLElement | null>(null);
  const [measurePopoverOpen, setMeasurePopoverOpen] = useState(false);

  const resolvedDataSources = useMemo((): DataSource[] => dataSources, [dataSources]);

  const translatedDateLevels = useMemo(
    () =>
      dateLevelGranularities.map((item) => ({
        ...item,
        displayValue: t(item.displayValue),
      })),
    [t],
  );

  const rankedByDisplayName = useMemo(() => getRankingMeasureDisplayName(measure, t), [measure, t]);

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      onCountChange(parsed);
    }
  };

  return (
    <>
      <CountInput
        theme={themeSettings}
        type="number"
        value={count}
        min={1}
        step={1}
        onChange={handleCountChange}
        disabled={disabled}
        aria-label="Ranking count input"
      />
      {showDateLevel && dateLevel !== undefined && onDateLevelChange && (
        <DateLevelSelect
          value={dateLevel}
          items={translatedDateLevels}
          onChange={onDateLevelChange}
          aria-label="Date level select"
        />
      )}
      {showRankedBy && (
        <>
          <RankedByLabel theme={themeSettings}>{t('filterEditor.labels.rankedBy')}</RankedByLabel>
          <RankedByField
            type="button"
            theme={themeSettings}
            disabled={disabled || resolvedDataSources.length === 0}
            onClick={(event) => {
              setMeasurePopoverAnchor(event.currentTarget);
              setMeasurePopoverOpen(true);
            }}
            aria-label="Select ranked by measure"
          >
            <RankedByFieldText theme={themeSettings} isPlaceholder={!measure}>
              {rankedByDisplayName || t('filterEditor.labels.selectField')}
            </RankedByFieldText>
            <RankedByFieldIcon aria-hidden="true" />
          </RankedByField>
          {measurePopoverAnchor && resolvedDataSources.length > 0 && (
            <AddMeasurePopover
              anchorEl={measurePopoverAnchor}
              isOpen={measurePopoverOpen}
              onClose={() => setMeasurePopoverOpen(false)}
              dataSources={resolvedDataSources}
              initialDataSource={resolvedDataSources[0]}
              onMeasureCreated={(createdMeasure: BaseMeasure) => {
                onMeasureChange(createdMeasure as Measure);
                setMeasurePopoverOpen(false);
              }}
            />
          )}
        </>
      )}
    </>
  );
};
