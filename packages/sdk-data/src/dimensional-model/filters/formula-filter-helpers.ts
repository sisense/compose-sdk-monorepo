import escapeRegExp from 'lodash-es/escapeRegExp.js';

import { normalizeName } from '../base.js';
import { Attribute, CalculatedMeasure, Filter, MeasureContext } from '../interfaces.js';
import {
  DimensionalCalculatedMeasure,
  isDimensionalCalculatedMeasure,
} from '../measures/measures.js';
import { MetadataTypes } from '../types.js';
import { getAttributeCompareId } from './filter-relations.js';

/**
 * A pure transformer over a calculated measure.
 *
 * Takes a read-only measure, returns a new one, and never mutates the input, so transformers
 * compose with `flow` from `lodash-es/flow`.
 *
 * @example
 * Build a calculated measure scoped by a filter, then retarget that filter by composing
 * transformers with `flow`:
 * ```ts
 * import flow from 'lodash-es/flow';
 *
 * const revenue = measureFactory.customFormula('Filtered Revenue', '([rev], [categoryFilter])', {
 *   rev: measureFactory.sum(DM.Commerce.Revenue),
 *   categoryFilter: filterFactory.members(DM.Category.Category, ['Cell Phones']),
 * });
 *
 * const retarget: CalculatedMeasureTransformer = flow(
 *   withoutFormulaFilter(DM.Category.Category),
 *   withAddedFormulaFilter(filterFactory.members(DM.Category.Category, ['Laptops'])),
 * );
 * const revenueForLaptops = retarget(revenue);
 * ```
 * @beta
 */
export type CalculatedMeasureTransformer = (
  measure: Readonly<CalculatedMeasure>,
) => CalculatedMeasure;

/**
 * Describes how to target a filter inside a formula's context.
 *
 * - {@link Filter} — matches the same filter instance (by `config.guid`), falling
 *   back to any filter on the same attribute.
 * - {@link Attribute} — matches any filter on that attribute.
 * - predicate — receives each filter and its bracketed context key and returns
 *   `true` for a match.
 *
 * @beta
 */
export type FormulaFilterMatcher = Filter | Attribute | ((filter: Filter, key: string) => boolean);

/**
 * Returns the attribute identity of a filter, or `undefined` for filters (e.g. cascading)
 * that do not target a single attribute.
 */
function filterAttributeCompareId(filter: Filter): string | undefined {
  return filter.attribute ? getAttributeCompareId(filter.attribute) : undefined;
}

/**
 * Normalizes a {@link FormulaFilterMatcher} into a predicate over a filter and its context key.
 *
 * Both the attribute and the filter-instance branches resolve identity through
 * {@link getAttributeCompareId}, so targeting by attribute and by filter agree.
 */
function toPredicate(match: FormulaFilterMatcher): (filter: Filter, key: string) => boolean {
  if (typeof match === 'function') {
    return match;
  }

  if (MetadataTypes.isAttribute(match)) {
    const targetId = getAttributeCompareId(match);
    return (filter) => filterAttributeCompareId(filter) === targetId;
  }

  if (MetadataTypes.isFilter(match)) {
    const targetGuid = match.config?.guid;
    const targetAttributeId = filterAttributeCompareId(match);
    return (filter) =>
      (!!targetGuid && filter.config?.guid === targetGuid) ||
      (targetAttributeId !== undefined && filterAttributeCompareId(filter) === targetAttributeId);
  }

  throw new Error('FormulaFilterMatcher must be a Filter, an Attribute, or a predicate function.');
}

/**
 * Returns the `[key, filter]` entries of a formula context, keeping only those whose value is a
 * filter (a context may also hold attributes, measures, or raw strings).
 */
function getFilterContextEntries(measure: Readonly<CalculatedMeasure>): Array<[string, Filter]> {
  return Object.entries(measure.context).filter(([, value]) =>
    MetadataTypes.isFilter(value),
  ) as Array<[string, Filter]>;
}

/**
 * Rebuilds a calculated measure with a new expression and context, preserving its title, format,
 * description, sort, and data source.
 */
