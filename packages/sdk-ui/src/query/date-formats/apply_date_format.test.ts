import {
  applyDateFormat,
  defaultDateConfig,
  JAN,
  JUL,
  MON,
  TUE,
  WED,
  THU,
  FRI,
  SAT,
  SUN,
  YEARS,
  DAYS,
} from './apply_date_format';
import type { DateConfig } from './apply_date_format';
import { enUS, fr } from 'date-fns/locale';

const zero = new Date(0);
const dec292009 = new Date('2009-12-29T06:28:13.999Z');
const apr142012 = new Date('2012-04-14T23:49:57.028Z');
const feb292020 = new Date('2020-02-29T15:03:44.851Z');
const aug220013 = new Date('0013-08-22T13:21:36.007Z'); // SNS-43527: years 00xx should render as 19xx

describe('when the fiscal year feature flag is disabled', () => {
  const fiscalDisabledConfig: DateConfig = defaultDateConfig;

  test.each([
    {
      locale: enUS,
      date: dec292009,
      format: 'yyyy Q ww',
      expected: '2009 Q4 01',
    },
    {
      locale: enUS,
      date: apr142012,
      format: 'yyyy Q w',
      expected: '2012 Q2 16',
    },
    {
      locale: enUS,
      date: feb292020,
      format: 'yyyy Q w',
      expected: '2020 Q1 9',
    },
    {
      locale: enUS,
      date: aug220013,
      format: 'yyyy Q ww',
      expected: '1913 Q3 34',
    },

    { locale: enUS, date: zero, format: 'y', expected: '1970' },
    { locale: enUS, date: zero, format: 'yy', expected: '70' },
    { locale: enUS, date: zero, format: 'yyy', expected: '701970' },
    { locale: enUS, date: zero, format: 'yyyy', expected: '1970' },

    { locale: enUS, date: zero, format: 'yp', expected: '69' },
    { locale: enUS, date: zero, format: 'ypypyp', expected: '696969' },
    { locale: enUS, date: zero, format: 'yyyp-yyyy', expected: '1969-1970' },
    { locale: enUS, date: zero, format: 'yp-yy', expected: '69-70' },

    { locale: enUS, date: zero, format: 'Q', expected: 'Q1' },
    { locale: enUS, date: zero, format: 'QQ', expected: 'Quarter 1' },
    { locale: enUS, date: zero, format: 'QQQ', expected: 'Quarter 1Q1' },
    {
      locale: enUS,
      date: zero,
      format: 'QQQQ',
      expected: 'Quarter 1Quarter 1',
    },
    {
      locale: enUS,
      date: zero,
      format: 'Q yp yyyy QQ',
      expected: 'Q1 69 1970 Quarter 1',
    },
    { locale: enUS, date: zero, format: 'Q yyyy', expected: 'Q1 1970' },
    { locale: enUS, date: zero, format: 'yyyy Q', expected: '1970 Q1' },

    { locale: enUS, date: zero, format: 'M/yy', expected: '1/70' },
    { locale: enUS, date: zero, format: 'MM/yyyy', expected: '01/1970' },
    { locale: enUS, date: zero, format: 'MMM yyyy', expected: 'Jan 1970' },
    {
      locale: enUS,
      date: zero,
      format: 'MMMM yyyy',
      expected: 'January 1970',
    },

    { locale: enUS, date: zero, format: 'w', expected: '1' },
    { locale: enUS, date: zero, format: 'ww', expected: '01' },
    { locale: enUS, date: zero, format: 'w yyyy', expected: '1 1970' },
    { locale: enUS, date: zero, format: 'ww yyyy', expected: '01 1970' },

    { locale: enUS, date: zero, format: 'HH:mm', expected: '00:00' },
    { locale: enUS, date: zero, format: 'HH', expected: '00' },
    { locale: enUS, date: zero, format: 'h a', expected: '12 am' },

    {
      locale: enUS,
      date: zero,
      format: 'MM/dd/y HH:mm',
      expected: '01/01/1970 00:00',
    },
    {
      locale: enUS,
      date: zero,
      format: 'MM/dd/y HH',
      expected: '01/01/1970 00',
    },
    {
      locale: enUS,
      date: zero,
      format: 'MM/dd/y h a',
      expected: '01/01/1970 12 am',
    },
    {
      locale: enUS,
      date: zero,
      format: 'MM-dd-yyyy',
      expected: '01-01-1970',
    },
    {
      locale: enUS,
      date: zero,
      format: 'EEE MMM. d yyyy',
      expected: 'Thu Jan. 1 1970',
    },
    {
      locale: enUS,
      date: zero,
      format: 'EEEE MMMM d yyyy',
      expected: 'Thursday January 1 1970',
    },
    {
      locale: fr,
      date: zero,
      format: 'EEE MMM dd yyyy',
      expected: 'jeu. janv. 01 1970',
    },
    {
      locale: fr,
      date: zero,
      format: 'EEEE MMMM dd yyyy',
      expected: 'jeudi janvier 01 1970',
    },

    /*
     * Angular text dates
     */
    {
      locale: fr,
      date: dec292009,
      format: 'short',
      expected: '12/29/09 6:28 am',
    },
    {
      locale: enUS,
      date: dec292009,
      format: 'short',
      expected: '12/29/09 6:28 am',
    },
    {
      locale: enUS,
      date: dec292009,
      format: 'fullDate',
      expected: 'Tuesday, December 29, 2009',
    },
    {
      locale: enUS,
      date: dec292009,
      format: 'longDate',
      expected: 'December 29, 2009',
    },
    {
      locale: enUS,
      date: dec292009,
      format: 'mediumDate',
      expected: 'Dec 29, 2009',
    },
    {
      locale: enUS,
      date: dec292009,
      format: 'shortDate',
      expected: '12/29/09',
    },
    {
      locale: enUS,
      date: dec292009,
      format: 'mediumTime',
      expected: '6:28:13 am',
    },
    {
      locale: enUS,
      date: dec292009,
      format: 'shortTime',
      expected: '6:28 am',
    },
    {
      locale: enUS,
      date: dec292009,
      format: 'fullDate mediumTime',
      expected: 'Tuesday, December 29, 2009 6:28:13 am',
    },
    {
      locale: enUS,
      date: dec292009,
      format: 'shortDate shortTime',
      expected: '12/29/09 6:28 am',
    },
  ])(
    'Locale: $locale.code | Date: $date | Format: $format | Expected: $expected',
    ({ locale, date, format, expected }) => {
      const actual = applyDateFormat(date, format, locale, fiscalDisabledConfig);
      expect(actual).toBe(expected);
    },
  );

  describe('different settings for the first day of the week', () => {
    test.each([
      { date: zero, weekFirstDay: SUN, expected: '1' },
      { date: zero, weekFirstDay: MON, expected: '1' },
      { date: zero, weekFirstDay: TUE, expected: '1' },
      { date: zero, weekFirstDay: WED, expected: '1' },
      { date: zero, weekFirstDay: THU, expected: '1' },
      { date: zero, weekFirstDay: FRI, expected: '1' },
      { date: zero, weekFirstDay: SAT, expected: '1' },
    ])(
      'Date: $date | Week 1st day: $weekFirstDay | Expected: $expected',
      ({ date, weekFirstDay, expected }) => {
        const locale = enUS;
        const config: DateConfig = {
          weekFirstDay,
          isFiscalOn: false,
          fiscalMonth: JAN,
          timeZone: 'Europe/Paris',
          selectedDateLevel: DAYS,
        };
        const actual = applyDateFormat(date, 'w', locale, config);
        expect(actual).toBe(expected);
      },
    );
  });
});

