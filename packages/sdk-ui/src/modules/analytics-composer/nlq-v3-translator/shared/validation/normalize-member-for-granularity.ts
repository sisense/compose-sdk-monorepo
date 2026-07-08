import { DateLevels } from '@sisense/sdk-data';
import { format } from 'date-fns';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import startOfQuarter from 'date-fns/startOfQuarter';
import startOfWeek from 'date-fns/startOfWeek';
import startOfYear from 'date-fns/startOfYear';

import {
  DEFAULT_WEEK_STARTS_ON,
  formatExpectedMemberHint,
  isFourDigitYear,
  isValidIsoDateString,
} from './datetime-validation-utils.js';

const JAQL_MEMBER_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Parses the calendar date from a member string in local time to avoid UTC timezone shifts.
 */
function parseMemberAsLocalDate(member: string): Date {
  const match = ISO_DATE_ONLY.exec(member);
  if (!match) {
    throw new Error(`Invalid datetime member '${member}'.`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

/**
 * Normalizes a datetime filter member to the start of its calendar period,
 * matching Sisense backend member encoding.
 */
export function normalizeMemberForGranularity(member: string, granularity: string): string {
  if (granularity === DateLevels.Years && isFourDigitYear(member)) {
    return `${member}-01-01T00:00:00`;
  }

  if (!isValidIsoDateString(member)) {
    throw new Error(
      `Invalid datetime member '${member}' for ${granularity}. Expected ${formatExpectedMemberHint(
        granularity,
      )}.`,
    );
  }

  const localDate = parseMemberAsLocalDate(member);

  let periodStart: Date;
  switch (granularity) {
    case DateLevels.Years:
      periodStart = startOfYear(localDate);
      break;
    case DateLevels.Quarters:
      periodStart = startOfQuarter(localDate);
      break;
    case DateLevels.Months:
      periodStart = startOfMonth(localDate);
      break;
    case DateLevels.Weeks:
      periodStart = startOfWeek(localDate, { weekStartsOn: DEFAULT_WEEK_STARTS_ON });
      break;
    case DateLevels.Days:
      periodStart = startOfDay(localDate);
      break;
    default:
      return member;
  }

  return format(periodStart, JAQL_MEMBER_FORMAT);
}
