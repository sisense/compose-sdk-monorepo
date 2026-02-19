import { DateLevels } from '@sisense/sdk-data';

export const dateLevelGranularities = [
  { value: DateLevels.Years, displayValue: 'filterEditor.datetimeLevels.year' },
  { value: DateLevels.Quarters, displayValue: 'filterEditor.datetimeLevels.quarter' },
  { value: DateLevels.Months, displayValue: 'filterEditor.datetimeLevels.month' },
  { value: DateLevels.Weeks, displayValue: 'filterEditor.datetimeLevels.week' },
  { value: DateLevels.Days, displayValue: 'filterEditor.datetimeLevels.day' },
];

const timeLevelGranularities = [
  { value: DateLevels.AggHours, displayValue: 'filterEditor.datetimeLevels.aggrigatedHour' },
  {
    value: DateLevels.AggMinutesRoundTo15,
    displayValue: 'filterEditor.datetimeLevels.aggrigatedMinutesRoundTo15',
  },
];

export const granularities = [...dateLevelGranularities, ...timeLevelGranularities];