// TODO(norman): Add more test case permutations to check:
// - Fiscal year yyyy is correct
// - Fiscal quarter Q is correct
// - Fiscal week number ww is correct
//   - This still needs code to be reimplemented in a simpler way, perhaps using
//     https://date-fns.org/v2.29.3/docs/getWeekYear and its options.weekStartsOn,
//     or perhaps just copying over the existing PrismWebClient code for `ww` and `w`.
describe.skip('when the fiscal year feature flag is enabled', () => {
  const UTC = 'UTC';

  test.each([
    {
      date: dec292009,
      fiscalMonth: JUL,
      weekFirstDay: MON,
      level: YEARS,
      zone: UTC,
      expected: 'TODO',
    },
    {
      date: apr142012,
      fiscalMonth: JUL,
      weekFirstDay: MON,
      level: YEARS,
      zone: UTC,
      expected: 'TODO',
    },
    {
      date: feb292020,
      fiscalMonth: JUL,
      weekFirstDay: MON,
      level: YEARS,
      zone: UTC,
      expected: 'TODO',
    },
    {
      date: aug220013,
      fiscalMonth: JUL,
      weekFirstDay: MON,
      level: YEARS,
      zone: UTC,
      expected: 'TODO',
    },
  ])(
    'Date: $date | Fiscal Month: $fiscalMonth | Week 1st Day: $weekFirstDay | Level: $selectedDateLevel | Zone: $zone | Expected: $expected',
    ({ date, fiscalMonth, weekFirstDay, level, zone, expected }) => {
      const cfg: DateConfig = {
        isFiscalOn: true,
        fiscalMonth,
        weekFirstDay,
        selectedDateLevel: level,
        timeZone: zone,
      };
      const locale = enUS;
      const format = `'FY' yyyy. Q. 'Week' ww. MMMM d HH:mm A Z`;
      const actual = applyDateFormat(date, format, locale, cfg);
      expect(actual).toBe(expected);
    },
  );
});

