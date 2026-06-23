import type { Attribute, Filter, FilterRelations, Measure } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  getQueryPillTooltipModel,
  simplifyComposeCodeForTooltip,
} from './compose-code-to-readable';

describe('simplifyComposeCodeForTooltip', () => {
  it('strips measureFactory, filterFactory, and DM prefixes', () => {
    expect(
      simplifyComposeCodeForTooltip("measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')"),
    ).toBe("sum(Commerce.Revenue, 'Total Revenue')");
  });

  it('strips nested factory and DM tokens', () => {
    expect(
      simplifyComposeCodeForTooltip(
        'filterFactory.topRanking(DM.Brand.Brand, measureFactory.sum(DM.Commerce.Revenue), 5)',
      ),
    ).toBe('topRanking(Brand.Brand, sum(Commerce.Revenue), 5)');
  });

  it('trims leading and trailing whitespace before stripping prefixes', () => {
    expect(
      simplifyComposeCodeForTooltip("  measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')  "),
    ).toBe("sum(Commerce.Revenue, 'Total Revenue')");
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

  it('detects call-shaped composeCode and strips factories when leading whitespace is present', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Total Revenue',
      category: 'measure',
      tooltipData: {
        name: 'Total Revenue',
        composeCode: "  measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')",
      } as unknown as Measure,
    });
    expect(model).not.toBeNull();
    expect(model?.formula).toBe("sum(Commerce.Revenue, 'Total Revenue')");
  });

  it('uses stripped composeCode as formula when present', () => {
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
    expect(model?.formula).toBe("sum(Commerce.Revenue, 'Total Revenue')");
    expect(model?.layoutText).toBe('Total Revenue');
    expect(model?.column).toBe('Total Revenue');
    expect(model?.showColumnInTooltip).toBe(false);
    expect(model?.showFormulaInTooltip).toBe(true);
  });

  it('keeps full compose when attribute leaf matches path (regression)', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Total Revenue',
      category: 'measure',
      tooltipData: {
        name: 'Total Revenue',
        composeCode: "measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')",
        attribute: {
          name: 'Revenue',
          composeCode: 'DM.Commerce.Revenue',
        },
      } as unknown as Measure,
    });
    expect(model?.column).toBe('Commerce.Revenue');
    expect(model?.formula).toBe("sum(Commerce.Revenue, 'Total Revenue')");
    expect(model?.showColumnInTooltip).toBe(true);
    expect(model?.showFormulaInTooltip).toBe(true);
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
    expect(model?.column).toBe('Commerce.Revenue');
    expect(model?.formula).toBe('SUM(Commerce.Revenue)');
    expect(model?.showColumnInTooltip).toBe(true);
    expect(model?.showFormulaInTooltip).toBe(true);
  });

  it('uses stripped filter composeCode as formula', () => {
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
    expect(model?.formula).toBe("members(Geography.Region, ['North', 'South'])");
    expect(model?.column).toBe('Geography.Region');
    expect(model?.showColumnInTooltip).toBe(true);
    expect(model?.showFormulaInTooltip).toBe(true);
  });

  it('uses title as layoutText when it differs from identity name', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Age Range',
      category: 'dimension',
      tooltipData: {
        name: 'Age Range',
        title: 'Age Range DisplayName',
        composeCode: 'DM.Commerce.[[Age Range]]',
      } as Attribute,
    });
    expect(model?.layoutText).toBe('Age Range DisplayName');
    expect(model?.column).toBe('Commerce.Age Range');
    expect(model?.showColumnInTooltip).toBe(true);
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

  it('shows Column for DM path dimension when path differs from display name; omits duplicate Formula', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Product Category',
      category: 'dimension',
      tooltipData: {
        name: 'Product Category',
        composeCode: 'DM.Category.Category',
      } as Attribute,
    });
    expect(model).not.toBeNull();
    expect(model?.typeLabel).toBe('Dimension');
    expect(model?.formula).toBe('Category.Category');
    expect(model?.column).toBe('Category.Category');
    expect(model?.showColumnInTooltip).toBe(true);
    expect(model?.showFormulaInTooltip).toBe(false);
  });

  it('unwraps [[...]] in DM path for column display (spaces in column name)', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Age Range',
      category: 'dimension',
      tooltipData: {
        name: 'Age Range',
        composeCode: 'DM.Commerce.[[Age Range]]',
      } as Attribute,
    });
    expect(model?.column).toBe('Commerce.Age Range');
    expect(model?.formula).toBe('Commerce.Age Range');
    expect(model?.showColumnInTooltip).toBe(true);
    expect(model?.showFormulaInTooltip).toBe(false);
  });

  it('strips only leading DM. in path; preserves DM. later in the path', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Edge',
      category: 'dimension',
      tooltipData: {
        name: 'Edge',
        composeCode: 'DM.Category.DM.Label',
      } as Attribute,
    });
    expect(model?.column).toBe('Category.DM.Label');
    expect(model?.formula).toBe('Category.DM.Label');
  });

  it('unwraps [[...]] in DM path when segment contains parentheses (e.g. currency suffix)', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Revenue (USD)',
      category: 'dimension',
      tooltipData: {
        name: 'Revenue (USD)',
        composeCode: 'DM.Commerce.[[Revenue (USD)]]',
      } as Attribute,
    });
    expect(model?.column).toBe('Commerce.Revenue (USD)');
    expect(model?.formula).toBe('Commerce.Revenue (USD)');
    expect(model?.showColumnInTooltip).toBe(true);
    expect(model?.showFormulaInTooltip).toBe(false);
  });

  it('includes date level in DM path for dimensional level attribute', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Years in Date',
      category: 'dimension',
      tooltipData: {
        name: 'Years in Date',
        composeCode: 'DM.Commerce.Date.Years',
      } as Attribute,
    });
    expect(model?.column).toBe('Commerce.Date.Years');
    expect(model?.formula).toBe('Commerce.Date.Years');
    expect(model?.showColumnInTooltip).toBe(true);
    expect(model?.showFormulaInTooltip).toBe(false);
  });

  it('hides column when it matches measure name for customFormula', () => {
    const model = getQueryPillTooltipModel({
      type: 'pill',
      label: 'Revenue When Cost Under 100',
      category: 'measure',
      tooltipData: {
        name: 'Revenue When Cost Under 100',
        composeCode:
          "customFormula('Revenue When Cost Under 100', 'CASE WHEN [cost] < 100 THEN [revenue] ELSE 0 END', { cost: sum(Commerce.Cost), revenue: sum(Commerce.Revenue) })",
      } as unknown as Measure,
    });
    expect(model?.column).toBe('Revenue When Cost Under 100');
    expect(model?.showColumnInTooltip).toBe(false);
    expect(model?.showFormulaInTooltip).toBe(true);
    expect(model?.formula).toContain('customFormula');
  });

  it('uses stripped compose when call-shaped even if not parseable as valid compose', () => {
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
    expect(model?.formula).toBe('x(');
    expect(model?.column).toBe('Commerce.Revenue');
    expect(model?.showColumnInTooltip).toBe(true);
    expect(model?.showFormulaInTooltip).toBe(true);
  });
});
