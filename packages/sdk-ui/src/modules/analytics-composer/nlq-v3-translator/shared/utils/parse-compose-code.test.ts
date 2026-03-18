import { describe, expect, it } from 'vitest';

import { parseComposeCodeToFunctionCall } from './parse-compose-code.js';

describe('parseComposeCodeToFunctionCall', () => {
  it('parses simple function call with two string args', () => {
    const result = parseComposeCodeToFunctionCall(
      "measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')",
    );
    expect(result).toEqual({
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue', 'Total Revenue'],
    });
  });

  it('parses function call with array arg', () => {
    const result = parseComposeCodeToFunctionCall(
      "filterFactory.members(DM.Commerce.Date.Years, ['2024-01-01T00:00:00'])",
    );
    expect(result).toEqual({
      function: 'filterFactory.members',
      args: ['DM.Commerce.Date.Years', ['2024-01-01T00:00:00']],
    });
  });

  it('parses function call with object arg', () => {
    const result = parseComposeCodeToFunctionCall(
      "filterFactory.members(DM.Commerce.Date.Years, ['x'], { excludeMembers: true })",
    );
    expect(result).toEqual({
      function: 'filterFactory.members',
      args: ['DM.Commerce.Date.Years', ['x'], { excludeMembers: true }],
    });
  });

  it('parses nested function calls (logic.and)', () => {
    const result = parseComposeCodeToFunctionCall(
      "filterFactory.logic.and(filterFactory.members(DM.Category.Category, ['Category A']), filterFactory.members(DM.Brand.Brand, ['Brand B']))",
    );
    expect(result).toEqual({
      function: 'filterFactory.logic.and',
      args: [
        {
          function: 'filterFactory.members',
          args: ['DM.Category.Category', ['Category A']],
        },
        {
          function: 'filterFactory.members',
          args: ['DM.Brand.Brand', ['Brand B']],
        },
      ],
    });
  });

  it('parses nested function call as argument (topRanking with measure)', () => {
    const result = parseComposeCodeToFunctionCall(
      "filterFactory.topRanking(DM.Brand.Brand, measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'), 5)",
    );
    expect(result).toEqual({
      function: 'filterFactory.topRanking',
      args: [
        'DM.Brand.Brand',
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Total Revenue'],
        },
        5,
      ],
    });
  });

  it('parses empty arguments', () => {
    const result = parseComposeCodeToFunctionCall('measureFactory.count()');
    expect(result).toEqual({
      function: 'measureFactory.count',
      args: [],
    });
  });

  it('parses primitive args: null, undefined, boolean, number', () => {
    const result = parseComposeCodeToFunctionCall('fn(null, undefined, true, false, 42, -1.5)');
    expect(result).toEqual({
      function: 'fn',
      args: [null, undefined, true, false, 42, -1.5],
    });
  });

  it('parses string with comma inside (no split)', () => {
    const result = parseComposeCodeToFunctionCall("fn('a, b', 'c')");
    expect(result).toEqual({
      function: 'fn',
      args: ['a, b', 'c'],
    });
  });

  it('parses string with escaped quote', () => {
    const result = parseComposeCodeToFunctionCall("fn('It''s fine')");
    expect(result).toEqual({
      function: 'fn',
      args: ["It's fine"],
    });
  });

  it('parses object with quoted keys and colon in value', () => {
    const result = parseComposeCodeToFunctionCall("fn({ key: 'value', other: 123 })");
    expect(result).toEqual({
      function: 'fn',
      args: [{ key: 'value', other: 123 }],
    });
  });

  it('parses customFormula with context object', () => {
    const result = parseComposeCodeToFunctionCall(
      "measureFactory.customFormula('Profit', '[Revenue] - [Cost]', { Revenue: measureFactory.sum(DM.Commerce.Revenue), Cost: measureFactory.sum(DM.Commerce.Cost) })",
    );
    expect(result.function).toBe('measureFactory.customFormula');
    expect(result.args[0]).toBe('Profit');
    expect(result.args[1]).toBe('[Revenue] - [Cost]');
    expect(typeof result.args[2]).toBe('object');
    const ctx = result.args[2] as Record<string, unknown>;
    expect(ctx.Revenue).toEqual({
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue'],
    });
    expect(ctx.Cost).toEqual({
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Cost'],
    });
  });

  it('throws on empty string', () => {
    expect(() => parseComposeCodeToFunctionCall('')).toThrow(/empty string/);
  });

  it('throws on non-function-call format', () => {
    expect(() => parseComposeCodeToFunctionCall('DM.Commerce.Revenue')).toThrow(
      /expected function call/,
    );
  });

  it('throws on invalid composeCode type', () => {
    expect(() => parseComposeCodeToFunctionCall(null as unknown as string)).toThrow(
      /expected non-empty string/,
    );
  });
});
