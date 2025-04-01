/* eslint-disable security/detect-object-injection */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  DateLevels,
  DateOperators,
  DimensionalLevelAttribute,
  RelativeDateFilter as RelativeDateFilterType,
  filterFactory,
} from '@sisense/sdk-data';
import { BasicInput, DateRangeFieldButton, Dropdown, FilterVariant } from '../../common/index.js';
import { FunctionComponent, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isVertical } from '../../common/filter-utils.js';
import { DEFAULT_FORMAT } from '../consts.js';
import { CalendarDateSelector } from '../date-filter/calendar-date-selector.js';
import dayjs from 'dayjs';
import { useThemeContext } from '../../../../theme-provider/index.js';
import isToday from 'dayjs/plugin/isToday';
import { TranslatableError } from '@/translation/translatable-error.js';
import { createAnchorDateFromRelativeDateFilter } from './helpers';
import { Popover } from '@/common/components/popover.js';

dayjs.extend(isToday);

/**
 * @internal
 */
export interface RelativeDateFilterProps {
  filter: RelativeDateFilterType;
  arrangement?: FilterVariant;
  onUpdate: (filter: RelativeDateFilterType) => void;
  disabled: boolean;
  limit?: {
    maxDate: string;
    minDate: string;
  };
}

/**
 * @internal
 */
export const RelativeDateFilter: FunctionComponent<RelativeDateFilterProps> = (props) => {
  const { filter, arrangement = 'horizontal', onUpdate, disabled, limit } = props;
  const operator = filter.operator;
  const count = filter.count;
  const levelAttr = filter.attribute as DimensionalLevelAttribute;
  const anchor = useMemo(() => createAnchorDateFromRelativeDateFilter(filter), [filter]);
  const dateLimits = {
    maxDate: limit ? dayjs(limit.maxDate) : undefined,
    minDate: limit ? dayjs(limit?.minDate) : undefined,
  };

  const { t } = useTranslation();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const { themeSettings } = useThemeContext();

  const onAnyValueChange = (
    maybeOperator?: string,
    maybeCount?: number,
    maybeLevel?: string,
    maybeAnchor?: dayjs.Dayjs,
  ) => {
    if (!(maybeOperator || maybeCount || maybeLevel || maybeAnchor)) return;
    const newOperator = maybeOperator ?? operator;
    const newCount = maybeCount ?? count;
    const newLevel = maybeLevel ?? levelAttr.granularity;
    if (maybeAnchor !== undefined) {
      maybeAnchor = dayjs(maybeAnchor);
    }
    const newAnchor = maybeAnchor ?? anchor;
    const newLevelAttr = new DimensionalLevelAttribute(newLevel, levelAttr.expression, newLevel);
    let newFilter: RelativeDateFilterType;
    switch (newOperator) {
      case DateOperators.Last:
        newFilter = filterFactory.dateRelativeTo(
          newLevelAttr,
          0,
          newCount,
          newAnchor.isToday() ? undefined : newAnchor.toDate(),
        ) as RelativeDateFilterType;
        break;
      case DateOperators.Next:
        newFilter = filterFactory.dateRelativeFrom(
          newLevelAttr,
          0,
          newCount,
          newAnchor.isToday() ? undefined : newAnchor.toDate(),
        ) as RelativeDateFilterType;
        break;
      default:
        throw new TranslatableError('errors.dateFilterIncorrectOperator', {
          operator: newOperator,
        });
    }
    onUpdate(newFilter);
  };

  return (
    <div
      className={`csdk-flex ${
        isVertical(arrangement) ? 'csdk-flex-col' : 'csdk-flex-row'
      } csdk-mb-px`}
    >
      <div className="csdk-flex csdk-justify-between csdk-items-center csdk-h-6 csdk-my-1">
        <div className="csdk-h-6">
          <Dropdown
            selectedIdx={Object.keys(DATE_OPS_MAP).indexOf(operator)}
            elements={Object.keys(DATE_OPS_MAP).map((op) => {
              return (
                <div
                  onClick={() => {
                    if (operator !== op) {
                      onAnyValueChange(op, undefined, undefined, undefined);
                    }
                  }}
                >
                  {t(DATE_OPS_MAP[op])}
                </div>
              );
            })}
            disabled={disabled}
          />
        </div>
        <BasicInput
          className={'csdk-w-[60px]'}
          type={'number'}
          placeholder={t('dateFilter.count')}
          value={count?.toString() ?? ''}
          callback={(newCount: string) => {
            if (newCount !== '') {
              onAnyValueChange(undefined, Number(newCount), undefined, undefined);
            }
          }}
          required={true}
          disabled={disabled}
        />
        <div className="csdk-h-6">
          <Dropdown
            selectedIdx={Object.keys(DATE_LEVELS_MAP).indexOf(levelAttr.granularity)}
            elements={Object.keys(DATE_LEVELS_MAP).map((level) => {
              return (
                <div
                  onClick={() => {
                    if (levelAttr.granularity !== level) {
                      onAnyValueChange(undefined, undefined, level, undefined);
                    }
                  }}
                >
                  {t(DATE_LEVELS_MAP[level])}
                </div>
              );
            })}
            disabled={disabled}
          />
        </div>
      </div>
      <div
        ref={anchorRef}
        className="csdk-flex csdk-justify-end csdk-items-center csdk-h-6 csdk-my-1"
      >
        <div className="csdk-text-[13px] csdk-ml-[5px] csdk-mr-2">{t('dateFilter.from')}</div>
        <DateRangeFieldButton
          onClick={() => setCalendarOpen(true)}
          value={anchor ? anchor.format(DEFAULT_FORMAT) : t('dateFilter.today')}
          isActive={calendarOpen}
          theme={themeSettings}
          variant={'white'}
          disabled={disabled}
        />
        <Popover
          id={'simple-popover'}
          open={calendarOpen}
          position={
            anchorRef.current
              ? {
                  anchorEl: anchorRef.current,
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                  },
                  contentOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                  },
                }
              : undefined
          }
          onClose={() => setCalendarOpen(false)}
        >
          <CalendarDateSelector
            selectorMode={'pointSelector'}
            limit={dateLimits}
            onDateChanged={(selectedDate: dayjs.Dayjs) => {
              if (selectedDate !== anchor) {
                onAnyValueChange(undefined, undefined, undefined, selectedDate);
                setCalendarOpen(false);
              }
            }}
            selectedDate={anchor}
          />
        </Popover>
      </div>
    </div>
  );
};

export const DATE_OPS_MAP = {
  [DateOperators.Last]: 'dateFilter.last',
  [DateOperators.Next]: 'dateFilter.next',
} as const;
export const DATE_LEVELS_MAP = {
  [DateLevels.Days]: 'dateFilter.days',
  [DateLevels.Weeks]: 'dateFilter.weeks',
  [DateLevels.Months]: 'dateFilter.months',
  [DateLevels.Quarters]: 'dateFilter.quarters',
  [DateLevels.Years]: 'dateFilter.years',
} as const;