describe('behavior that is the same regardless of fiscal year settings', () => {
  describe(`milliseconds characters that Angular's date filter supports but date-fns supports with different characters`, () => {
    test.each([
      { locale: enUS, date: dec292009, format: 'sss', expected: '999' },
      { locale: enUS, date: apr142012, format: 'sss', expected: '028' },
      { locale: enUS, date: aug220013, format: 'sss', expected: '007' },
    ])(
      'Locale: $locale.code | Date: $date | Format: $format | Expected: $expected',
      ({ locale, date, format, expected }) => {
        const actual = applyDateFormat(date, format, locale, defaultDateConfig);
        expect(actual).toBe(expected);
      },
    );
  });

  describe('24-hour characters date-fns supports, but were added to PrismWebClient using moment.js', () => {
    // https://code.angularjs.org/1.8.2/docs/api/ng/filter/date is the `var def = filter('date');` in PrismWebClient's
    // https://gitlab.sisense.com/SisenseTeam/Product/FE/PrismWebClient/-/blob/f4b97f057ed22e578fc8ca27491096a275c89eca/src/base.module/filters/levelDateFilter.js
    // implementation. Because Angular's `date` filter did not have
    // support for these formats below, there was additional Moment.js
    // code in PrismWebClient to support these. But `date-fns` already
    // supports these formats below, which these cases confirm.

    test.each([
      { locale: enUS, date: zero, format: 'k', expected: '24' },
      { locale: enUS, date: zero, format: 'kk', expected: '24' },
      { locale: enUS, date: dec292009, format: 'k', expected: '6' },
      { locale: enUS, date: dec292009, format: 'kk', expected: '06' },
    ])(
      'Locale: $locale.code | Date: $date | Format: $format | Expected: $expected',
      ({ locale, date, format, expected }) => {
        const actual = applyDateFormat(date, format, locale, defaultDateConfig);
        expect(actual).toBe(expected);
      },
    );
  });

  describe('AM/PM text', () => {
    test.each([
      { locale: enUS, date: dec292009, format: 'a', expected: 'am' },
      { locale: enUS, date: dec292009, format: 'A', expected: 'AM' },
      { locale: enUS, date: dec292009, format: 'aa', expected: 'amam' },
      { locale: enUS, date: dec292009, format: 'AA', expected: 'AMAM' },

      { locale: enUS, date: apr142012, format: 'a', expected: 'pm' },
      { locale: enUS, date: apr142012, format: 'A', expected: 'PM' },
      { locale: enUS, date: apr142012, format: 'aa', expected: 'pmpm' },
      { locale: enUS, date: apr142012, format: 'AA', expected: 'PMPM' },
    ])(
      'Locale: $locale.code | Date: $date | Format: $format | Expected: $expected',
      ({ locale, date, format, expected }) => {
        const actual = applyDateFormat(date, format, locale, defaultDateConfig);
        expect(actual).toBe(expected);
      },
    );
  });

  describe('timezone', () => {
    test.each([
      {
        locale: enUS,
        date: zero,
        zone: 'America/Phoenix',
        format: 'Z',
        expected: '-0700',
      },
      {
        locale: enUS,
        date: zero,
        zone: 'Europe/Paris',
        format: 'Z',
        expected: '+0100',
      },
    ])(
      'Locale: $locale.code | Date: $date | Zone: $zone | Format: $format | Expected: $expected',
      ({ locale, date, zone, format, expected }) => {
        const actual = applyDateFormat(date, format, locale, {
          ...defaultDateConfig,
          timeZone: zone,
        });
        expect(actual).toBe(expected);
      },
    );
  });
});
