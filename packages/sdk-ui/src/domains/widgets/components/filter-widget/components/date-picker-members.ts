/**
 * Translates between the members a date filter carries and the text the date picker shows.
 *
 * A filter stores a Day-level member as the day's first instant, `YYYY-MM-DDTHH:mm:ss`, with
 * no zone; the picker works in the reader's own date format. Both are read as calendar days,
 * so the conversion is done on the digits rather than through `Date` — going via `Date` would
 * introduce a timezone the members do not have, and shift the day either side of UTC.
 *
 * This module is the line between the two. **The member side is canonical and never
 * locale-formatted:** a dashboard saved by a reader typing `24.11.2009` stores exactly what
 * one typing `11/24/2009` stores, so it reads back correctly in either locale and the query
 * payload is identical. Only the text side follows the mask.
 * @internal
 */
import { asCalendarDay, formatDateInput, parseDateInput } from './date-text';
import type { DateMask } from './date-text';

/** A member's date part — the picker only ever deals in whole days. */
const MEMBER_DAY = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/;

/** Midnight, the instant every Day-level member is stored at. */
const DAY_START = 'T00:00:00';

/**
 * Reads a filter member as masked text, or returns null when it does not name a day.
 * @param mask - The active date mask
 * @param member - The stored member
 * @returns The day in the reader's format, or null
 * @internal
 */
export function asDateText(mask: DateMask, member: string): string | null {
  const match = MEMBER_DAY.exec(member.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  /* A member whose parts name no real day is not rendered as a nearby one: without the
     check, `2026-02-31` would come back as March 3rd, silently reporting a day the filter
     does not hold. */
  const date = asCalendarDay(Number(year), Number(month), Number(day));
  return date === null ? null : formatDateInput(mask, date);
}

/**
 * Writes masked text back as a Day-level filter member, or returns null when the text does
 * not name a real calendar day in this mask's format.
 * @param mask - The active date mask
 * @param text - The masked text
 * @returns The canonical member, or null
 * @internal
 */
export function asDateMember(mask: DateMask, text: string): string | null {
  /* `parseDateInput` is the whole validity test, and deliberately the same one the field
     applies on Apply. It accepts an unpadded `9/5/2026`, which the mask really can produce:
     typing a separator closes a one-digit month and moves on without padding it. An extra
     zero-padding gate here would refuse a date Apply had just accepted, and the day would
     vanish from the filter with nothing reported. */
  const date = parseDateInput(mask, text);
  if (!date) return null;

  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}${DAY_START}`;
}

/**
 * Reads a filter's members as picker text, dropping any that do not name a day.
 * @param mask - The active date mask
 * @param members - The stored members
 * @returns The days in the reader's format
 * @internal
 */
export function asDateTexts(mask: DateMask, members: readonly string[]): string[] {
  return members
    .map((member) => asDateText(mask, member))
    .filter((text): text is string => text !== null);
}

/**
 * Writes picker text back as filter members, dropping any that do not name a real day.
 * @param mask - The active date mask
 * @param texts - The masked text for each day
 * @returns The canonical members
 * @internal
 */
export function asDateMembers(mask: DateMask, texts: readonly string[]): string[] {
  return texts
    .map((text) => asDateMember(mask, text))
    .filter((member): member is string => member !== null);
}
