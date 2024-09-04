/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/default-param-last */
/* eslint-disable max-params */
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import startOfWeek from 'date-fns/startOfWeek';

import addDays from 'date-fns/addDays';
import addQuarters from 'date-fns/addQuarters';
import addWeeks from 'date-fns/addWeeks';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import getHours from 'date-fns/getHours';
import getMonth from 'date-fns/getMonth';
import addYears from 'date-fns/addYears';
import getQuarter from 'date-fns/getQuarter';
import getTime from 'date-fns/getTime';
import parseISO from 'date-fns/parseISO';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import startOfQuarter from 'date-fns/startOfQuarter';
import startOfYear from 'date-fns/startOfYear';
import subDays from 'date-fns/subDays';
import subQuarters from 'date-fns/subQuarters';
import subWeeks from 'date-fns/subWeeks';
import subYears from 'date-fns/subYears';
import { enUS, de, fr, es, it, ja, ko, nl, pt, ru, tr, zhCN } from 'date-fns/locale';

import range from 'lodash-es/range';

export type SystemSettings = { language: string };

export const getBaseDateFnsLocale = (systemSettings?: SystemSettings): Locale => {
  switch (systemSettings?.language?.split('-')[0]) {
    case 'de':
      return de;
    case 'fr':
      return fr;
    case 'es':
      return es;
    case 'it':
      return it;
    case 'ja':
      return ja;
    case 'ko':
      return ko;
    case 'nl':
      return nl;
    case 'pt':
      return pt;
    case 'ru':
      return ru;
    case 'tr':
      return tr;
    case 'zh':
      return zhCN;
    default:
      return enUS;
  }
};

export enum DatePeriod {
  YEAR = 'years',
  QUARTER = 'quarters',
  MONTH = 'months',
  WEEK = 'weeks',
  DATE = 'dates',
}

export type DateFnsDate = Date | number;

type DatePeriodConfig<T> = { [key in DatePeriod]: T };

const START_OF_PERIOD_FN: DatePeriodConfig<(d: DateFnsDate, locale: Locale) => Date> = {
  [DatePeriod.DATE]: (d) => startOfDay(d),
  [DatePeriod.MONTH]: (d) => startOfMonth(d),
  [DatePeriod.QUARTER]: (d) => startOfQuarter(d),
  [DatePeriod.WEEK]: (d, locale) => startOfWeek(d, { locale }),
  [DatePeriod.YEAR]: (d) => startOfYear(d),
};
export const startOfPeriod = (period: DatePeriod, date: DateFnsDate, locale: Locale) =>
  START_OF_PERIOD_FN[period](date, locale);

const FORMAT_PERIOD_FN: DatePeriodConfig<(d: DateFnsDate, locale: Locale) => string> = {
  [DatePeriod.DATE]: (d, locale) => format(d, 'P', { locale }),
  [DatePeriod.MONTH]: (d, locale) => format(d, 'MMMM, y', { locale }),
  [DatePeriod.QUARTER]: (d, locale) => format(d, 'QQQ, y', { locale }),
  [DatePeriod.WEEK]: (d, locale) => format(d, 'w, Y', { locale }),
  [DatePeriod.YEAR]: (d, locale) => format(d, 'y', { locale }),
};
export const formatPeriod = (period: ExtendedDatePeriod, date: number, locale: Locale) =>
  isPseudoDatePeriod(period)
    ? formatPseudoPeriod(period, date, locale)
    : FORMAT_PERIOD_FN[period](date, locale);

export const parseDataTableDateValue = (value: string) => parseISO(value);

export const toPeriodCompareValue = (period: ExtendedDatePeriod, value: string, locale: Locale) => {
  return isPseudoDatePeriod(period)
    ? toPseudoPeriodCompareValue(period, value)
    : getTime(startOfPeriod(period, parseDataTableDateValue(value), locale));
};

export const periodCompareValueForSpecificDate = (
  period: DatePeriod,
  date: Date | number,
  locale: Locale,
) => getTime(startOfPeriod(period, date, locale));

export const periodCompareValueForNow = (period: DatePeriod, locale: Locale) =>
  periodCompareValueForSpecificDate(period, new Date(), locale);

const SUB_PERIOD_FN: DatePeriodConfig<(d: DateFnsDate, n: number) => Date> = {
  [DatePeriod.DATE]: (d, n) => subDays(d, n),
  [DatePeriod.MONTH]: (d, n) => subMonths(d, n),
  [DatePeriod.QUARTER]: (d, n) => subQuarters(d, n),
  [DatePeriod.WEEK]: (d, n) => subWeeks(d, n),
  [DatePeriod.YEAR]: (d, n) => subYears(d, n),
};

