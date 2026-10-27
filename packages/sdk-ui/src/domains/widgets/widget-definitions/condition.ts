import get from 'lodash-es/get';
import isEqual from 'lodash-es/isEqual';

/**
 * Serializable predicate over the widget being edited, for example to show a data slot only when
 * another option is set.
 *
 * A condition is plain data, so it can live in a plugin manifest and be evaluated by any editor
 * host. The variants are:
 *
 * - `{ path, equals }` — the value at `path` equals `equals` (deep equality).
 * - `{ path, in }` — the value at `path` equals one of the values in `in` (deep equality).
 * - `{ slot, minItems }` — the data slot named `slot` has at least `minItems` items (a finite number).
 * - `{ all }` — every nested condition is true (true for an empty list).
 * - `{ any }` — at least one nested condition is true (false for an empty list).
 * - `{ not }` — the nested condition is false.
 *
 * `path` is a dot path into `{ chartType, dataOptions, styleOptions }` of the widget being edited,
 * for example `'styleOptions.legend.enabled'`. A path that does not exist reads as `undefined`.
 *
 * @group Plugin System
 * @example
 * ```ts
 * import type { DataPanelInput } from '@sisense/sdk-ui';
 * import type { Condition } from '@sisense/sdk-ui/sisense-internal';
 *
 * // A plugin's "goal" slot: shown only when the plugin's own `showGoal` style option is on
 * // and its "value" slot has an item
 * const visibleWhen: Condition = {
 *   all: [
 *     { path: 'styleOptions.showGoal', equals: true },
 *     { slot: 'value', minItems: 1 },
 *   ],
 * };
 *
 * const goal: DataPanelInput = { name: 'goal', type: 'measure', visibleWhen };
 * ```
 * @sisenseInternal
 */
export type Condition =
  | { readonly path: string; readonly equals: unknown }
  | { readonly path: string; readonly in: readonly unknown[] }
  | { readonly slot: string; readonly minItems: number }
  | { readonly all: readonly Condition[] }
  | { readonly any: readonly Condition[] }
  | { readonly not: Condition };

/**
 * The state of the widget being edited that a {@link Condition} is evaluated against.
 *
 * @sisenseInternal
 */
export interface ConditionContext {
  /** Type of the widget being edited, read by paths starting with `chartType`. */
  readonly chartType?: string;
  /** Data options of the widget, read by paths starting with `dataOptions`. */
  readonly dataOptions?: unknown;
  /** Style options of the widget, read by paths starting with `styleOptions`. */
  readonly styleOptions?: unknown;
  /**
   * Number of items in each data slot, keyed by slot name, read by `{ slot, minItems }`.
   * A slot that is not listed has no items.
   */
  readonly slotItemCounts?: Readonly<Record<string, number>>;
}

/** A validated condition variant. Nested conditions stay `unknown` until they are evaluated. */
type TaggedCondition =
  | { readonly kind: 'equals'; readonly path: string; readonly equals: unknown }
  | { readonly kind: 'in'; readonly path: string; readonly in: readonly unknown[] }
  | { readonly kind: 'slot'; readonly slot: string; readonly minItems: number }
  | { readonly kind: 'all'; readonly all: readonly unknown[] }
  | { readonly kind: 'any'; readonly any: readonly unknown[] }
  | { readonly kind: 'not'; readonly not: unknown }
  | { readonly kind: 'unknown' };

/**
 * Checks whether a value is a non-null object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a non-null object.
 */
const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

/**
 * Checks that an object has exactly the given keys, so a node never mixes variants or carries
 * keys from a newer SDK version that would change its meaning.
 *
 * @param value - The object to check.
 * @param keys - The keys the variant allows.
 * @returns Whether the object's own keys are exactly `keys`.
 */
const hasExactKeys = (value: object, keys: readonly string[]): boolean => {
  const own = Object.keys(value);
  return own.length === keys.length && keys.every((key) => own.includes(key));
};

/** The keys each condition variant consists of. */
const VARIANT_KEYS = {
  equals: ['path', 'equals'],
  in: ['path', 'in'],
  slot: ['slot', 'minItems'],
  all: ['all'],
  any: ['any'],
  not: ['not'],
} as const;

/**
 * Tags a condition with its variant, validating the shape of untrusted input (plugin manifests).
 * A node with keys outside its variant, or with keys of several variants, is unrecognized.
 *
 * @param condition - The condition to tag, of unverified shape.
 * @returns The tagged variant, or `unknown` for an unrecognized shape.
 */
