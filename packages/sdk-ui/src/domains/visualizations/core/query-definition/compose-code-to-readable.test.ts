import type { Attribute, Filter, FilterRelations, FunctionCall, Measure } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { functionCallToString, getQueryPillTooltipModel } from './compose-code-to-readable';

describe('functionCallToString', () => {
  it('returns ??? when args is not an array', () => {
    expect(
      functionCallToString({ function: 'x', args: undefined as unknown as FunctionCall['args'] }),
    ).toBe('???');
  });

  it('formats a simple call using the function name leaf', () => {
    const fc: FunctionCall = { function: 'factory.sum', args: ['DM.A.B', '1'] };
    expect(functionCallToString(fc)).toBe('sum(DM.A.B, 1)');
  });

  it('drops string args whose path leaf is in ignoreArgs', () => {
    const fc: FunctionCall = { function: 'sum', args: ['DM.Commerce.Revenue', 'Other'] };
    expect(functionCallToString(fc, ['Revenue'])).toBe('sum(Other)');
  });

  it('stringifies nested function calls', () => {
    const inner: FunctionCall = { function: 'inner.f', args: ['x'] };
    const fc: FunctionCall = { function: 'outer.g', args: [inner] };
    expect(functionCallToString(fc)).toBe('g(f(x))');
  });

  it('formats array args as bracketed lists', () => {
    const fc: FunctionCall = { function: 'm', args: [['a', 'b']] };
    expect(functionCallToString(fc)).toBe('m([a,b])');
  });

  it('formats null and undefined args without throwing', () => {
    expect(functionCallToString({ function: 'm', args: [null as unknown as string] })).toBe(
      'm(null)',
    );
    expect(functionCallToString({ function: 'm', args: [undefined as unknown as string] })).toBe(
      'm(undefined)',
    );
  });

  it('formats object args as JSON, not [object Object]', () => {
    const fc: FunctionCall = {
      function: 'm',
      args: [{ a: 1 } as unknown as string],
    };
    expect(functionCallToString(fc)).toBe('m({"a":1})');
  });
});

describe('getQueryPillTooltipModel', () => {
  it('returns null when tooltipData is missing', () => {
    expect(
      getQueryPillTooltipModel({ type: 'pill', label: 'x', category: 'dimension' }),
    ).toBeNull();
  });

  it('returns null for operator pills', () => {
    expect(
      getQueryPillTooltipModel({
        type: 'pill',
        label: '>',
        category: 'operator',
        tooltipData: {} as unknown as Measure,
      }),
    ).toBeNull();
  });

  it('parses measure composeCode into a readable formula when present', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Total Revenue',
      category: 'measure',
      tooltipData: {
        name: 'Total Revenue',
        composeCode: "measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')",
      } as unknown as Measure,
    });
    expect(model).not.toBeNull();
    expect(model?.typeLabel).toBe('Measure');
    expect(model?.formula).toBe('sum(DM.Commerce.Revenue)');
    expect(model?.layoutText).toBe('Total Revenue');
  });

  it('uses SUM(column) when aggregate measure has no composeCode function call', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Sum of Sales',
      category: 'measure',
      tooltipData: {
        name: 'Sum of Sales',
        aggregation: 'sum',
        attribute: {
          name: 'Revenue',
          composeCode: 'DM.Commerce.Revenue',
        },
      } as unknown as Measure,
    });
    expect(model?.formula).toBe('SUM(Revenue)');
  });

  it('parses filter composeCode into a readable members(...) formula', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Region',
      category: 'filter',
      tooltipData: {
        composeCode: "filterFactory.members(DM.Geography.Region, ['North', 'South'])",
        attribute: { name: 'Region', composeCode: 'DM.Geography.Region' },
      } as unknown as FilterRelations,
    });
    expect(model).not.toBeNull();
    expect(model?.typeLabel).toBe('Filter');
    expect(model?.formula).toContain('members(');
    expect(model?.column).toBe('Region');
  });

  it('uses pill label as layoutText when source has no name', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Region',
      category: 'filter',
      tooltipData: {
        composeCode: "filterFactory.members(DM.Geography.Region, ['North', 'South'])",
        attribute: { name: 'Region', composeCode: 'DM.Geography.Region' },
      } as unknown as Filter,
    });
    expect(model?.layoutText).toBe('Region');
  });

  it('uses dimension column leaf as formula when composeCode is a DM path', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Category',
      category: 'dimension',
      tooltipData: {
        name: 'Category',
        composeCode: 'DM.Category.Category',
      } as Attribute,
    });
    expect(model).not.toBeNull();
    expect(model?.typeLabel).toBe('Dimension');
    expect(model?.formula).toBe('Category');
    expect(model?.column).toBe('Category');
  });

  it('falls back to aggregation formula when composeCode parses with an error', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Bad',
      category: 'measure',
      tooltipData: {
        name: 'Bad',
        aggregation: 'sum',
        composeCode: 'x(',
        attribute: { name: 'Revenue', composeCode: 'DM.Commerce.Revenue' },
      } as unknown as Measure,
    });
    expect(model).not.toBeNull();
    expect(model?.formula).toBe('SUM(Revenue)');
  });
});
