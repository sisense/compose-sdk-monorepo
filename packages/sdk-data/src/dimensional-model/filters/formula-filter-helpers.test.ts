import flow from 'lodash-es/flow.js';

import { DimensionalAttribute } from '../attributes/attributes.js';
import { CalculatedMeasure, Filter } from '../interfaces.js';
import * as measureFactory from '../measures/factory.js';
import { DimensionalCalculatedMeasure } from '../measures/measures.js';
import { Sort } from '../types.js';
import * as filterFactory from './factory.js';
import {
  findFormulaFilter,
  FormulaFilterMatcher,
  getFormulaFilterEntries,
  getFormulaFilters,
  hasFormulaFilter,
  mapFormulaFilters,
  withAddedFormulaFilter,
  withAddedFormulaFilters,
  withFormulaFilterFor,
  withoutFormulaFilter,
  withReplacedFormulaFilter,
  withUpdatedFormulaFilter,
} from './formula-filter-helpers.js';

const cost = new DimensionalAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute');
const category = new DimensionalAttribute('Category', '[Category.Category]');
const country = new DimensionalAttribute('Country', '[Commerce.Country]');

const getFormat = (measure: CalculatedMeasure) =>
  (measure as DimensionalCalculatedMeasure).getFormat();
const getComposeCode = (measure: CalculatedMeasure) =>
  (measure as DimensionalCalculatedMeasure).composeCode;
const getSort = (measure: CalculatedMeasure) => (measure as DimensionalCalculatedMeasure).getSort();

/** A formula scoped by a single category filter: `(SUM([cost]), [categoryFilter])`. */
const buildScopedMeasure = (): CalculatedMeasure =>
  measureFactory.customFormula(
    'Revenue with Filter',
    '(SUM([cost]), [categoryFilter])',
    {
      cost,
      categoryFilter: filterFactory.members(category, ['Apple Mac Desktops']),
    },
    '0.00%',
  );

/** A formula with no filters in its context: `SUM([cost])`. */
const buildFilterlessMeasure = (): CalculatedMeasure =>
  measureFactory.customFormula('Total Cost', 'SUM([cost])', { cost });