export const periodCompareValueForPastPeriod = (
  period: DatePeriod,
  num: number,
  refDate: number = Date.now(),
  locale: Locale,
) => getTime(startOfPeriod(period, SUB_PERIOD_FN[period](refDate, num), locale));

const ADD_PERIOD_FN: DatePeriodConfig<(d: DateFnsDate, n: number) => Date> = {
  [DatePeriod.DATE]: (d, n) => addDays(d, n),
  [DatePeriod.MONTH]: (d, n) => addMonths(d, n),
  [DatePeriod.QUARTER]: (d, n) => addQuarters(d, n),
  [DatePeriod.WEEK]: (d, n) => addWeeks(d, n),
  [DatePeriod.YEAR]: (d, n) => addYears(d, n),
};

export const periodCompareValueForFuturePeriod = (
  period: DatePeriod,
  num: number,
  refDate: number = Date.now(),
  locale: Locale,
) => getTime(startOfPeriod(period, ADD_PERIOD_FN[period](refDate, num), locale));

// used in some lists as extended options within
// same dropdown as DatePeriod
export enum PseudoDatePeriod {
  QUARTER_NUM = 'quarterNumber',
  MONTH_NAME = 'monthName',
  DAY_OF_WEEK = 'dayOfWeek',
  TIME_OF_DAY = 'timeOfDay',
}
export type ExtendedDatePeriod = DatePeriod | PseudoDatePeriod;
export const isDatePeriod = (period: ExtendedDatePeriod): period is DatePeriod => {
  return (
    period === DatePeriod.DATE ||
    period === DatePeriod.MONTH ||
    period === DatePeriod.QUARTER ||
    period === DatePeriod.WEEK ||
    period === DatePeriod.YEAR
  );
};
export const isPseudoDatePeriod = (period: ExtendedDatePeriod): period is PseudoDatePeriod => {
  return !isDatePeriod(period);
};
export type PseudoDatePeriodConfig<T> = { [key in PseudoDatePeriod]: T };

const quarterByIdx = (idx: number, locale: Locale) => {
  const date = new Date();
  date.setMonth(idx * 3, 1);
  return format(date, 'qqq', { locale });
};

const monthByIdx = (idx: number, locale: Locale) => {
  const date = new Date();
  date.setMonth(idx, 1);
  return format(date, 'LLLL', { locale });
};

const dayOfWeekByIdx = (idx: number, locale: Locale) => {
  const date = new Date(2022, 0, 2 + idx);
  return format(date, 'cccc', { locale });
};

const hourOfDayByIdx = (idx: number, locale: Locale) => {
  const date = new Date();
  date.setHours(idx, 0, 0);
  return format(date, 'HH:mm:ss', { locale });
};

const FORMAT_PSEUDO_PERIOD_FN: PseudoDatePeriodConfig<(d: number, locale: Locale) => string> = {
  [PseudoDatePeriod.QUARTER_NUM]: (i, locale) => quarterByIdx(i, locale),
  [PseudoDatePeriod.MONTH_NAME]: (i, locale) => monthByIdx(i, locale),
  [PseudoDatePeriod.DAY_OF_WEEK]: (i, locale) => dayOfWeekByIdx(i, locale),
  [PseudoDatePeriod.TIME_OF_DAY]: (i, locale) => hourOfDayByIdx(i, locale),
};

export const formatPseudoPeriod = (period: PseudoDatePeriod, date: number, locale: Locale) =>
  FORMAT_PSEUDO_PERIOD_FN[period](date, locale);

export const PSEUDO_PERIOD_VALUES: PseudoDatePeriodConfig<number[]> = {
  [PseudoDatePeriod.QUARTER_NUM]: range(4),
  [PseudoDatePeriod.MONTH_NAME]: range(12),
  [PseudoDatePeriod.DAY_OF_WEEK]: range(7),
  [PseudoDatePeriod.TIME_OF_DAY]: range(24),
};

const PSEUDO_PERIOD_FN: PseudoDatePeriodConfig<(date: DateFnsDate) => number> = {
  [PseudoDatePeriod.QUARTER_NUM]: (date: DateFnsDate) => getQuarter(date) - 1,
  [PseudoDatePeriod.MONTH_NAME]: getMonth,
  [PseudoDatePeriod.DAY_OF_WEEK]: getDay,
  [PseudoDatePeriod.TIME_OF_DAY]: getHours,
};

export const toPseudoPeriodCompareValue = (period: PseudoDatePeriod, value: string) =>
  PSEUDO_PERIOD_FN[period](parseDataTableDateValue(value));

export const today = () => startOfDay(Date.now());
