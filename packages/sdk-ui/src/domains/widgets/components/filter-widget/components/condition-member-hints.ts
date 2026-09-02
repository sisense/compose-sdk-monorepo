/**
 * Inline member suggestions under a text Condition value — the prototype's `hint`
 * list. Typing stays free: these are column values that exist, not a list the
 * reader is held to.
 * @internal
 */

/**
 * Limits the suggestions under one entry. Matches the prototype.
 * `@internal`
 */

export const CONDITION_TEXT_HINT_LIMIT = 5;

/** Column member a hint row can offer. @internal */
export type ConditionMemberHint = {
  key: string;
  title: string;
};

/**
 * Members offered while `needle` is being typed.
 *
 * Empty when there is nothing to match, or when the entry *is* a column value —
 * suggestions have nothing left to offer, so the whole list goes, not just the
 * row that matched.
 * @param members - Column members (already scoped by search, if the query did)
 * @param needle - What is currently in the field
 * @param limit - Max rows to return
 * @returns Matching members, or an empty list
 * @internal
 */
export function memberHintsForNeedle(
  members: readonly ConditionMemberHint[],
  needle: string,
  limit = CONDITION_TEXT_HINT_LIMIT,
): ConditionMemberHint[] {
  const n = needle.trim().toLowerCase();
  if (!n) return [];
  if (members.some((member) => member.title.toLowerCase() === n)) return [];
  return members.filter((member) => member.title.toLowerCase().includes(n)).slice(0, limit);
}