function rebuildMeasure(
  measure: Readonly<CalculatedMeasure>,
  expression: string,
  context: MeasureContext,
): CalculatedMeasure {
  if (isDimensionalCalculatedMeasure(measure)) {
    return new DimensionalCalculatedMeasure(
      measure.name,
      expression,
      context,
      measure.getFormat(),
      measure.description,
      measure.getSort(),
      measure.dataSource,
      // Drop the original compose code: it describes the pre-transform formula and would
      // otherwise regenerate the wrong measure if read back.
      undefined,
      measure.title,
    );
  }

  // Fallback for non-standard CalculatedMeasure implementations: preserve the fields the
  // public interface guarantees.
  return new DimensionalCalculatedMeasure(
    measure.name,
    expression,
    context,
    undefined,
    measure.description,
    undefined,
    measure.dataSource,
    undefined,
    measure.title,
  );
}

/**
 * Generates a unique, bracketed context key (e.g. `[categoryFilter]`) derived from a base name,
 * avoiding collisions with existing keys.
 */
function generateContextKey(context: MeasureContext, baseName: string): string {
  const normalized = normalizeName(baseName) || 'filter';
  let candidate = normalized;
  let suffix = 1;
  while (Object.prototype.hasOwnProperty.call(context, `[${candidate}]`)) {
    candidate = `${normalized}${suffix}`;
    suffix += 1;
  }
  return `[${candidate}]`;
}

/**
 * Removes a filter reference from an expression, but only when it sits in a measured-value
 * position (comma-adjacent, e.g. `(measure, [key])`).
 *
 * Returns `null` when removal would be unsafe — the key is operator-adjacent or standalone,
 * stripping it would leave a degenerate expression, or another reference to the key remains — so
 * the caller can leave the filter in place rather than corrupt the formula. Parentheses left
 * redundantly wrapping the whole expression are stripped, so repeated add/remove cycles do not
 * accrete them and `add` then `remove` round-trips to the original expression.
 */
function removeMeasuredValueFilterReference(expression: string, bracketKey: string): string | null {
  // ReDoS-safe dynamic regex: `escapeRegExp` neutralizes every regex metacharacter in `bracketKey`
  // (an internal `[name]` formula context key, not untrusted network input), and both patterns are
  // linear — `\s*,\s*` around a literal, with no nested quantifiers — so there is no catastrophic
  // backtracking.
  const escaped = escapeRegExp(bracketKey);
  const trailingArg = `\\s*,\\s*${escaped}`; // ", [key]"
  const leadingArg = `${escaped}\\s*,\\s*`; // "[key], "

  const isMeasuredValueArg =
    new RegExp(trailingArg).test(expression) || new RegExp(leadingArg).test(expression);
  if (!isMeasuredValueArg) {
    return null;
  }

  const stripped = expression
    .replace(new RegExp(trailingArg, 'g'), '')
    .replace(new RegExp(leadingArg, 'g'), '')
    .trim();
  // Bail out if removal would be unsafe: a degenerate result, or the key still appears elsewhere
  // (e.g. an operator position) — deleting the context entry would leave a dangling reference.
  if (stripped === '' || stripped === '()' || stripped.includes(bracketKey)) {
    return null;
  }
  return unwrapRedundantParens(stripped);
}

/**
 * Strips parentheses that redundantly wrap the entire expression — left behind when a filter is
 * removed from a measured-value wrap (`(measure, [filter])` → `(measure)`) — so repeated
 * add/remove cycles do not accrete parentheses.
 *
 * Only a genuinely redundant pair is removed: one that spans the whole expression and whose inner
 * content has no top-level comma, so a measured-value group like `(measure, [filter])` (whose
 * parentheses are load-bearing) is never unwrapped.
 */
function unwrapRedundantParens(expression: string): string {
  let result = expression.trim();
  while (isWrappedInRedundantParens(result)) {
    result = result.slice(1, -1).trim();
  }
  return result;
}

/**
 * Returns `true` when the whole expression is wrapped in a single redundant parenthesis pair — the
 * opening paren matches the closing paren at the final character, and the wrapped content is not a
 * measured-value argument list (no top-level comma). String literals are skipped so quoted
 * parentheses or commas don't mislead the scan.
 */
