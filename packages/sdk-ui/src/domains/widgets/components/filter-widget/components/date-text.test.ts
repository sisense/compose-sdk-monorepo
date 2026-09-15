import { de, enGB, enUS, ja, ko, nl, ru, zhCN } from 'date-fns/locale';
import { describe, expect, it } from 'vitest';

import {
  asCalendarDay,
  backspaceAt,
  dateMaskFromPattern,
  dateProblemMessage,
  dateSegments,
  dateTemplateCells,
  dateTemplateString,
  dayKey,
  DEFAULT_DATE_MASK,
  deleteAt,
  firstEmptyCaret,
  formatDateInput,
  nextSegmentCaret,
  parseDateInput,
  typeDigitAt,
  validateDateInput,
} from './date-text';

/** `MM/DD/YYYY` — the `en-US` reader's format, and this file's default subject. */
const us = DEFAULT_DATE_MASK;
/** `DD.MM.YYYY` — day first, and a separator that is also a regex metacharacter. */
const german = dateMaskFromPattern('dd.MM.y');
/** `YYYY/MM/DD` — year first, so the four-wide segment is no longer last. */
const japanese = dateMaskFromPattern('y/MM/dd');

describe('dateMaskFromPattern', () => {
  /**
   * AC-5: the placeholder is the locale's own pattern, never a hard-coded literal. These
   * are the real `formatLong.date({ width: 'short' })` strings of the locales sdk-ui maps,
   * so a date-fns upgrade that reshapes one of them fails here rather than in the field.
   */
  it.each([
    ['en-US', enUS, 'MM/DD/YYYY'],
    ['en-GB', enGB, 'DD/MM/YYYY'],
    ['de', de, 'DD.MM.YYYY'],
    ['ru', ru, 'DD.MM.YYYY'],
    ['nl', nl, 'DD-MM-YYYY'],
    ['ja', ja, 'YYYY/MM/DD'],
    ['ko', ko, 'YYYY.MM.DD'],
    ['zh-CN', zhCN, 'YYYY-MM-DD'],
  ])('reads %s as %s', (_label, locale, template) => {
    const pattern = locale.formatLong!.date({ width: 'short' });
    expect(dateMaskFromPattern(pattern).template).toBe(template);
  });

  /* A locale asking for a two-digit year (`zh-CN` is `yy-MM-dd`) is widened to four on
     purpose: a filter date has to name its century. */
  it('always gives the year four cells, whatever the pattern asked for', () => {
    expect(dateMaskFromPattern('yy-MM-dd').template).toBe('YYYY-MM-DD');
    expect(dateMaskFromPattern('y.MM.dd').template).toBe('YYYY.MM.DD');
  });

  it('carries the separator and the segment order off the pattern', () => {
    expect(german.separator).toBe('.');
    expect(german.segments.map((segment) => segment.unit)).toEqual(['day', 'month', 'year']);
    expect(japanese.segments.map((segment) => segment.unit)).toEqual(['year', 'month', 'day']);
  });

  it('places each segment at its own caret index', () => {
    expect(us.starts).toEqual([0, 3, 6]);
    // Year first: the day now starts at 8, not 6.
    expect(japanese.starts).toEqual([0, 5, 8]);
    expect(japanese.length).toBe(10);
  });

  /* Anything the caret machinery could not walk falls back rather than rendering a broken
     template — a textual month, a missing unit, two different separators. */
  it.each([
    ['a textual month', 'd MMMM y'],
    ['a repeated unit', 'dd/dd/y'],
    ['a missing unit', 'dd/MM'],
    ['mismatched separators', 'dd.MM/y'],
    ['a multi-character separator', 'dd - MM - y'],
    /* Hungarian's own short pattern. Deliberately a fallback: it carries two-character
       separators and a trailing literal, and no locale the SDK maps needs that shape. */
    ['a trailing literal (Hungarian)', 'y. MM. dd.'],
    ['an empty pattern', ''],
  ])('falls back to the en-US mask for %s', (_label, pattern) => {
    expect(dateMaskFromPattern(pattern)).toEqual(DEFAULT_DATE_MASK);
  });
});

