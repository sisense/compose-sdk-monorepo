import { ComponentProps } from 'react';

import { parseISOWithTimezoneCheck } from '@/shared/utils/parseISOWithTimezoneCheck';
import { DistributivePick } from '@/shared/utils/utility-types';

import { CalendarSelect, CalendarSelectTypes } from '../../common/select/calendar-select';
import { convertDateToMemberString } from '../../utils';

type DaysCalendarModeProps = DistributivePick<
  ComponentProps<typeof CalendarSelect>,
  'type' | 'value' | 'onChange'
>;

type DaysCalendarPropsOptions = {
  members: string[];
  multiSelectEnabled: boolean;
  onChange: (members: string[] | string) => void;
};

export function getDaysCalendarProps({
  members,
  multiSelectEnabled,
  onChange,
}: DaysCalendarPropsOptions): DaysCalendarModeProps {
  const selectedDates = members.map((member) => parseISOWithTimezoneCheck(member));

  return multiSelectEnabled
    ? {
        type: CalendarSelectTypes.MULTI_SELECT,
        value: selectedDates,
        onChange: (dates) => onChange(dates.map((date) => convertDateToMemberString(date))),
      }
    : {
        type: CalendarSelectTypes.SINGLE_SELECT,
        value: selectedDates[0],
        onChange: (date) => onChange(convertDateToMemberString(date)),
      };
}
