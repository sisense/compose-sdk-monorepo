import { create } from '../factory.js';
import { Attribute } from '../interfaces.js';
import * as measureFactory from '../measures/factory.js';
import { CALCULATED_DIMENSION_JAQL_TYPE, MetadataTypes, Sort } from '../types.js';
import {
  DimensionalAttribute,
  DimensionalCalculatedAttribute,
  isDimensionalCalculatedAttribute,
} from './attributes.js';
import * as attributeFactory from './factory.js';

const ageRange = new DimensionalAttribute('Age Range', '[Commerce.Age Range]', 'text-attribute');
const gender = new DimensionalAttribute('Gender', '[Commerce.Gender]', 'text-attribute');
const revenue = new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'numeric-attribute');

describe('attributeFactory.customFormula', () => {
  it('produces a calculated_dimension JAQL matching the Fusion contract', () => {
    const calcDim = attributeFactory.customFormula(
      'Age & Gender',
      "Concat([ageRange], ' ', [gender])",
      { ageRange, gender },
    );

    expect(isDimensionalCalculatedAttribute(calcDim)).toBe(true);
    expect(calcDim.jaql()).toEqual({
      jaql: {
        type: 'calculated_dimension',
        title: 'Age & Gender',
        formula: "Concat([ageRange], ' ', [gender])",
        context: {
          '[ageRange]': { title: 'Age Range', dim: '[Commerce.Age Range]', datatype: 'text' },
          '[gender]': { title: 'Gender', dim: '[Commerce.Gender]', datatype: 'text' },
        },
      },
    });
  });

  it('wraps unbracketed context keys and preserves bracketed ones', () => {
    const unbracketed = attributeFactory.customFormula('x', 'Left([category], 5)', {
      category: ageRange,
    }) as DimensionalCalculatedAttribute;
    const bracketed = attributeFactory.customFormula('x', 'Left([category], 5)', {
      '[category]': ageRange,
    }) as DimensionalCalculatedAttribute;

    expect(Object.keys(unbracketed.context)).toEqual(['[category]']);
    expect(Object.keys(bracketed.context)).toEqual(['[category]']);
  });

  it('uses the calculated-attribute metadata type (text-only)', () => {
    const calcDim = attributeFactory.customFormula('x', "IF([revenue] > 1000, 'High', 'Low')", {
      revenue,
    }) as DimensionalCalculatedAttribute;

    expect(calcDim.type).toBe(MetadataTypes.CalculatedAttribute);
  });

  it('attaches composeCode for code generation', () => {
    const calcDim = attributeFactory.customFormula(
      'Age & Gender',
      "Concat([ageRange], ' ', [gender])",
      { ageRange, gender },
    );

    expect(calcDim.composeCode).toContain('attributeFactory.customFormula(');
  });

  it('supports sorting', () => {
    const calcDim = attributeFactory
      .customFormula('x', 'Left([category], 5)', { category: ageRange })
      .sort(Sort.Ascending);

    expect(calcDim.jaql().jaql.sort).toBe('asc');
  });
});

describe('calculated attribute classification', () => {
  const calcDim = attributeFactory.customFormula(
    'Age & Gender',
    "Concat([ageRange], ' ', [gender])",
    { ageRange, gender },
  );

  it('is recognized as a calculated attribute and an attribute, never a measure', () => {
    expect(MetadataTypes.isCalculatedAttribute(calcDim)).toBe(true);
    expect(MetadataTypes.isAttribute(calcDim)).toBe(true);
    expect(MetadataTypes.isCalculatedMeasure(calcDim)).toBe(false);
    expect(MetadataTypes.isMeasure(calcDim)).toBe(false);
  });

  it('does not misclassify a calculated measure as a calculated attribute', () => {
    const m = measureFactory.customFormula('Profit', '[revenue] - [cost]', {
      revenue,
      cost: revenue,
    });

    expect(MetadataTypes.isCalculatedAttribute(m)).toBe(false);
    expect(MetadataTypes.isCalculatedMeasure(m)).toBe(true);
    expect(MetadataTypes.isMeasure(m)).toBe(true);
  });

  it('recognizes raw calculated_dimension JAQL', () => {
    const rawJaql = { type: CALCULATED_DIMENSION_JAQL_TYPE, formula: 'Left([c], 5)', context: {} };

    expect(MetadataTypes.isCalculatedAttribute(rawJaql)).toBe(true);
    expect(MetadataTypes.isCalculatedMeasure(rawJaql)).toBe(false);
  });
});

describe('create() round-trip for calculated attributes', () => {
  it('reconstructs from JAQL', () => {
    const original = attributeFactory.customFormula(
      'Age & Gender',
      "Concat([ageRange], ' ', [gender])",
      { ageRange, gender },
    );
    const restored = create(original.jaql().jaql) as Attribute;

    expect(isDimensionalCalculatedAttribute(restored)).toBe(true);
    expect(restored.jaql()).toEqual(original.jaql());
  });

  it('reconstructs from the serialized form', () => {
    const original = attributeFactory.customFormula(
      'Age & Gender',
      'Concat([ageRange], [gender])',
      {
        ageRange,
        gender,
      },
    );
    const restored = create(original.serialize()) as Attribute;

    expect(isDimensionalCalculatedAttribute(restored)).toBe(true);
    expect(restored.type).toBe(MetadataTypes.CalculatedAttribute);
    expect(restored.jaql()).toEqual(original.jaql());
  });
});
