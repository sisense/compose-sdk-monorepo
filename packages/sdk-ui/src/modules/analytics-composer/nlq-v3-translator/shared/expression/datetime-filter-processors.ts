import { Attribute, LevelAttribute } from '@sisense/sdk-data';

import { FunctionContext, ProcessedArg } from '../../types.js';
import { isDateLevelAttribute } from '../utils/attribute-helpers.js';
import { validateDatetimeMemberStrings } from '../validation/datetime-member-validation.js';
import {
  normalizeDatetimeRangeBound,
  validateDatetimeRange,
} from '../validation/datetime-range-validation.js';
import { validateDatetimeRelativeFilter } from '../validation/datetime-relative-validation.js';

function extractLevelAttribute(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): LevelAttribute {
  const attribute = processedArgs[0];
  if (!attribute || typeof attribute !== 'object' || !('granularity' in attribute)) {
    throw new Error(
      `${context.pathPrefix}args[0]: Expected date level attribute as first argument.`,
    );
  }
  return attribute as LevelAttribute;
}

export function processDatetimeMembersFilter(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): ProcessedArg[] {
  const attribute = processedArgs[0];
  if (
    !attribute ||
    typeof attribute !== 'object' ||
    !isDateLevelAttribute(attribute as Attribute)
  ) {
    return processedArgs;
  }

  const levelAttribute = attribute as LevelAttribute;
  const members = processedArgs[1];
  if (!Array.isArray(members)) {
    throw new Error(`${context.pathPrefix}args[1]: Expected string array of members.`);
  }
  // Empty members is an include-all no-op (Fusion "include all" date filter).
  if (members.length === 0) {
    return processedArgs;
  }
  validateDatetimeMemberStrings(members, levelAttribute.granularity, context.pathPrefix);
  return processedArgs;
}

export function processDatetimeRangeFilter(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): ProcessedArg[] {
  const attribute = extractLevelAttribute(processedArgs, context);
  const from = processedArgs[1] as Date | string | undefined;
  const to = processedArgs[2] as Date | string | undefined;

  validateDatetimeRange(attribute.granularity, from, to, context.pathPrefix);

  const next = [...processedArgs] as ProcessedArg[];
  if (from !== undefined) {
    next[1] = normalizeDatetimeRangeBound(from, attribute.granularity);
  }
  if (to !== undefined) {
    next[2] = normalizeDatetimeRangeBound(to, attribute.granularity);
  }
  return next;
}

export function processDatetimeFromFilter(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): ProcessedArg[] {
  const attribute = extractLevelAttribute(processedArgs, context);
  const from = processedArgs[1] as Date | string;

  validateDatetimeRange(attribute.granularity, from, undefined, context.pathPrefix);

  const next = [...processedArgs] as ProcessedArg[];
  next[1] = normalizeDatetimeRangeBound(from, attribute.granularity);
  return next;
}

export function processDatetimeToFilter(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): ProcessedArg[] {
  const attribute = extractLevelAttribute(processedArgs, context);
  const to = processedArgs[1] as Date | string;

  validateDatetimeRange(attribute.granularity, undefined, to, context.pathPrefix);

  const next = [...processedArgs] as ProcessedArg[];
  next[1] = normalizeDatetimeRangeBound(to, attribute.granularity);
  return next;
}

export function processDatetimeRelativeFilter(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): ProcessedArg[] {
  const attribute = extractLevelAttribute(processedArgs, context);
  const offset = processedArgs[1] as number;
  const count = processedArgs[2] as number;
  const anchor = processedArgs[3] as Date | string | undefined;

  validateDatetimeRelativeFilter(attribute.granularity, offset, count, anchor, context.pathPrefix);

  return processedArgs;
}
