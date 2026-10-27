import type { Condition, ConditionContext } from '../condition';

/**
 * One case of the shared `Condition` test table: a condition, the widget state it is evaluated
 * against, and the expected result.
 */
export interface ConditionTestCase {
  /** What the case checks. */
  readonly description: string;
  /** The condition under test. */
  readonly condition: Condition;
  /** The widget state the condition is evaluated against. */
  readonly context: ConditionContext;
  /** The expected result. */
  readonly expected: boolean;
}

const widget: ConditionContext = {
  chartType: 'column',
  dataOptions: {
    category: [{ column: { name: 'Category' } }],
    value: [],
    comparison: { type: 'target' },
  },
  styleOptions: {
    legend: { enabled: true, position: 'bottom' },
    subtype: 'column/stackedcolumn',
    markers: { size: { width: 4 } },
  },
  slotItemCounts: { category: 1, value: 0, breakBy: 2 },
};

/**
 * Semantics of `Condition`, as a plain table so that every evaluator (the SDK's own, or an adapter
 * written by another editor host) can be checked against the same cases.
 */
export const CONDITION_TEST_CASES: readonly ConditionTestCase[] = [
  // { path, equals }
  {
    description: 'equals: matches a primitive at a nested path',
    condition: { path: 'styleOptions.legend.position', equals: 'bottom' },
    context: widget,
    expected: true,
  },
  {
    description: 'equals: does not match a different primitive',
    condition: { path: 'styleOptions.legend.position', equals: 'top' },
    context: widget,
    expected: false,
  },
  {
    description: 'equals: reads chartType',
    condition: { path: 'chartType', equals: 'column' },
    context: widget,
    expected: true,
  },
  {
    description: 'equals: compares objects deeply',
    condition: { path: 'styleOptions.markers', equals: { size: { width: 4 } } },
    context: widget,
    expected: true,
  },
  {
    description: 'equals: compares arrays deeply',
    condition: { path: 'dataOptions.category', equals: [{ column: { name: 'Category' } }] },
    context: widget,
    expected: true,
  },
  {
    description: 'equals: does not coerce types',
    condition: { path: 'styleOptions.legend.enabled', equals: 'true' },
    context: widget,
    expected: false,
  },
  {
    description: 'equals: a missing path reads as undefined',
    condition: { path: 'styleOptions.unknown.deep', equals: undefined },
    context: widget,
    expected: true,
  },
  {
    description: 'equals: a missing path does not equal null',
    condition: { path: 'styleOptions.unknown', equals: null },
    context: widget,
    expected: false,
  },
  {
    description: 'equals: a path into a missing root reads as undefined',
    condition: { path: 'dataOptions.category', equals: undefined },
    context: {},
    expected: true,
  },
  {
    description:
      'equals: a path outside chartType, dataOptions and styleOptions reads as undefined',
    condition: { path: 'slotItemCounts.category', equals: 1 },
    context: widget,
    expected: false,
  },
  // { path, in }
  {
    description: 'in: matches one of several primitives',
    condition: { path: 'dataOptions.comparison.type', in: ['delta', 'value', 'target'] },
    context: widget,
    expected: true,
  },
  {
    description: 'in: no candidate matches',
    condition: { path: 'dataOptions.comparison.type', in: ['delta', 'value'] },
    context: widget,
    expected: false,
  },
  {
    description: 'in: an empty list never matches',
    condition: { path: 'chartType', in: [] },
    context: widget,
    expected: false,
  },
  {
    description: 'in: compares objects deeply',
    condition: {
      path: 'dataOptions.comparison',
      in: [{ type: 'delta' }, { type: 'target' }],
    },
    context: widget,
    expected: true,
  },
  {
    description: 'in: a missing path matches an undefined candidate',
    condition: { path: 'styleOptions.unknown', in: ['a', undefined] },
    context: widget,
    expected: true,
  },
  {
    description: 'in: a missing path does not match defined candidates',
    condition: { path: 'styleOptions.unknown', in: ['a', null] },
    context: widget,
    expected: false,
  },
  // { slot, minItems }
  {
    description: 'slot: has at least the required number of items',
    condition: { slot: 'breakBy', minItems: 2 },
    context: widget,
    expected: true,
  },
  {
    description: 'slot: has fewer items than required',
    condition: { slot: 'breakBy', minItems: 3 },
    context: widget,
    expected: false,
  },
  {
    description: 'slot: an empty slot satisfies minItems 0',
    condition: { slot: 'value', minItems: 0 },
    context: widget,
    expected: true,
  },
  {
    description: 'slot: an empty slot does not satisfy minItems 1',
    condition: { slot: 'value', minItems: 1 },
    context: widget,
    expected: false,
  },
  {
    description: 'slot: an unknown slot has no items',
    condition: { slot: 'y2', minItems: 1 },
    context: widget,
    expected: false,
  },
  {
    description: 'slot: missing item counts mean no items',
    condition: { slot: 'category', minItems: 1 },
    context: {},
    expected: false,
  },
  // { all }
  {
    description: 'all: every nested condition holds',
    condition: {
      all: [
        { path: 'chartType', equals: 'column' },
        { slot: 'category', minItems: 1 },
      ],
    },
    context: widget,
    expected: true,
  },
  {
    description: 'all: one nested condition fails',
    condition: {
      all: [
        { path: 'chartType', equals: 'column' },
        { slot: 'value', minItems: 1 },
      ],
    },
    context: widget,
    expected: false,
  },
  {
    description: 'all: an empty list holds',
    condition: { all: [] },
    context: widget,
    expected: true,
  },
  // { any }
  {
    description: 'any: one nested condition holds',
    condition: {
      any: [
        { path: 'chartType', equals: 'line' },
        { slot: 'category', minItems: 1 },
      ],
    },
    context: widget,
    expected: true,
  },
  {
    description: 'any: no nested condition holds',
    condition: {
      any: [
        { path: 'chartType', equals: 'line' },
        { slot: 'value', minItems: 1 },
      ],
    },
    context: widget,
    expected: false,
  },
  {
    description: 'any: an empty list does not hold',
    condition: { any: [] },
    context: widget,
    expected: false,
  },
  // { not }
  {
    description: 'not: negates a holding condition',
    condition: { not: { path: 'chartType', equals: 'column' } },
    context: widget,
    expected: false,
  },
  {
    description: 'not: negates a failing condition',
    condition: { not: { slot: 'value', minItems: 1 } },
    context: widget,
    expected: true,
  },
  {
    description: 'not: double negation',
    condition: { not: { not: { path: 'chartType', equals: 'column' } } },
    context: widget,
    expected: true,
  },
  // Nesting
  {
    description: 'nesting: all of any and not',
    condition: {
      all: [
        {
          any: [
            { path: 'dataOptions.comparison.type', in: ['delta', 'value'] },
            { path: 'dataOptions.comparison.type', equals: 'target' },
          ],
        },
        { not: { slot: 'value', minItems: 1 } },
        { slot: 'breakBy', minItems: 1 },
      ],
    },
    context: widget,
    expected: true,
  },
  {
    description: 'nesting: any of failing all branches',
    condition: {
      any: [
        { all: [{ path: 'chartType', equals: 'column' }, { not: { all: [] } }] },
        { all: [{ any: [] }] },
      ],
    },
    context: widget,
    expected: false,
  },
];
