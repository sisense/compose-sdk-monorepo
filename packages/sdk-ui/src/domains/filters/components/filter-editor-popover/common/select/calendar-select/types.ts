export enum CalendarSelectTypes {
  SINGLE_SELECT = 'single-select',
  MULTI_SELECT = 'multi-select',
}

export type CalendarRangeValue = {
  from?: Date;
  to?: Date;
};

export type CalendarSelectLimits = {
  minDate?: Date;
  maxDate?: Date;
};
