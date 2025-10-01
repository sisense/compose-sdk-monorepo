import { TFunction } from '@ethings-os/sdk-common';
import { DateLevels } from '@ethings-os/sdk-data';

const datetimeTraslationKeysByGranularity = {
  [DateLevels.Years]: 'attribute.datetimeName.years',
  [DateLevels.Quarters]: 'attribute.datetimeName.quarters',
  [DateLevels.Months]: 'attribute.datetimeName.months',
  [DateLevels.Weeks]: 'attribute.datetimeName.weeks',
  [DateLevels.Days]: 'attribute.datetimeName.days',
  [DateLevels.AggHours]: 'attribute.datetimeName.hours',
  [DateLevels.AggMinutesRoundTo15]: 'attribute.datetimeName.minutes',
};

export function generateAttributeName(
  t: TFunction,
  columnName: string,
  granularity?: string,
): string {
  return granularity
    ? t(datetimeTraslationKeysByGranularity[granularity], { columnName })
    : columnName;
}