describe('validateDateInput', () => {
  it('accepts a real calendar day', () => {
    const { date, problem } = validateDateInput(us, '09/15/2026');
    expect(problem).toBeNull();
    expect(date).toEqual(new Date(2026, 8, 15));
  });

  it('treats empty text as no filter rather than a fault', () => {
    expect(validateDateInput(us, '')).toEqual({ date: null, problem: null });
    expect(validateDateInput(us, '   ')).toEqual({ date: null, problem: null });
  });

  /* AC-9: `malformed` is about the SHAPE only — text that is not the mask's own form. */
  it.each([
    ['a two-digit year', '1/2/26'],
    ['nonsense widths', '61/52/026'],
    ['a half-typed date', '09/'],
    ['a date missing most of its year', '12/01/2'],
    ['no separators at all', '09152026'],
    ['the wrong separators', '09-15-2026'],
  ])('reports %s as malformed', (_label, text) => {
    const { date, problem } = validateDateInput(us, text);
    expect(problem).toBe('malformed');
    expect(date).toBeNull();
  });

  /**
   * AC-10: the shape is right but no such day exists. That covers numbers far out of
   * range too — someone who typed `33/33/3333` followed the format, so repeating the
   * format back at them explains nothing; the date is the fault.
   */
  it.each([
    ['February 31st', '02/31/2026'],
    ['April 31st', '04/31/2026'],
    ['February 29th in a non-leap year', '02/29/2001'],
    ['a month above 12', '30/02/2020'],
    ['a month and day both out of range', '13/45/2026'],
    ['every digit out of range', '33/33/3333'],
    ['a zero month and day', '00/00/2026'],
  ])('reports %s as nonexistent', (_label, text) => {
    const { date, problem } = validateDateInput(us, text);
    expect(problem).toBe('nonexistent');
    expect(date).toBeNull();
  });

  /* A well-formed impossible date and a mis-shaped one must not share a message. */
  it('keeps the two faults on separate messages', () => {
    expect(dateProblemMessage(us, 'malformed').key).not.toBe(
      dateProblemMessage(us, 'nonexistent').key,
    );
  });

  it('accepts February 29th in a leap year', () => {
    expect(validateDateInput(us, '02/29/2024').problem).toBeNull();
  });

  /* A day outside what the data covers is deliberately not a fault — the base can be
     queried past its current edges. */
  it('accepts a real day far outside any plausible data window', () => {
    expect(validateDateInput(us, '01/01/1900').problem).toBeNull();
    expect(validateDateInput(us, '12/31/2099').problem).toBeNull();
  });

  /**
   * AC-22: a date the locale accepts is never reported as a format error. The same eight
   * digits mean different days in different masks, and each mask must read its own.
   */
  it('reads the same digits by the mask it was given', () => {
    expect(validateDateInput(german, '24.11.2009').date).toEqual(new Date(2009, 10, 24));
    expect(validateDateInput(japanese, '2009/11/24').date).toEqual(new Date(2009, 10, 24));
    expect(validateDateInput(us, '11/24/2009').date).toEqual(new Date(2009, 10, 24));
  });

  /* Day 11, month 24 — a day the German mask can hold and the US one cannot, and vice
     versa. The complaint has to be about the date, not the format, in both directions. */
  it('reports a day-month swap as nonexistent rather than malformed', () => {
    expect(validateDateInput(german, '11.24.2009').problem).toBe('nonexistent');
    expect(validateDateInput(us, '24/11/2009').problem).toBe('nonexistent');
  });

  it("reports another mask's separators as malformed", () => {
    expect(validateDateInput(german, '11/24/2009').problem).toBe('malformed');
    expect(validateDateInput(us, '24.11.2009').problem).toBe('malformed');
  });
});

describe('dateProblemMessage', () => {
  it('names one key per fault', () => {
    expect(dateProblemMessage(us, 'malformed').key).toBe('filterWidget.calendar.formatError');
    expect(dateProblemMessage(us, 'nonexistent').key).toBe('filterWidget.calendar.nonexistent');
  });

  /**
   * AC-9: the format message carries the reader's own pattern as a value, so translators
   * never bake one in. Each mask must hand its own template to the message.
   */
  it.each([
    ['en-US', us, 'MM/DD/YYYY'],
    ['de', german, 'DD.MM.YYYY'],
    ['ja', japanese, 'YYYY/MM/DD'],
  ])('interpolates the %s pattern into the format message', (_label, mask, template) => {
    expect(dateProblemMessage(mask, 'malformed').values).toEqual({ format: template });
  });

  /* `This date doesn't exist` names no pattern, so it takes no values at all — passing the
     format to every message alike would say it did. */
  it('gives the nonexistent message no values to interpolate', () => {
    expect(dateProblemMessage(german, 'nonexistent').values).toBeUndefined();
  });
});

