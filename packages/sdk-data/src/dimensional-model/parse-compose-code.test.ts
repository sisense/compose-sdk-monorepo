import { parseComposeCodeToFunctionCall } from './parse-compose-code.js';

describe('parseComposeCodeToFunctionCall', () => {
  it('should parse a customFormula whose expression spans multiple lines', () => {
    // A customFormula expression may be authored across several lines (e.g. a CASE block), and the
    // newlines are carried verbatim into the composeCode.
    const result = parseComposeCodeToFunctionCall(
      "measureFactory.customFormula('Tier', 'CASE\nWHEN [Revenue] > 100 THEN 1\nELSE 0 END', {})",
    );

    expect(result.function).toBe('measureFactory.customFormula');
    expect(result.args[0]).toBe('Tier');
    expect(result.args[1]).toBe('CASE\nWHEN [Revenue] > 100 THEN 1\nELSE 0 END');
  });

  it('should keep newlines inside a quoted argument intact', () => {
    const result = parseComposeCodeToFunctionCall("someFactory.fn('a\nb', 'c')");

    expect(result.args).toEqual(['a\nb', 'c']);
  });

  it('should still parse a single-line function call', () => {
    const result = parseComposeCodeToFunctionCall(
      "measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')",
    );

    expect(result.function).toBe('measureFactory.sum');
    expect(result.args).toEqual(['DM.Commerce.Revenue', 'Total Revenue']);
  });

  it('should throw when the composeCode is not a function call', () => {
    expect(() => parseComposeCodeToFunctionCall('not a function call')).toThrow(
      'Invalid composeCode format',
    );
  });

  it('parses a string argument containing a backslash-escaped quote', () => {
    // A member value may contain an apostrophe (e.g. a component named "Filters & Formula's").
    // Serialised, that becomes a backslash-escaped quote, which must not end the string.
    const result = parseComposeCodeToFunctionCall(
      "filterFactory.members(DM.Bug.Components, ['Filters', 'Filters & Formula\\'s'])",
    );

    expect(result.args[1]).toEqual(['Filters', "Filters & Formula's"]);
  });

  it('keeps a trailing object argument intact when an earlier argument contains an escaped quote', () => {
    // Regression: the escaped quote used to flip string tracking, so depth never returned to zero
    // and every later argument was swallowed into the object.
    const result = parseComposeCodeToFunctionCall(
      "measureFactory.customFormula('T', '([A])', { '[A]': filterFactory.members(DM.B.C, ['it\\'s']) }, undefined, '')",
    );

    expect(result.args).toHaveLength(5);
    expect(typeof result.args[2]).toBe('object');
    expect(result.args[3]).toBeUndefined();
    expect(result.args[4]).toBe('');
  });

  it('treats a DM reference whose column name contains parentheses as a reference, not a call', () => {
    const result = parseComposeCodeToFunctionCall(
      "measureFactory.countDistinct(DM.[[FACT_QUERY 2]].[[COUNT(DISTINCT QUERYGUID)]], 'Distinct')",
    );

    expect(result.args[0]).toBe('DM.[[FACT_QUERY 2]].[[COUNT(DISTINCT QUERYGUID)]]');
  });

  it('parses an object key containing an escaped quote', () => {
    // `findDelimiterAtDepthZero` locates the `:` separating key from value, and `unquote` strips the
    // key's quotes — both need the same escape handling as the argument splitter.
    const result = parseComposeCodeToFunctionCall(
      "measureFactory.customFormula('T', '[A]', { 'A\\'B': 1 })",
    );

    expect(result.args[2]).toEqual({ "A'B": 1 });
  });

  it('unescapes a doubled quote in an object key', () => {
    const result = parseComposeCodeToFunctionCall(
      "measureFactory.customFormula('T', '[A]', { 'A''B': 1 })",
    );

    expect(result.args[2]).toEqual({ "A'B": 1 });
  });

  it('preserves both quotes when two backslash-escaped quotes are adjacent', () => {
    // Unescaping in two passes loses one: `A\\'\\'B` becomes `A''B`, which a second pass over
    // doubled quotes then collapses to `A'B`.
    const result = parseComposeCodeToFunctionCall(String.raw`fn('A\'\'B')`);

    expect(result.args[0]).toBe("A''B");
  });

  it('preserves both quotes for adjacent escaped double quotes', () => {
    const result = parseComposeCodeToFunctionCall(String.raw`fn("A\"\"B")`);

    expect(result.args[0]).toBe('A""B');
  });
});
