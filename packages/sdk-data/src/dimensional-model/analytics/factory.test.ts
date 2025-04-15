import { createAttribute } from '../attributes.js';
import { Attribute, Measure } from '../interfaces.js';
import { BaseJaql, FilterJaql, FormulaJaql, NumericFilterJaql, OrFilterJaql } from '../types.js';
import * as analyticsFactory from './factory.js';

const attribute = createAttribute({
  name: 'text',
  type: 'text',
  expression: '[Text]',
});

function validateBoxWhiskerValues(
  values: Measure[],
  targetAttribute: Attribute,
  expectedFormulas: string[],
) {
  const valuesJaqls = values.map((v) => v.jaql(true) as FormulaJaql);

  expect(values).toHaveLength(expectedFormulas.length);

  expectedFormulas.forEach((expectedFormula) => {
    const relatedValueJaql = valuesJaqls.find(({ formula }) => formula.includes(expectedFormula));
    expect(relatedValueJaql).toBeDefined();
    expect((relatedValueJaql?.context?.['[Attr]'] as BaseJaql).dim).toBe(
      targetAttribute.expression,
    );
  });
}

function validateBoxWhiskerOutliers(
  outliersAttr: Attribute,
  targetAttribute: Attribute,
  expectedFilterFormulas: string[],
) {
  expect(outliersAttr).toBeDefined();

  const outliersAttrJaql = outliersAttr.jaql(true) as FilterJaql;

  expect(outliersAttrJaql.dim).toBe(targetAttribute.expression);
  expect(outliersAttrJaql.filter).toBeDefined();

  expectedFilterFormulas.forEach((expectedFormula) => {
    const filterJaql = (outliersAttrJaql.filter as OrFilterJaql<NumericFilterJaql>).or
      .map(({ fromNotEqual, toNotEqual }) => (fromNotEqual || toNotEqual) as FormulaJaql)
      .find((formulaJaql) => formulaJaql.formula.includes(expectedFormula));
    expect(filterJaql).toBeDefined();
    expect((filterJaql?.context?.['[Attr]'] as BaseJaql).dim).toBe(targetAttribute.expression);
  });
}

describe('analyticsFactory', () => {
  test('analyticsFactory.boxWhiskerIqrValues()', () => {
    validateBoxWhiskerValues(analyticsFactory.boxWhiskerIqrValues(attribute), attribute, [
      'QUARTILE([Attr], 1)',
      'MEDIAN([Attr])',
      'QUARTILE([Attr], 3)',
      'LOWERWHISKERMAX_IQR([Attr])',
      'UPPERWHISKERMIN_IQR([Attr])',
      'OUTLIERSCOUNT_IQR([Attr])',
    ]);
  });

  test('analyticsFactory.boxWhiskerExtremumsValues()', () => {
    validateBoxWhiskerValues(analyticsFactory.boxWhiskerExtremumsValues(attribute), attribute, [
      'QUARTILE([Attr], 1)',
      'MEDIAN([Attr])',
      'QUARTILE([Attr], 3)',
      'MIN([Attr])',
      'MAX([Attr])',
    ]);
  });

  test('analyticsFactory.boxWhiskerStdDevValues()', () => {
    validateBoxWhiskerValues(analyticsFactory.boxWhiskerStdDevValues(attribute), attribute, [
      'QUARTILE([Attr], 1)',
      'MEDIAN([Attr])',
      'QUARTILE([Attr], 3)',
      'LOWERWHISKERMAX_STDEVP([Attr])',
      'UPPERWHISKERMIN_STDEVP([Attr])',
      'OUTLIERSCOUNT_STDEVP([Attr])',
    ]);
  });

  test('analyticsFactory.boxWhiskerIqrOutliers()', () => {
    validateBoxWhiskerOutliers(analyticsFactory.boxWhiskerIqrOutliers(attribute), attribute, [
      '(UPPERWHISKERMIN_IQR([Attr]), all([Attr]))',
      '(LOWERWHISKERMAX_IQR([Attr]), all([Attr]))',
    ]);
  });

  test('analyticsFactory.boxWhiskerStdDevOutliers()', () => {
    validateBoxWhiskerOutliers(analyticsFactory.boxWhiskerStdDevOutliers(attribute), attribute, [
      '(UPPERWHISKERMIN_STDEVP([Attr]), all([Attr]))',
      '(LOWERWHISKERMAX_STDEVP([Attr]), all([Attr]))',
    ]);
  });
});