function isWrappedInRedundantParens(expression: string): boolean {
  if (!expression.startsWith('(') || !expression.endsWith(')')) {
    return false;
  }
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < expression.length; i += 1) {
    const char = expression[i];
    if (quote) {
      if (char === quote) {
        quote = null;
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      // Outer pair closed before the final character → it doesn't wrap the whole expression.
      if (depth === 0 && i < expression.length - 1) {
        return false;
      }
    } else if (char === ',' && depth === 1) {
      // Comma directly inside the outer pair → measured-value list; the parens are load-bearing.
      return false;
    }
  }
  return depth === 0;
}

/**
 * Returns all filters referenced in a calculated measure formula's context.
 *
 * @param measure - The calculated measure to read filters from.
 * @returns The filters present in the formula context.
 * @group Filter Utilities
 * @example
 * ```ts
 * const revenue = measureFactory.customFormula('Filtered Revenue', '([rev], [categoryFilter])', {
 *   rev: measureFactory.sum(DM.Commerce.Revenue),
 *   categoryFilter: filterFactory.members(DM.Category.Category, ['Cell Phones']),
 * });
 *
 * getFormulaFilters(revenue); // [ members filter on [Category.Category] ]
 * ```
 * @beta
 */
export function getFormulaFilters(measure: Readonly<CalculatedMeasure>): Filter[] {
  return getFilterContextEntries(measure).map(([, filter]) => filter);
}

/**
 * Returns the `[contextKey, filter]` entries of a calculated measure formula's context.
 *
 * The context key is the bracketed token (e.g. `[categoryFilter]`) used to reference the filter
 * from the formula expression.
 *
 * @param measure - The calculated measure to read filters from.
 * @returns The bracketed-key/filter pairs present in the formula context.
 * @group Filter Utilities
 * @example
 * ```ts
 * getFormulaFilterEntries(revenue).forEach(([key, filter]) => {
 *   // '[categoryFilter]'  '[Category.Category]'
 *   console.log(key, filter.attribute.expression);
 * });
 * ```
 * @beta
 */
export function getFormulaFilterEntries(
  measure: Readonly<CalculatedMeasure>,
): ReadonlyArray<readonly [string, Filter]> {
  return getFilterContextEntries(measure);
}

/**
 * Finds the first filter in a calculated measure formula matching the given target.
 *
 * @param measure - The calculated measure to search.
 * @param match - How to target the filter. See {@link FormulaFilterMatcher}.
 * @returns The matching filter, or `undefined` when none matches.
 * @group Filter Utilities
 * @example
 * Target a filter by attribute, by predicate, or by the filter instance:
 * ```ts
 * findFormulaFilter(revenue, DM.Category.Category);
 * findFormulaFilter(revenue, (filter) => filter.attribute.expression === '[Category.Category]');
 * ```
 * @beta
 */
export function findFormulaFilter(
  measure: Readonly<CalculatedMeasure>,
  match: FormulaFilterMatcher,
): Filter | undefined {
  const predicate = toPredicate(match);
  return getFilterContextEntries(measure).find(([key, filter]) => predicate(filter, key))?.[1];
}

/**
 * Checks whether a calculated measure formula contains a filter matching the given target.
 *
 * @param measure - The calculated measure to check.
 * @param match - How to target the filter. See {@link FormulaFilterMatcher}.
 * @returns `true` when a matching filter is present.
 * @group Filter Utilities
 * @example
 * ```ts
 * hasFormulaFilter(revenue, DM.Category.Category); // true
 * hasFormulaFilter(revenue, DM.Commerce.Country); // false
 * ```
 * @beta
 */
export function hasFormulaFilter(
  measure: Readonly<CalculatedMeasure>,
  match: FormulaFilterMatcher,
): boolean {
  return findFormulaFilter(measure, match) !== undefined;
}

/**
 * Returns a transformer that adds a filter to a calculated measure formula, scoping the whole formula by it.
 *
 * Always appends the filter as a measured-value argument and references it from the expression —
 * it does not replace an existing filter on the same attribute. Use {@link withFormulaFilterFor}
 * for upsert semantics.
 *
 * @param filter - The filter to add.
 * @returns A transformer producing the updated calculated measure.
 * @group Filter Utilities
 * @example
 * Scope the whole formula by an additional filter (appended as a measured-value argument):
 * ```ts
 * const highValue = withAddedFormulaFilter(
 *   filterFactory.greaterThan(DM.Commerce.Revenue, 1000),
 * )(revenue);
 * ```
 * @beta
 */
