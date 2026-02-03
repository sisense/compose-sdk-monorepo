import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { LevelAttribute, RelativeDateFilter } from '@sisense/sdk-data';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';

import { FilterContentDisplay } from '@/domains/filters/components/common/index.js';
import { createAnchorDateFromRelativeDateFilter } from '@/domains/filters/components/date-filter/relative-date-filter-tile/helpers.js';

import { DEFAULT_FORMAT } from '../consts.js';
import { DATE_LEVELS_MAP, DATE_OPS_MAP } from './relative-date-filter.js';

dayjs.extend(isToday);

/**
 * @internal
 */
export type RelativeDateFilterDisplayProps = {
  filter: RelativeDateFilter;
};

/**
 * Displays a relative date filter as a human-readable string.
 *
 * @internal
 */
export const RelativeDateFilterDisplay: FunctionComponent<RelativeDateFilterDisplayProps> = (
  props,
) => {
  const { filter } = props;
  const { t } = useTranslation();

  const operatorTxt = t(DATE_OPS_MAP[filter.operator]);
  const countTxt = filter.count.toString();
  const levelTxt = t(DATE_LEVELS_MAP[(filter.attribute as LevelAttribute).granularity]);
  const anchorDate = useMemo(() => createAnchorDateFromRelativeDateFilter(filter), [filter]);
  const anchorTxt = anchorDate.isToday()
    ? t('dateFilter.today')
    : anchorDate.format(DEFAULT_FORMAT);

  return (
    <FilterContentDisplay>
      {`${operatorTxt} ${countTxt} ${levelTxt} ${t('dateFilter.from')} ${anchorTxt}`}
    </FilterContentDisplay>
  );
};
