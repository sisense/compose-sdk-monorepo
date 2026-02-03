import {
  DateLevel,
  DateLevels,
  DateOperators,
  DimensionalLevelAttribute,
  RelativeDateFilter as RelativeDateFilterType,
} from '@sisense/sdk-data';
import dayjs, { ManipulateType } from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

import { TranslatableError } from '@/infra/translation/translatable-error';

dayjs.extend(quarterOfYear);

/**
 * @internal
 */
export function createAnchorDateFromRelativeDateFilter(
  filter: RelativeDateFilterType,
): dayjs.Dayjs {
  const { offset, operator, attribute, anchor } = filter;
  const date = dayjs(anchor);
  const granularity = (attribute as DimensionalLevelAttribute).granularity as DateLevel;
  const supportedGranularityToOffset = new Set([
    DateLevels.Years,
    DateLevels.Quarters,
    DateLevels.Months,
    DateLevels.Weeks,
    DateLevels.Days,
  ]) as Set<DateLevel>;

  if (!supportedGranularityToOffset.has(granularity)) {
    throw new TranslatableError('errors.filter.unsupportedDatetimeLevel');
  }

  if (!offset) return date;

  return date[operator === DateOperators.Last ? 'subtract' : 'add'](
    offset,
    granularity.toLowerCase() as ManipulateType,
  );
}
