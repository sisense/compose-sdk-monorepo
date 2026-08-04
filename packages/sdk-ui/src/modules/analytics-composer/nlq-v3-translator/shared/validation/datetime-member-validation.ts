import { DateLevels } from '@sisense/sdk-data';

import { joinPathStrings } from '../utils/error-path.js';
import {
  formatExpectedMemberHint,
  isCompactYearWeekKey,
  isFourDigitYear,
  isValidIsoDateString,
} from './datetime-validation-utils.js';

const WEEK_NUMBER_ONLY = /^\d{1,2}$/;

function argPath(pathPrefix: string, segment: string): string {
  const prefix = pathPrefix.endsWith('.') ? pathPrefix.slice(0, -1) : pathPrefix;
  return joinPathStrings(prefix, segment);
}

export function validateDatetimeMemberStrings(
  members: unknown[],
  granularity: string,
  pathPrefix: string,
): void {
  // Empty members is an include-all no-op.
  if (Array.isArray(members) && members.length === 0) {
    return;
  }

  if (!Array.isArray(members)) {
    throw new Error(
      `${pathPrefix}: members filter requires at least one member for ${granularity}.`,
    );
  }

  if (granularity === DateLevels.WeekOfYear) {
    throw new Error(
      `${argPath(pathPrefix, 'args[0]')}: filterFactory.members does not support WeekOfYear. Use ${
        DateLevels.Weeks
      } with ISO week-start datetimes instead.`,
    );
  }

  members.forEach((member, index) => {
    validateSingleDatetimeMember(
      String(member),
      granularity,
      argPath(pathPrefix, `args[1][${index}]`),
    );
  });
}

function validateSingleDatetimeMember(member: string, granularity: string, path: string): void {
  if (member === 'null' || member === 'undefined' || member.trim() === '') {
    throw new Error(`${path}: member must be a non-empty string.`);
  }

  if (isCompactYearWeekKey(member)) {
    throw new Error(
      `${path}: compact week key '${member}' is not valid. Expected ${formatExpectedMemberHint(
        DateLevels.Weeks,
      )}.`,
    );
  }

  if (WEEK_NUMBER_ONLY.test(member)) {
    throw new Error(
      `${path}: bare week number '${member}' is not valid. Expected ${formatExpectedMemberHint(
        granularity,
      )}.`,
    );
  }

  if (granularity === DateLevels.Years) {
    if (isFourDigitYear(member) || isValidIsoDateString(member)) {
      return;
    }
    throw new Error(
      `${path}: invalid Years member '${member}'. Expected ${formatExpectedMemberHint(
        DateLevels.Years,
      )}.`,
    );
  }

  if (/^\d+$/.test(member)) {
    throw new Error(
      `${path}: numeric member '${member}' is not valid for ${granularity}. Expected ${formatExpectedMemberHint(
        granularity,
      )}.`,
    );
  }

  if (!isValidIsoDateString(member)) {
    throw new Error(
      `${path}: invalid datetime member '${member}' for ${granularity}. Expected ${formatExpectedMemberHint(
        granularity,
      )}.`,
    );
  }
}

export function validateNoDuplicateMembers(members: string[], pathPrefix: string): void {
  const seen = new Set<string>();
  for (const member of members) {
    if (seen.has(member)) {
      throw new Error(`${pathPrefix}: duplicate member '${member}' after normalization.`);
    }
    seen.add(member);
  }
}