describe('parseDateInput', () => {
  it('rejects an overflowing day rather than rolling it forward', () => {
    // `new Date(2026, 1, 31)` would silently become March 3rd.
    expect(parseDateInput(us, '02/31/2026')).toBeNull();
  });

  it('reads a single-digit month and day', () => {
    expect(parseDateInput(us, '9/5/2026')).toEqual(new Date(2026, 8, 5));
    expect(parseDateInput(german, '5.9.2026')).toEqual(new Date(2026, 8, 5));
  });

  /**
   * The multi-argument `Date` constructor maps years 0–99 onto 1900–1999, so
   * `new Date(1, 0, 1)` is 1901. A four-digit year the reader typed has to survive as
   * written, or the stored day is a different century from the one on screen.
   */
  it.each([
    ['0001', '01/01/0001', 1],
    ['0026', '01/01/0026', 26],
    ['0099', '12/31/0099', 99],
    ['1999', '01/01/1999', 1999],
  ])('keeps year %s in its own century', (_label, text, year) => {
    expect(parseDateInput(us, text)?.getFullYear()).toBe(year);
  });
});

describe('asCalendarDay', () => {
  it('builds a real day, at midnight local time', () => {
    const day = asCalendarDay(2026, 9, 15);
    expect(day?.getFullYear()).toBe(2026);
    expect(day?.getMonth()).toBe(8);
    expect(day?.getDate()).toBe(15);
    expect([day?.getHours(), day?.getMinutes(), day?.getSeconds()]).toEqual([0, 0, 0]);
  });

  it.each([
    ['February 31st', 2026, 2, 31],
    ['April 31st', 2026, 4, 31],
    ['February 29th outside a leap year', 2001, 2, 29],
    ['month 0', 2026, 0, 15],
    ['month 13', 2026, 13, 15],
    ['day 0', 2026, 9, 0],
    ['day 32', 2026, 9, 32],
  ])('refuses %s', (_label, year, month, day) => {
    expect(asCalendarDay(year, month, day)).toBeNull();
  });

  it('accepts February 29th in a leap year', () => {
    expect(asCalendarDay(2024, 2, 29)?.getDate()).toBe(29);
  });
});

describe('formatDateInput', () => {
  it('zero-pads the month and day', () => {
    expect(formatDateInput(us, new Date(2026, 0, 2))).toBe('01/02/2026');
  });

  it('writes each mask in its own order and separator', () => {
    const date = new Date(2009, 10, 24);
    expect(formatDateInput(us, date)).toBe('11/24/2009');
    expect(formatDateInput(german, date)).toBe('24.11.2009');
    expect(formatDateInput(japanese, date)).toBe('2009/11/24');
  });

  it.each([
    ['en-US', us],
    ['de', german],
    ['ja', japanese],
  ])('round-trips through parseDateInput for %s', (_label, mask) => {
    const date = new Date(2026, 8, 15);
    expect(parseDateInput(mask, formatDateInput(mask, date))).toEqual(date);
  });
});

describe('dayKey', () => {
  it('ignores the time of day', () => {
    expect(dayKey(new Date(2026, 8, 15, 23, 59))).toBe(dayKey(new Date(2026, 8, 15, 0, 0)));
  });
});

describe('the template mask', () => {
  it('always renders ten cells, however far the value is filled', () => {
    expect(dateTemplateCells(us, '')).toHaveLength(us.length);
    expect(dateTemplateCells(us, '09')).toHaveLength(us.length);
    expect(dateTemplateCells(us, '09/15/2026')).toHaveLength(us.length);
  });

  it('shows a cleared middle part as its format letters, not a bogus zero', () => {
    expect(dateTemplateString(us, '09//2026')).toBe('09/DD/2026');
    expect(dateTemplateString(german, '09..2026')).toBe('09.MM.2026');
  });

  it("spells the unfilled tail in the mask's own letters", () => {
    expect(dateTemplateString(us, '')).toBe('MM/DD/YYYY');
    expect(dateTemplateString(german, '')).toBe('DD.MM.YYYY');
    expect(dateTemplateString(japanese, '')).toBe('YYYY/MM/DD');
  });

  it('marks typed digits as filled and format letters as not', () => {
    const cells = dateTemplateCells(us, '09');
    expect(cells[0]).toEqual({ text: '0', kind: 'digit', filled: true });
    expect(cells[3]).toEqual({ text: 'D', kind: 'placeholder', filled: false });
  });

  it('carries the mask separator into the separator cells', () => {
    const cells = dateTemplateCells(german, '24');
    expect(cells[2]).toEqual({ text: '.', kind: 'sep', filled: true });
  });

  it('splits a value into its three groups', () => {
    expect(dateSegments(us, '09/15/2026')).toEqual(['09', '15', '2026']);
    expect(dateSegments(us, '09//2026')).toEqual(['09', '', '2026']);
    expect(dateSegments(us, '')).toEqual(['', '', '']);
    expect(dateSegments(german, '24.11.2009')).toEqual(['24', '11', '2009']);
    expect(dateSegments(japanese, '2009/11/24')).toEqual(['2009', '11', '24']);
  });
});