export function withAddedFormulaFilter(filter: Filter): CalculatedMeasureTransformer {
  return (measure) => {
    const key = generateContextKey(measure.context, filter.name);
    const expression = `(${measure.expression}, ${key})`;
    return rebuildMeasure(measure, expression, { ...measure.context, [key]: filter });
  };
}

/**
 * Returns a transformer that adds multiple filters to a calculated measure formula, scoping the whole formula
 * by each of them.
 *
 * @param filters - The filters to add.
 * @returns A transformer producing the updated calculated measure.
 * @group Filter Utilities
 * @example
 * ```ts
 * const scoped = withAddedFormulaFilters([
 *   filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
 *   filterFactory.members(DM.Commerce.Gender, ['Female']),
 * ])(revenue);
 * ```
 * @beta
 */
export function withAddedFormulaFilters(filters: Filter[]): CalculatedMeasureTransformer {
  return (measure) =>
    filters.reduce<CalculatedMeasure>(
      (current, filter) => withAddedFormulaFilter(filter)(current),
      measure,
    );
}

/**
 * Returns a transformer that sets the calculated measure formula's filter for an attribute: upserts the
 * filter when one is provided (replacing any existing filter on the same attribute, otherwise
 * adding it), or removes it when `filter` is `null`.
 *
 * This is the convenient primitive for driving a formula filter from a filter tile.
 *
 * @param attribute - The attribute the filter targets.
 * @param filter - The filter to set, or `null` to remove the attribute's filter.
 * @returns A transformer producing the updated calculated measure.
 * @group Filter Utilities
 * @example
 * Drive a formula filter from a filter tile — upsert on select, remove on clear:
 * ```ts
 * // given a <MemberFilterTile> for DM.Category.Category and a `revenue` measure in state:
 * const onChange = (filter: Filter | null) =>
 *   setRevenue(withFormulaFilterFor(DM.Category.Category, filter)(revenue));
 * ```
 * @beta
 */
export function withFormulaFilterFor(
  attribute: Attribute,
  filter: Filter | null,
): CalculatedMeasureTransformer {
  return (measure) => {
    if (filter === null) {
      return withoutFormulaFilter(attribute)(measure);
    }

    const targetId = getAttributeCompareId(attribute);
    const existing = getFilterContextEntries(measure).find(
      ([, contextFilter]) => filterAttributeCompareId(contextFilter) === targetId,
    );
    if (existing) {
      const [key] = existing;
      return rebuildMeasure(measure, measure.expression, { ...measure.context, [key]: filter });
    }

    return withAddedFormulaFilter(filter)(measure);
  };
}

/**
 * Returns a transformer that replaces the filter(s) matching the target with a new filter, keeping
 * the same context key so the formula expression is left untouched.
 *
 * Returns the measure unchanged when nothing matches; use {@link withFormulaFilterFor} when you
 * want a missing filter to be added instead.
 *
 * @param match - How to target the filter to replace. See {@link FormulaFilterMatcher}.
 * @param newFilter - The replacement filter.
 * @returns A transformer producing the updated calculated measure.
 * @group Filter Utilities
 * @example
 * Swap the filter for an attribute, keeping the formula expression unchanged:
 * ```ts
 * const forLaptops = withReplacedFormulaFilter(
 *   DM.Category.Category,
 *   filterFactory.members(DM.Category.Category, ['Laptops']),
 * )(revenue);
 * ```
 * @beta
 */
export function withReplacedFormulaFilter(
  match: FormulaFilterMatcher,
  newFilter: Filter,
): CalculatedMeasureTransformer {
  const predicate = toPredicate(match);
  return (measure) => {
    const context = { ...measure.context };
    let changed = false;
    for (const [key, filter] of getFilterContextEntries(measure)) {
      if (predicate(filter, key)) {
        context[key] = newFilter;
        changed = true;
      }
    }
    return changed ? rebuildMeasure(measure, measure.expression, context) : measure;
  };
}

