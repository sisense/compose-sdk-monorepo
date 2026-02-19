export enum CalendarSelectTypes {
  SINGLE_SELECT = 'single-select',
  MULTI_SELECT = 'multi-select',
  RANGE_FROM_SELECT = 'range-from-select',
  RANGE_TO_SELECT = 'range-to-select',
}

export type CalendarRangeValue = {
  from?: Date;
  to?: Date;
};

export type CalendarSelectLimits = {
  minDate?: Date;
  maxDate?: Date;
};
