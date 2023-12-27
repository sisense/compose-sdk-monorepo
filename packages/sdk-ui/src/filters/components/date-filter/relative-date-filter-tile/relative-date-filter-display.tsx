import { LevelAttribute, RelativeDateFilter } from '@sisense/sdk-data';
import dayjs from 'dayjs';
import { FunctionComponent } from 'react';
import { DATE_LEVELS_MAP, DATE_OPS_MAP } from './relative-date-filter.js';
import { useTranslation } from 'react-i18next';
import { DEFAULT_FORMAT } from '../consts.js';
import isToday from 'dayjs/plugin/isToday';
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
  const anchorTxt =
    filter.anchor && !dayjs(filter.anchor).isToday()
      ? dayjs(filter.anchor).format(DEFAULT_FORMAT)
      : t('dateFilter.today');

  return (
    <div className="csdk-leading-[26px] csdk-mx-auto csdk-my-2 csdk-px-1 csdk-text-[13px] csdk-whitespace-nowrap csdk-flex csdk-flex-wrap csdk-gap-x-1 csdk-justify-center">{`${operatorTxt} ${countTxt} ${levelTxt} ${t(
      'dateFilter.from',
    )} ${anchorTxt}`}</div>
  );
};
