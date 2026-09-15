import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { useThemeContext } from '@/infra/contexts/theme-provider';

import { DateIcon } from '../../../../icons';
import { useDatetimeFormatter } from '../../../hooks/use-datetime-formatter';
import { SelectField, SelectLabel } from '../base';
import { getCalendarSelectedItemsDisplayValue } from './utils';

type CalendarSelectFieldProps = {
  values: Date[];
  placeholder?: string;
  focus: boolean;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export const CalendarSelectField = forwardRef<HTMLDivElement, CalendarSelectFieldProps>(
  function CalendarSelectField({ values, placeholder, focus, ...rest }, ref) {
    const formatter = useDatetimeFormatter();
    const { themeSettings } = useThemeContext();

    return (
      <SelectField ref={ref} focus={focus} theme={themeSettings} {...rest}>
        <SelectLabel
          theme={themeSettings}
          style={{ opacity: values.length ? '100%' : '50%' }}
          aria-label="Value"
        >
          <>{getCalendarSelectedItemsDisplayValue(values, formatter) ?? placeholder}</>
        </SelectLabel>
        <DateIcon
          iconColor={themeSettings.general.popover.input.textColor}
          aria-label="Calendar icon"
          style={{ marginRight: '3px' }}
        />
      </SelectField>
    );
  },
);
