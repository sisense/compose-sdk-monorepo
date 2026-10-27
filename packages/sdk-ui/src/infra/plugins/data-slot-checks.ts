import camelCase from 'lodash-es/camelCase';

import { isValidCondition } from '@/domains/widgets/widget-definitions';

/**
 * Data slot names that hosts treat specially for every widget type (a system panel, and the panel
 * that switches on member colors). A plugin's data slot must not use them (exact, case-sensitive
 * match).
 *
 * @internal
 */
export const RESERVED_DATA_SLOT_NAMES: readonly string[] = ['filters', 'color'];

/**
 * A data slot as read from a plugin manifest, which may come from untyped code: every field is
 * unknown until checked.
 *
 * @internal
 */
export type UncheckedDataSlot = {
  readonly name?: unknown;
  readonly displayName?: unknown;
  readonly maxItems?: unknown;
  readonly visibleWhen?: unknown;
};

/**
 * A problem found in one data slot of a plugin.
 *
 * @internal
 */
export type DataSlotProblem = {
  /** The data slot's `name` as declared (may be missing or not a string). */
  readonly slotName: unknown;
  /** What is wrong, phrased to follow `data slot "<name>"`. */
  readonly message: string;
};

/** Checks one data slot against the whole slot list; returns a message or `undefined`. */
type DataSlotCheck = (
  slot: UncheckedDataSlot,
  slots?: readonly UncheckedDataSlot[],
) => string | undefined;

/**
 * Flags a `maxItems` that is present but not a whole number of at least 1.
 *
 * @param slot - The data slot to check.
 * @returns The problem message, or `undefined` when the slot follows the rule.
 * @internal
 */
export const checkMaxItems: DataSlotCheck = (slot) =>
  slot.maxItems === undefined ||
  (typeof slot.maxItems === 'number' && Number.isInteger(slot.maxItems) && slot.maxItems >= 1)
    ? undefined
    : `has maxItems ${JSON.stringify(
        slot.maxItems,
      )}; maxItems must be a whole number of at least 1.`;

/**
 * Flags a name that is not camelCase; saved widgets load the slot's items under the camelCase form.
 *
 * @param slot - The data slot to check.
 * @returns The problem message, or `undefined` when the slot follows the rule.
 * @internal
 */
export const checkCamelCaseName: DataSlotCheck = (slot) =>
  typeof slot.name !== 'string' || camelCase(slot.name) === slot.name
    ? undefined
    : `has a name that is not camelCase; saved widgets load its items under "${camelCase(
        slot.name,
      )}".`;

/**
 * Flags a name reserved by hosts (see `RESERVED_DATA_SLOT_NAMES`).
 *
 * @param slot - The data slot to check.
 * @returns The problem message, or `undefined` when the slot follows the rule.
 * @internal
 */
export const checkReservedName: DataSlotCheck = (slot) =>
  typeof slot.name === 'string' && RESERVED_DATA_SLOT_NAMES.includes(slot.name)
    ? 'has a name reserved by hosts; choose another name.'
    : undefined;

/**
 * Flags a display name equal to the name of another slot.
 *
 * @param slot - The data slot to check.
 * @param slots - Every data slot of the list, including `slot`.
 * @returns The problem message, or `undefined` when the slot follows the rule.
 * @internal
 */
export const checkDisplayName: DataSlotCheck = (slot, slots) =>
  typeof slot.displayName === 'string' &&
  (slots ?? []).some((other) => other !== slot && other.name === slot.displayName)
    ? `has the displayName "${slot.displayName}", which is the name of another data slot.`
    : undefined;

/**
 * Flags a `visibleWhen` the SDK cannot read; such a slot is always shown.
 *
 * @param slot - The data slot to check.
 * @returns The problem message, or `undefined` when the slot follows the rule.
 * @internal
 */
export const checkVisibleWhen: DataSlotCheck = (slot) =>
  slot.visibleWhen === undefined || isValidCondition(slot.visibleWhen)
    ? undefined
    : 'has a visibleWhen condition the SDK cannot read; the slot is always shown.';

const DATA_SLOT_CHECKS: readonly DataSlotCheck[] = [
  checkMaxItems,
  checkCamelCaseName,
  checkReservedName,
  checkDisplayName,
  checkVisibleWhen,
];

const isSlotObject = (value: unknown): value is UncheckedDataSlot =>
  typeof value === 'object' && value !== null;

/**
 * Finds the problems in a plugin's data slot list, one per broken rule per slot, in slot order.
 * Anything that is not a list of objects is ignored rather than rejected.
 *
 * @param inputs - The `dataPanel.config.inputs` of a plugin manifest, unchecked.
 * @returns The problems found; empty when the list follows every rule.
 * @internal
 */
export const findDataSlotProblems = (inputs: unknown): readonly DataSlotProblem[] => {
  if (!Array.isArray(inputs)) return [];
  const slots = inputs.filter(isSlotObject);
  return slots.flatMap((slot) =>
    DATA_SLOT_CHECKS.map((check) => check(slot, slots))
      .filter((message): message is string => message !== undefined)
      .map((message) => ({ slotName: slot.name, message })),
  );
};
