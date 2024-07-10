import {
  newDateFormatWithExpandedQuartersMasks,
  newDateFormatWithExpandedYearsMasks,
} from './fiscal-date-format-replacers';

describe('newDateFormatWithExpandedYearsMasks', () => {
  it('should substitute "yyyy" masks with numeric text', () => {
    const oldFormat = 'yyyy';
    const date = new Date('Thu Jan 01 2009 00:00:00 GMT+0700');
    const timeZone = 'UTC';
    const selectedDateLevel = 'days';
    const isFiscalOn = false;
    const fiscalMonth = 0;

    const newFormat = newDateFormatWithExpandedYearsMasks(
      oldFormat,
      date,
      timeZone,
      selectedDateLevel,
      isFiscalOn,
      fiscalMonth,
    );

    expect(newFormat).toBe('2009');
  });

  it('should substitute "MM/dd/yyyy HH:mm" masks with numeric text', () => {
    const oldFormat = 'MM/dd/yyyy HH:mm';
    const date = new Date('Fri Oct 02 2020 00:00:00 GMT+0700');
    const timeZone = 'UTC';
    const selectedDateLevel = 'days';
    const isFiscalOn = false;
    const fiscalMonth = 0;

    const newFormat = newDateFormatWithExpandedYearsMasks(
      oldFormat,
      date,
      timeZone,
      selectedDateLevel,
      isFiscalOn,
      fiscalMonth,
    );

    expect(newFormat).toBe('MM/dd/2020 HH:mm');
  });
});

describe('newDateFormatWithExpandedQuartersMasks', () => {
  it('should substitute "QQ" masks with quarter number', () => {
    const oldFormat = 'QQ';
    const date = new Date('Thu Jan 01 2009 00:00:00 GMT+0700');
    const selectedDateLevel = 'days';
    const fiscalMonth = 0;

    const newFormat = newDateFormatWithExpandedQuartersMasks(
      oldFormat,
      date,
      selectedDateLevel,
      fiscalMonth,
    );

    expect(newFormat).toBe(`'Quarter '4`);
  });

  it('should substitute "Q" masks with quarter number', () => {
    const oldFormat = 'Q';
    const date = new Date('Fri Oct 02 2020 00:00:00 GMT+0700');
    const selectedDateLevel = 'days';
    const fiscalMonth = 0;

    const newFormat = newDateFormatWithExpandedQuartersMasks(
      oldFormat,
      date,
      selectedDateLevel,
      fiscalMonth,
    );

    expect(newFormat).toBe(`'Q'4`);
  });
});