describe('formula filter helpers', () => {
  describe('getFormulaFilters / getFormulaFilterEntries', () => {
    it('returns only the filters from the context, excluding attributes', () => {
      const filters = getFormulaFilters(buildScopedMeasure());
      expect(filters).toHaveLength(1);
      expect(filters[0].attribute.expression).toBe('[Category.Category]');
    });

    it('returns the bracketed context key with each filter', () => {
      const entries = getFormulaFilterEntries(buildScopedMeasure());
      expect(entries).toHaveLength(1);
      expect(entries[0][0]).toBe('[categoryFilter]');
    });

    it('returns an empty array for a filterless formula', () => {
      expect(getFormulaFilters(buildFilterlessMeasure())).toEqual([]);
    });
  });

  describe('findFormulaFilter / hasFormulaFilter', () => {
    it('matches by attribute', () => {
      const measure = buildScopedMeasure();
      expect(findFormulaFilter(measure, category)?.attribute.expression).toBe(
        '[Category.Category]',
      );
      expect(hasFormulaFilter(measure, category)).toBe(true);
    });

    it('does not match a different attribute', () => {
      const measure = buildScopedMeasure();
      expect(findFormulaFilter(measure, country)).toBeUndefined();
      expect(hasFormulaFilter(measure, country)).toBe(false);
    });

    it('matches by the same filter instance (guid)', () => {
      const measure = buildScopedMeasure();
      const existing = getFormulaFilters(measure)[0];
      expect(findFormulaFilter(measure, existing)).toBe(existing);
    });

    it('matches a different filter on the same attribute (compare-id fallback)', () => {
      const measure = buildScopedMeasure();
      expect(hasFormulaFilter(measure, filterFactory.members(category, ['Anything']))).toBe(true);
    });

    it('resolves the same filter whether targeted by attribute or by instance', () => {
      const measure = buildScopedMeasure();
      const instance = getFormulaFilters(measure)[0];
      expect(findFormulaFilter(measure, category)).toBe(findFormulaFilter(measure, instance));
    });

    it('matches by predicate, receiving the context key', () => {
      const measure = buildScopedMeasure();
      expect(hasFormulaFilter(measure, (_filter, key) => key === '[categoryFilter]')).toBe(true);
    });

    it('throws when the matcher is neither a filter, an attribute, nor a function', () => {
      const measure = buildScopedMeasure();
      const badMatcher = measureFactory.sum(cost) as unknown as FormulaFilterMatcher;
      expect(() => findFormulaFilter(measure, badMatcher)).toThrow();
    });
  });

  describe('withAddedFormulaFilter', () => {
    it('appends a filter as a measured-value argument on a filterless formula', () => {
      const measure = buildFilterlessMeasure();
      const countryFilter = filterFactory.members(country, ['France']);

      const result = withAddedFormulaFilter(countryFilter)(measure);

      const entries = getFormulaFilterEntries(result);
      expect(entries).toHaveLength(1);
      const [key, filter] = entries[0];
      expect(filter).toBe(countryFilter);
      expect(result.expression).toBe(`(SUM([cost]), ${key})`);
    });

    it('always adds — it does not upsert a filter on the same attribute', () => {
      const measure = buildScopedMeasure();
      const result = withAddedFormulaFilter(filterFactory.members(category, ['Laptops']))(measure);
      expect(getFormulaFilters(result)).toHaveLength(2);
    });

    it('generates a unique key when the derived key collides', () => {
      const measure = measureFactory.customFormula('m', 'SUM([cost])', {
        cost,
        Country: filterFactory.greaterThan(country, 0),
      });
      const countryMembers = filterFactory.members(
        new DimensionalAttribute('Country', '[Other.Country]'),
        ['France'],
      );

      const result = withAddedFormulaFilter(countryMembers)(measure);
      const newEntry = getFormulaFilterEntries(result).find(([, f]) => f === countryMembers);

      expect(newEntry?.[0]).not.toBe('[Country]');
      expect(result.expression).toContain(newEntry![0]);
    });
  });

  describe('withAddedFormulaFilters', () => {
    it('adds each filter, scoping the whole formula', () => {
      const result = withAddedFormulaFilters([
        filterFactory.members(country, ['France']),
        filterFactory.greaterThan(cost, 100),
      ])(buildFilterlessMeasure());

      expect(getFormulaFilters(result)).toHaveLength(2);
    });

    it('returns the same instance for an empty list', () => {
      const measure = buildFilterlessMeasure();
      expect(withAddedFormulaFilters([])(measure)).toBe(measure);
    });
  });

  describe('withFormulaFilterFor', () => {
    it('upserts in place when a filter on the attribute already exists', () => {
      const measure = buildScopedMeasure();
      const replacement = filterFactory.members(category, ['Laptops']);

      const result = withFormulaFilterFor(category, replacement)(measure);

      expect(getFormulaFilterEntries(result)).toHaveLength(1);
      expect(result.expression).toBe('(SUM([cost]), [categoryFilter])');
      expect(getFormulaFilters(result)[0]).toBe(replacement);
    });

    it('adds when no filter on the attribute exists', () => {
      const measure = buildFilterlessMeasure();
      const result = withFormulaFilterFor(
        country,
        filterFactory.members(country, ['France']),
      )(measure);
      expect(getFormulaFilters(result)).toHaveLength(1);
    });

    it('removes the filter when passed null', () => {
      const measure = buildScopedMeasure();
      const result = withFormulaFilterFor(category, null)(measure);

      expect(getFormulaFilters(result)).toEqual([]);
      expect(result.expression).toBe('SUM([cost])');
    });
  });

  describe('withReplacedFormulaFilter', () => {
    it('swaps the filter value while keeping the key and expression', () => {
      const measure = buildScopedMeasure();
      const replacement = filterFactory.members(category, ['Laptops']);
      const result = withReplacedFormulaFilter(category, replacement)(measure);

      expect(result).not.toBe(measure);
      expect(result.expression).toBe('(SUM([cost]), [categoryFilter])');
      expect(getFormulaFilters(result)[0]).toBe(replacement);
    });

    it('returns the same instance when nothing matches', () => {
      const measure = buildScopedMeasure();
      const result = withReplacedFormulaFilter(
        country,
        filterFactory.members(country, ['US']),
      )(measure);
      expect(result).toBe(measure);
    });
  });

  describe('withUpdatedFormulaFilter', () => {
    it('applies the update function to the matched filter, keeping the expression', () => {
      const measure = buildScopedMeasure();
      const replacement = filterFactory.members(category, ['Updated']);
      const update = vi.fn<(filter: Filter) => Filter>(() => replacement);

      const result = withUpdatedFormulaFilter(category, update)(measure);

      expect(update).toHaveBeenCalledOnce();
      expect(result.expression).toBe('(SUM([cost]), [categoryFilter])');
      expect(getFormulaFilters(result)[0]).toBe(replacement);
    });

    it('returns the same instance when nothing matches', () => {
      const measure = buildScopedMeasure();
      expect(withUpdatedFormulaFilter(country, (f) => f)(measure)).toBe(measure);
    });
  });

  describe('mapFormulaFilters', () => {
    it('maps every filter, leaving non-filter context entries untouched', () => {
      const measure = buildScopedMeasure();
      const replacement = filterFactory.members(category, ['Mapped']);

      const result = mapFormulaFilters(() => replacement)(measure);

      expect(getFormulaFilters(result)[0]).toBe(replacement);
      expect(result.context['[cost]']).toBe(measure.context['[cost]']);
    });

    it('returns the same instance when the mapping changes nothing', () => {
      const measure = buildScopedMeasure();
      expect(mapFormulaFilters((f) => f)(measure)).toBe(measure);
    });
  });

  describe('withoutFormulaFilter', () => {
    it('removes a measured-value filter from both the context and the expression', () => {
      const measure = buildScopedMeasure();
      const result = withoutFormulaFilter(category)(measure);

      expect(getFormulaFilters(result)).toEqual([]);
      expect(result.context['[categoryFilter]']).toBeUndefined();
      expect(result.expression).toBe('SUM([cost])');
    });

    it('returns the same instance when nothing matches', () => {
      const measure = buildScopedMeasure();
      expect(withoutFormulaFilter(country)(measure)).toBe(measure);
    });

    it('leaves a filter in place when removing it would corrupt the expression', () => {
      // The filter is in an operator position (not a measured-value argument), so stripping it
      // would break the formula — it must be left untouched.
      const measure = measureFactory.customFormula('m', '[categoryFilter] / 2', {
        categoryFilter: filterFactory.members(category, ['Apple Mac Desktops']),
      });

      const result = withoutFormulaFilter(category)(measure);

      expect(result).toBe(measure);
      expect(getFormulaFilters(result)).toHaveLength(1);
    });

    it('handles a long adversarial expression without pathological backtracking', () => {
      // Regression guard against ReDoS: the removal patterns are linear (`\s*,\s*` around a
      // literal), so a large whitespace run before the filter token strips in linear time.
      // A future change to a backtracking pattern would blow the test timeout instead of passing.
      const padding = ' '.repeat(50000);
      const measure = measureFactory.customFormula(
        'm',
        `(SUM([cost])${padding}, [categoryFilter])`,
        {
          cost,
          categoryFilter: filterFactory.members(category, ['Apple Mac Desktops']),
        },
      );

      const result = withoutFormulaFilter(category)(measure);

      expect(getFormulaFilters(result)).toEqual([]);
      expect(result.expression).toBe('SUM([cost])');
    });

    it('keeps the filter when the same key is also referenced outside a measured-value position', () => {
      // `[categoryFilter]` appears both as a measured-value argument and in an operator position;
      // stripping the measured-value occurrence would leave the second reference dangling, so the
      // filter must be left intact.
      const measure = measureFactory.customFormula(
        'm',
        '(SUM([cost]), [categoryFilter]) / [categoryFilter]',
        {
          cost,
          categoryFilter: filterFactory.members(category, ['Apple Mac Desktops']),
        },
      );

      const result = withoutFormulaFilter(category)(measure);

      expect(result).toBe(measure);
      expect(getFormulaFilters(result)).toHaveLength(1);
    });

    it('strips the redundant wrapping parens so add then remove round-trips', () => {
      const base = buildFilterlessMeasure(); // SUM([cost])
      const added = withAddedFormulaFilter(filterFactory.members(country, ['France']))(base);

      const removed = withoutFormulaFilter(country)(added);

      expect(removed.expression).toBe('SUM([cost])');
    });

    it('does not accrete parentheses over repeated add/remove cycles', () => {
      let measure: CalculatedMeasure = buildFilterlessMeasure();
      for (let i = 0; i < 5; i += 1) {
        measure = withAddedFormulaFilter(filterFactory.members(country, ['France']))(measure);
        measure = withoutFormulaFilter(country)(measure);
      }

      expect(measure.expression).toBe('SUM([cost])');
    });
  });

  describe('preservation', () => {
    it('preserves format and sort, and clears the stale compose code', () => {
      const measure = buildScopedMeasure().sort(Sort.Ascending) as CalculatedMeasure;
      expect(getComposeCode(measure)).toBeTruthy(); // sanity: customFormula generated it

      const result = withReplacedFormulaFilter(
        category,
        filterFactory.members(category, ['Laptops']),
      )(measure);

      expect(getFormat(result)).toBe('0.00%');
      expect(getSort(result)).toBe(Sort.Ascending);
      expect(getComposeCode(result)).toBeUndefined();
    });

    it('preserves the measure title when rebuilding via withReplacedFormulaFilter', () => {
      const titled = new DimensionalCalculatedMeasure(
        'Revenue with Filter',
        '(SUM([cost]), [categoryFilter])',
        { cost, categoryFilter: filterFactory.members(category, ['Apple Mac Desktops']) },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'Custom Title',
      );

      const result = withReplacedFormulaFilter(
        category,
        filterFactory.members(category, ['Laptops']),
      )(titled);

      expect(result.title).toBe('Custom Title');
    });
  });

  describe('composition and immutability', () => {
    it('composes with flow to retarget a filter', () => {
      const retarget = flow(
        withoutFormulaFilter(category),
        withAddedFormulaFilter(filterFactory.members(country, ['France'])),
      );

      const result = retarget(buildScopedMeasure());

      expect(getFormulaFilters(result)).toHaveLength(1);
      expect(getFormulaFilters(result)[0].attribute.expression).toBe('[Commerce.Country]');
    });

    it('never mutates the input measure', () => {
      const measure = buildScopedMeasure();
      const expressionBefore = measure.expression;
      const keysBefore = Object.keys(measure.context);

      withoutFormulaFilter(category)(measure);
      withAddedFormulaFilter(filterFactory.members(country, ['France']))(measure);
      withFormulaFilterFor(category, filterFactory.members(category, ['X']))(measure);

      expect(measure.expression).toBe(expressionBefore);
      expect(Object.keys(measure.context)).toEqual(keysBefore);
    });
  });
});
