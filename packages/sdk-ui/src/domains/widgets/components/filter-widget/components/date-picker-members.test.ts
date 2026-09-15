import { describe, expect, it } from 'vitest';

import { asDateMember, asDateMembers, asDateText, asDateTexts } from './date-picker-members';
import { dateMaskFromPattern, DEFAULT_DATE_MASK } from './date-text';

/** `MM/DD/YYYY` — the `en-US` reader's format. */
const us = DEFAULT_DATE_MASK;
/** `DD.MM.YYYY` — what a `de-DE` reader types. */
const german = dateMaskFromPattern('dd.MM.y');
/** `YYYY/MM/DD` — year first. */
const japanese = dateMaskFromPattern('y/MM/dd');

describe('asDateText', () => {
  it("reads a Day-level member in the reader's format", () => {
    expect(asDateText(us, '2026-09-15T00:00:00')).toBe('09/15/2026');
    expect(asDateText(german, '2026-09-15T00:00:00')).toBe('15.09.2026');
    expect(asDateText(japanese, '2026-09-15T00:00:00')).toBe('2026/09/15');
  });

  it('reads a member with no time part', () => {
    expect(asDateText(us, '2026-09-15')).toBe('09/15/2026');
  });

  it('returns null for anything that does not name a day', () => {
    expect(asDateText(us, 'Female')).toBeNull();
    expect(asDateText(us, '')).toBeNull();
    expect(asDateText(us, '2026')).toBeNull();
  });

  /* A member with the right shape but no such day must not be shown as a nearby one —
     `2026-02-31` read back as March 3rd would report a day the filter does not hold. */
  it('returns null for a well-shaped member that names no real day', () => {
    expect(asDateText(us, '2026-02-31T00:00:00')).toBeNull();
    expect(asDateText(us, '2025-02-29T00:00:00')).toBeNull();
  });

  /* Years below 100 are the trap in the multi-argument `Date` constructor, which maps
     0–99 onto 1900–1999. A four-digit year has to survive as written. */
  it('keeps a year below 100 in its own century', () => {
    expect(asDateText(us, '0001-01-01T00:00:00')).toBe('01/01/0001');
    expect(asDateText(us, '0099-12-31T00:00:00')).toBe('12/31/0099');
  });
});

describe('asDateMember', () => {
  it("writes the reader's format back as the day's first instant", () => {
    expect(asDateMember(us, '09/15/2026')).toBe('2026-09-15T00:00:00');
    expect(asDateMember(german, '15.09.2026')).toBe('2026-09-15T00:00:00');
    expect(asDateMember(japanese, '2026/09/15')).toBe('2026-09-15T00:00:00');
  });

  it('returns null for a day that is not on the calendar', () => {
    expect(asDateMember(us, '02/31/2026')).toBeNull();
    expect(asDateMember(us, '02/29/2025')).toBeNull();
    expect(asDateMember(german, '31.02.2026')).toBeNull();
  });

  it('returns null for text that names no date at all', () => {
    expect(asDateMember(us, '')).toBeNull();
    expect(asDateMember(us, '12/2026')).toBeNull();
    expect(asDateMember(us, 'Female')).toBeNull();
  });

  /**
   * An unpadded entry is a date the mask really can produce: typing a separator closes a
   * one-digit month and moves on without padding it. Apply accepts it, so this has to as
   * well — refusing it here dropped the day from the filter with nothing reported.
   */
  it('keeps an unpadded date, which the mask can produce', () => {
    expect(asDateMember(us, '9/5/2026')).toBe('2026-09-05T00:00:00');
    expect(asDateMember(german, '5.9.2026')).toBe('2026-09-05T00:00:00');
    expect(asDateMember(japanese, '2026/9/5')).toBe('2026-09-05T00:00:00');
  });

  it("returns null for text in another mask's format", () => {
    expect(asDateMember(german, '09/15/2026')).toBeNull();
    expect(asDateMember(us, '15.09.2026')).toBeNull();
  });
});

/**
 * AC-31 — the regression guard that stops localised input leaking into storage. What a
 * reader types is presentation; what is stored is one canonical form. So the same day
 * entered in any locale must produce the *same* member, and that member must read back
 * correctly for a reader in any other locale.
 */
describe('the stored member is canonical, not localised', () => {
  it('stores one member for the same day however it was typed', () => {
    const typed = [
      [us, '11/24/2009'],
      [german, '24.11.2009'],
      [japanese, '2009/11/24'],
    ] as const;

    const members = typed.map(([mask, text]) => asDateMember(mask, text));
    expect(members).toEqual(['2009-11-24T00:00:00', '2009-11-24T00:00:00', '2009-11-24T00:00:00']);
  });

  /* The spec's own example: a `de-DE` user saves `24.11.2009`, an `en-us` user opens the
     same dashboard and must see `11/24/2009` — the same day, their own format. */
  it('reads a member saved in one locale back in another', () => {
    const saved = asDateMember(german, '24.11.2009');
    expect(saved).toBe('2009-11-24T00:00:00');
    expect(asDateText(us, saved as string)).toBe('11/24/2009');
    expect(asDateText(japanese, saved as string)).toBe('2009/11/24');
  });

  it('never writes a mask separator into a member', () => {
    const members = asDateMembers(german, ['24.11.2009', '01.02.2020']);
    members.forEach((member) => expect(member).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00$/));
  });
});

describe('round-tripping', () => {
  /* The two directions have to agree exactly, or a selection would drift every time the
     panel opened and closed. */
  it.each([
    ['en-US', us, ['01/01/2020', '09/15/2026', '02/29/2024', '12/31/2099']],
    ['de', german, ['01.01.2020', '15.09.2026', '29.02.2024', '31.12.2099']],
    ['ja', japanese, ['2020/01/01', '2026/09/15', '2024/02/29', '2099/12/31']],
  ] as const)('preserves every %s date through member and back', (_label, mask, texts) => {
    texts.forEach((text) => {
      const member = asDateMember(mask, text);
      expect(member).not.toBeNull();
      expect(asDateText(mask, member as string)).toBe(text);
    });
  });

  /* Members are stored as ISO, whose lexicographic order is chronological — which is what
     lets the earliest selected date be found by a plain sort. That must hold whatever
     order the reader's own format puts the parts in. */
  it('orders members chronologically when sorted as strings', () => {
    const members = asDateMembers(us, ['09/15/2026', '01/02/2020', '12/31/2024']);
    expect([...members].sort()).toEqual([
      '2020-01-02T00:00:00',
      '2024-12-31T00:00:00',
      '2026-09-15T00:00:00',
    ]);
  });

  it('orders them the same way from a day-first mask', () => {
    const members = asDateMembers(german, ['15.09.2026', '02.01.2020', '31.12.2024']);
    expect([...members].sort()).toEqual([
      '2020-01-02T00:00:00',
      '2024-12-31T00:00:00',
      '2026-09-15T00:00:00',
    ]);
  });
});

describe('the list conversions', () => {
  it('drops members that do not name a day', () => {
    expect(asDateTexts(us, ['2026-09-15T00:00:00', 'Female', '2020-01-02T00:00:00'])).toEqual([
      '09/15/2026',
      '01/02/2020',
    ]);
  });

  it('drops text that does not name a real day', () => {
    expect(asDateMembers(us, ['09/15/2026', '02/31/2026'])).toEqual(['2026-09-15T00:00:00']);
  });
});
