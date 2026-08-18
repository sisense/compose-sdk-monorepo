import { DimensionalDateDimension } from '../dimensions/dimensions.js';
import { create } from '../factory.js';
import { Attribute } from '../interfaces.js';
import * as measureFactory from '../measures/factory.js';
import { CALCULATED_DIMENSION_JAQL_TYPE, DateLevels, MetadataTypes, Sort } from '../types.js';
import {
  DimensionalAttribute,
  DimensionalCalculatedAttribute,
  DimensionalLevelAttribute,
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

describe('attributeFactory.customFormula date-context granularity', () => {
  it('drops the default level of a date dimension and references the raw table/column', () => {
    // A bare date dimension serializes at its default level (years). Inside a formula that level
    // would truncate the date before the formula runs, so it must be stripped and replaced with a
    // raw column reference (otherwise the calendar dimension cannot be resolved by the backend).
    const date = new DimensionalDateDimension('Date', '[Commerce.Date (Calendar)]');

    const calcDim = attributeFactory.customFormula('Date prefix', 'left([date], 10)', {
      date,
    });

    expect(calcDim.jaql().jaql.context['[date]']).toEqual({
      title: 'Date',
      dim: '[Commerce.Date (Calendar)]',
      datatype: 'datetime',
      table: 'Commerce',
      column: 'Date',
    });
  });

  it('drops an explicit level of a date level attribute and references the raw table/column', () => {
    const dateMonths = new DimensionalLevelAttribute(
      'Date',
      '[Commerce.Date (Calendar)]',
      DateLevels.Months,
    );

    const calcDim = attributeFactory.customFormula('Date prefix', 'left([date], 10)', {
      date: dateMonths,
    });

    const entry = calcDim.jaql().jaql.context['[date]'];
    expect(entry).not.toHaveProperty('level');
    expect(entry).toMatchObject({ table: 'Commerce', column: 'Date' });
  });

  it('does not mutate a raw context object (constructed directly)', () => {
    // The class accepts a looser AttributeContext, so a context value may be a raw JAQL object
    // without a jaql() method. Such an object must not be mutated when its level is stripped.
    const rawDate = { dim: '[Commerce.Date (Calendar)]', datatype: 'datetime', level: 'years' };
    const calcDim = new DimensionalCalculatedAttribute('Date prefix', 'left([date], 10)', {
      '[date]': rawDate,
    });

    // The emitted JAQL is normalized (level dropped, raw column added)...
    expect(calcDim.jaql().jaql.context['[date]']).toEqual({
      dim: '[Commerce.Date (Calendar)]',
      datatype: 'datetime',
      table: 'Commerce',
      column: 'Date',
    });
    // ...but the consumer's original object is left untouched.
    expect(rawDate).toEqual({
      dim: '[Commerce.Date (Calendar)]',
      datatype: 'datetime',
      level: 'years',
    });
  });

  it('references the raw table/column of a calendar dimension that carries no granularity', () => {
    // A calendar dimension translated from Fusion arrives without any level key, because Fusion
    // references the raw column. There is no level to strip, but the raw table/column reference is
    // still added, so that a calendar dimension reaches the backend described the same way whether
    // it was authored in code or translated from Fusion.
    const rawCalendarDate = new DimensionalAttribute(
      'L_RECEIPTDATE',
      '[lineitem.L_RECEIPTDATE (Calendar)]',
      'text-attribute',
    );

    const calcDim = attributeFactory.customFormula('Date prefix', 'left([date], 10)', {
      date: rawCalendarDate,
    });

    expect(calcDim.jaql().jaql.context['[date]']).toMatchObject({
      dim: '[lineitem.L_RECEIPTDATE (Calendar)]',
      table: 'lineitem',
      column: 'L_RECEIPTDATE',
    });
  });

  it('leaves non-date context attributes untouched (no table/column added)', () => {
    const calcDim = attributeFactory.customFormula('x', 'Concat([ageRange], [gender])', {
      ageRange,
      gender,
    });

    const context = calcDim.jaql().jaql.context;
    expect(context['[ageRange]']).toEqual({
      title: 'Age Range',
      dim: '[Commerce.Age Range]',
      datatype: 'text',
    });
    expect(context['[ageRange]']).not.toHaveProperty('table');
    expect(context['[gender]']).not.toHaveProperty('column');
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
