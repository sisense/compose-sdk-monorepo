import { TFunction } from '@sisense/sdk-common';
import { DateLevels } from '@sisense/sdk-data';

const datetimeTraslationKeysByGranularity: Partial<Record<string, string>> = {
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
  const translationKey = granularity ? datetimeTraslationKeysByGranularity[granularity] : undefined;
  // A granularity outside the map — Fusion's 30-minute and 1-minute buckets — keeps the plain
  // column name. Naming it from a missing key would leave the attribute nameless.
  return translationKey ? t(translationKey, { columnName }) : columnName;
}