/**
 * Returns a transformer that functionally updates the filter(s) matching the target, keeping the
 * same context key so the formula expression is left untouched.
 *
 * Useful for tweaks such as narrowing a filter's members. Returns the measure unchanged when
 * nothing matches.
 *
 * @param match - How to target the filter to update. See {@link FormulaFilterMatcher}.
 * @param updateFn - Maps the matched filter to its replacement.
 * @returns A transformer producing the updated calculated measure.
 * @group Filter Utilities
 * @example
 * Narrow the existing filter's members to a fixed set:
 * ```ts
 * const narrowed = withUpdatedFormulaFilter(DM.Category.Category, () =>
 *   filterFactory.members(DM.Category.Category, ['Cell Phones', 'Laptops']),
 * )(revenue);
 * ```
 * @beta
 */
export function withUpdatedFormulaFilter(
  match: FormulaFilterMatcher,
  updateFn: (filter: Filter) => Filter,
): CalculatedMeasureTransformer {
  const predicate = toPredicate(match);
  return (measure) => {
    const context = { ...measure.context };
    let changed = false;
    for (const [key, filter] of getFilterContextEntries(measure)) {
      if (predicate(filter, key)) {
        context[key] = updateFn(filter);
        changed = true;
      }
    }
    return changed ? rebuildMeasure(measure, measure.expression, context) : measure;
  };
}

/**
 * Returns a transformer that maps over every filter in a calculated measure formula's context, keeping each
 * filter's context key.
 *
 * Returns the measure unchanged when the mapping produces no new filter reference.
 *
 * @param mapFn - Maps each filter (and its bracketed context key) to its replacement.
 * @returns A transformer producing the updated calculated measure.
 * @group Filter Utilities
 * @example
 * Apply the same transform to every filter in the formula:
 * ```ts
 * const reselected = mapFormulaFilters((filter) =>
 *   filterFactory.members(filter.attribute, ['Cell Phones']),
 * )(revenue);
 * ```
 * @beta
 */
export function mapFormulaFilters(
  mapFn: (filter: Filter, key: string) => Filter,
): CalculatedMeasureTransformer {
  return (measure) => {
    const context = { ...measure.context };
    let changed = false;
    for (const [key, filter] of getFilterContextEntries(measure)) {
      const mapped = mapFn(filter, key);
      if (mapped !== filter) {
        context[key] = mapped;
        changed = true;
      }
    }
    return changed ? rebuildMeasure(measure, measure.expression, context) : measure;
  };
}

/**
 * Returns a transformer that removes the filter(s) matching the target from a calculated measure formula,
 * dropping them from both the context and the expression.
 *
 * Removal only happens for filters in a measured-value position (the `(measure, [filter])`
 * pattern); a filter in an operator position (or whose removal would leave a degenerate
 * expression) is left in place rather than corrupting the formula. Returns the measure unchanged
 * when nothing is removed.
 *
 * @param match - How to target the filter to remove. See {@link FormulaFilterMatcher}.
 * @returns A transformer producing the updated calculated measure.
 * @group Filter Utilities
 * @example
 * ```ts
 * const unscoped = withoutFormulaFilter(DM.Category.Category)(revenue);
 * ```
 * @beta
 */
export function withoutFormulaFilter(match: FormulaFilterMatcher): CalculatedMeasureTransformer {
  const predicate = toPredicate(match);
  return (measure) => {
    const matched = getFilterContextEntries(measure).filter(([key, filter]) =>
      predicate(filter, key),
    );
    if (matched.length === 0) {
      return measure;
    }

    let expression = measure.expression;
    const context = { ...measure.context };
    let changed = false;
    for (const [key] of matched) {
      const nextExpression = removeMeasuredValueFilterReference(expression, key);
      if (nextExpression === null) {
        // Unsafe to strip from this position — leave the filter in place to avoid corrupting the formula.
        continue;
      }
      expression = nextExpression;
      delete context[key];
      changed = true;
    }
    return changed ? rebuildMeasure(measure, expression, context) : measure;
  };
}
