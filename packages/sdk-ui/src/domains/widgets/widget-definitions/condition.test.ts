import { CONDITION_TEST_CASES } from './__test-helpers__/condition-cases';
import {
  type Condition,
  evaluateCondition,
  isDataPanelInputVisible,
  isValidCondition,
} from './condition';

describe('evaluateCondition', () => {
  it.each(CONDITION_TEST_CASES)('$description', ({ condition, context, expected }) => {
    expect(evaluateCondition(condition, context)).toBe(expected);
  });

  it('covers every condition variant in the shared table', () => {
    const variants = new Set(
      CONDITION_TEST_CASES.map(({ condition }) =>
        Object.keys(condition)
          .filter((key) => key !== 'path')
          .join(),
      ),
    );

    expect([...variants].sort()).toEqual(['all', 'any', 'equals', 'in', 'not', 'slot,minItems']);
  });

  describe('malformed input from untyped manifests', () => {
    const malformed: readonly unknown[] = [
      null,
      'chartType',
      {},
      { path: 'chartType' },
      { path: 'chartType', in: 'column' },
      { path: 1, equals: 1 },
      { slot: 'category' },
      { slot: 'category', minItems: '1' },
      { slot: 'category', minItems: NaN },
      { slot: 'category', minItems: Infinity },
      { all: 'nope' },
      { any: {} },
      { not: 'nope' },
    ];

    it.each(malformed)('reports %j as unreadable without throwing', (condition) => {
      expect(isValidCondition(condition)).toBe(false);
      // Simulates a condition that reached the evaluator without type checking.
      expect(evaluateCondition(condition as Condition, { chartType: 'column' })).toBeUndefined();
    });

    it.each([
      { path: 'chartType', equals: 'column', gt: 1 },
      { path: 'chartType', equals: 'column', in: ['line'] },
      { slot: 'value', minItems: 1, all: [] },
      { not: { path: 'chartType', equals: 'line' }, any: [] },
    ])('reports %j as unreadable when a node mixes variants or has extra keys', (condition) => {
      expect(isValidCondition(condition)).toBe(false);
      expect(evaluateCondition(condition as Condition, { chartType: 'column' })).toBeUndefined();
      expect(isDataPanelInputVisible({ visibleWhen: condition as Condition }, {})).toBe(true);
    });

    it.each([
      { all: [{ path: 'chartType', equals: 'column' }, {}] },
      {
        any: [
          { path: 'chartType', equals: 'line' },
          { path: 'chartType', gt: 1 },
        ],
      },
      { not: { path: 'chartType', gt: 1 } },
    ])('reports %j as unreadable when any nested node is unreadable', (condition) => {
      expect(isValidCondition(condition)).toBe(false);
      expect(evaluateCondition(condition as Condition, { chartType: 'column' })).toBeUndefined();
    });
  });

  it('accepts every condition of the shared table as valid', () => {
    CONDITION_TEST_CASES.forEach(({ condition }) => expect(isValidCondition(condition)).toBe(true));
  });
});

describe('isDataPanelInputVisible', () => {
  const context = { chartType: 'column', slotItemCounts: { value: 0 } };

  it('shows an input without visibleWhen', () => {
    expect(isDataPanelInputVisible({}, context)).toBe(true);
  });

  it('follows a readable condition', () => {
    expect(isDataPanelInputVisible({ visibleWhen: { slot: 'value', minItems: 1 } }, context)).toBe(
      false,
    );
    expect(
      isDataPanelInputVisible({ visibleWhen: { path: 'chartType', equals: 'column' } }, context),
    ).toBe(true);
  });

  it.each([{ path: 'chartType', gt: 1 }, { not: { path: 'chartType', gt: 1 } }, {}])(
    'shows an input whose visibleWhen %j cannot be read',
    (visibleWhen) => {
      expect(isDataPanelInputVisible({ visibleWhen: visibleWhen as Condition }, context)).toBe(
        true,
      );
    },
  );
});