describe('typeDigitAt', () => {
  /** Types every digit in turn from an empty field, as a reader would. */
  const typeAll = (mask: typeof us, digits: string) =>
    [...digits].reduce((state, digit) => typeDigitAt(mask, state.masked, state.caret, digit), {
      masked: '',
      caret: 0,
    });

  it('fills the mask left to right, hopping the separator between parts', () => {
    const typed = typeAll(us, '09152026');
    expect(typed.masked).toBe('09/15/2026');
    expect(typed.caret).toBe(us.length);
  });

  /* The same keystrokes on a `.` mask, to prove nothing is keyed to a slash. */
  it('fills a dot-separated day-first mask the same way', () => {
    const typed = typeAll(german, '24112009');
    expect(typed.masked).toBe('24.11.2009');
    expect(typed.caret).toBe(german.length);
  });

  /* Year first means the first segment is four wide — the case a fixed `[0,3,6]` broke. */
  it('fills a year-first mask, whose first part is four cells', () => {
    const typed = typeAll(japanese, '20091124');
    expect(typed.masked).toBe('2009/11/24');
    expect(typed.caret).toBe(japanese.length);
  });

  it('overwrites the cell the caret sits on', () => {
    expect(typeDigitAt(us, '09/15/2026', 0, '1').masked).toBe('19/15/2026');
  });

  it('ignores a digit typed past a complete date', () => {
    const full = { masked: '09/15/2026', caret: us.length };
    expect(typeDigitAt(us, full.masked, full.caret, '7')).toEqual(full);
  });

  it('leaves the input value untouched', () => {
    const before = '09/15/2026';
    typeDigitAt(us, before, 0, '1');
    expect(before).toBe('09/15/2026');
  });
});

describe('backspaceAt and deleteAt', () => {
  it('backspace clears the digit before the caret, sliding the part left', () => {
    // Caret 4 sits on the day's second digit, so the `1` before it goes and the `5` slides.
    const { masked, caret } = backspaceAt(us, '09/15/2026', 4);
    expect(masked).toBe('09/5/2026');
    expect(caret).toBe(3);
  });

  it('backspace hops back over a separator', () => {
    const { masked, caret } = backspaceAt(us, '09/15/2026', 3);
    expect(masked).toBe('0/15/2026');
    expect(caret).toBe(1);
  });

  it('backspace hops back over a dot just as it does a slash', () => {
    const { masked, caret } = backspaceAt(german, '24.11.2009', 3);
    expect(masked).toBe('2.11.2009');
    expect(caret).toBe(1);
  });

  /* Crossing into a four-wide first segment: the caret lands on its last cell, index 3. */
  it('backspace crosses into a year-first maskleading segment', () => {
    const { masked, caret } = backspaceAt(japanese, '2009/11/24', 5);
    expect(masked).toBe('200/11/24');
    expect(caret).toBe(3);
  });

  it('backspace at the very start changes nothing', () => {
    expect(backspaceAt(us, '09/15/2026', 0)).toEqual({ masked: '09/15/2026', caret: 0 });
  });

  it('delete clears the digit at the caret and leaves it put', () => {
    const { masked, caret } = deleteAt(us, '09/15/2026', 3);
    expect(masked).toBe('09/5/2026');
    expect(caret).toBe(3);
  });

  it('delete on a separator steps into the next part', () => {
    const { masked, caret } = deleteAt(german, '24.11.2009', 2);
    expect(masked).toBe('24.1.2009');
    expect(caret).toBe(3);
  });
});

describe('caret homing', () => {
  it('finds the first unfilled cell', () => {
    expect(firstEmptyCaret(us, '')).toBe(0);
    expect(firstEmptyCaret(us, '09')).toBe(3);
    expect(firstEmptyCaret(us, '09/1')).toBe(4);
    expect(firstEmptyCaret(us, '09/15/2026')).toBe(us.length);
  });

  it('finds it against a year-first mask too', () => {
    expect(firstEmptyCaret(japanese, '2009')).toBe(5);
    expect(firstEmptyCaret(japanese, '2009/11')).toBe(8);
  });

  it('jumps to the next part, so a short month need not be padded', () => {
    expect(nextSegmentCaret(us, 1)).toBe(3);
    expect(nextSegmentCaret(us, 4)).toBe(6);
    expect(nextSegmentCaret(us, 8)).toBe(us.length);
    // Year first: from inside the year to the month at 5.
    expect(nextSegmentCaret(japanese, 2)).toBe(5);
  });
});