const tagCondition = (condition: unknown): TaggedCondition => {
  if (!isObject(condition)) return { kind: 'unknown' };
  if (!Object.values(VARIANT_KEYS).some((keys) => hasExactKeys(condition, keys))) {
    return { kind: 'unknown' };
  }
  if ('path' in condition && typeof condition.path === 'string') {
    if ('equals' in condition) {
      return { kind: 'equals', path: condition.path, equals: condition.equals };
    }
    if ('in' in condition && Array.isArray(condition.in)) {
      return { kind: 'in', path: condition.path, in: condition.in };
    }
    return { kind: 'unknown' };
  }
  if (
    'slot' in condition &&
    typeof condition.slot === 'string' &&
    'minItems' in condition &&
    typeof condition.minItems === 'number' &&
    Number.isFinite(condition.minItems)
  ) {
    return { kind: 'slot', slot: condition.slot, minItems: condition.minItems };
  }
  if ('all' in condition && Array.isArray(condition.all)) {
    return { kind: 'all', all: condition.all };
  }
  if ('any' in condition && Array.isArray(condition.any)) {
    return { kind: 'any', any: condition.any };
  }
  if ('not' in condition && isObject(condition.not)) {
    return { kind: 'not', not: condition.not };
  }
  return { kind: 'unknown' };
};

/**
 * Reads a dot path from the widget state.
 *
 * @param context - The widget state.
 * @param path - Dot path into `{ chartType, dataOptions, styleOptions }`.
 * @returns The value at the path, or `undefined` when the path is missing.
 */
const readPath = (context: ConditionContext, path: string): unknown =>
  get(
    {
      chartType: context.chartType,
      dataOptions: context.dataOptions,
      styleOptions: context.styleOptions,
    },
    path,
  );

/**
 * Checks whether a value is a well-formed {@link Condition}, nested conditions included.
 *
 * Manifests can come from untyped code or from a newer SDK version, so hosts check a condition
 * before relying on it.
 *
 * @param value - The value to check.
 * @returns Whether every node of the value is a recognized condition variant.
 * @sisenseInternal
 */
export const isValidCondition = (value: unknown): value is Condition => {
  const tagged = tagCondition(value);
  switch (tagged.kind) {
    case 'equals':
    case 'in':
    case 'slot':
      return true;
    case 'all':
      return tagged.all.every(isValidCondition);
    case 'any':
      return tagged.any.every(isValidCondition);
    case 'not':
      return isValidCondition(tagged.not);
    case 'unknown':
      return false;
    default: {
      const exhaustive: never = tagged;
      return exhaustive;
    }
  }
};

/**
 * Evaluates a condition already checked by {@link isValidCondition}.
 *
 * @param condition - The condition to evaluate.
 * @param context - The widget state.
 * @returns Whether the condition holds.
 */
const evaluateValid = (condition: Condition, context: ConditionContext): boolean => {
  if ('equals' in condition) return isEqual(readPath(context, condition.path), condition.equals);
  if ('in' in condition) {
    const value = readPath(context, condition.path);
    return condition.in.some((candidate) => isEqual(value, candidate));
  }
  if ('slot' in condition)
    return (context.slotItemCounts?.[condition.slot] ?? 0) >= condition.minItems;
  if ('all' in condition) return condition.all.every((nested) => evaluateValid(nested, context));
  if ('any' in condition) return condition.any.some((nested) => evaluateValid(nested, context));
  return !evaluateValid(condition.not, context);
};

/**
 * Evaluates a {@link Condition} against the widget being edited.
 *
 * Pure: the result depends only on the arguments. `equals` and `in` compare with deep equality.
 * A missing path reads as `undefined`; a slot missing from `slotItemCounts` has no items.
 *
 * @param condition - The condition to evaluate.
 * @param context - The state of the widget being edited.
 * @returns Whether the condition holds, or `undefined` when any part of it is not a recognized
 *   condition (malformed, or written for a newer SDK version). Callers decide what that means;
 *   for slot visibility see {@link isDataPanelInputVisible}.
 * @sisenseInternal
 */
export const evaluateCondition = (
  condition: Condition,
  context: ConditionContext,
): boolean | undefined =>
  isValidCondition(condition) ? evaluateValid(condition, context) : undefined;

/**
 * Anything with an optional visibility condition, such as a data panel input.
 *
 * @sisenseInternal
 */
export interface WithVisibleWhen {
  /** When the owner is shown. Omit to always show it. */
  readonly visibleWhen?: Condition;
}

/**
 * Whether a data panel input is shown for the widget being edited.
 *
 * An input without `visibleWhen` is always shown. An input whose `visibleWhen` is not a recognized
 * condition is also shown: a host never hides a slot, which may hold saved data, because of a rule
 * it cannot read. Plugin registration warns about such conditions.
 *
 * @param input - The input, or anything with an optional `visibleWhen`.
 * @param context - The state of the widget being edited.
 * @returns Whether the input is shown.
 * @sisenseInternal
 */
export const isDataPanelInputVisible = (
  input: WithVisibleWhen,
  context: ConditionContext,
): boolean =>
  input.visibleWhen === undefined ? true : evaluateCondition(input.visibleWhen, context) ?? true;
