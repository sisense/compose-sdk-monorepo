import { type Attribute, MetadataTypes } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../../__mocks__/mock-data-sources.js';
import { createSchemaIndex } from '../../shared/utils/schema-index.js';
import { getErrors, getSuccessData } from '../../shared/utils/translation-helpers.js';
import { getQueryElementSummary } from '../get-query-element-summary.js';
import { translateDimensionsFromJSON } from './translate-dimensions-from-json.js';
import { translateDimensionsToJSON } from './translate-dimensions-to-json.js';

const SCHEMA_INDEX = createSchemaIndex(MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE);
const CONTEXT = {
  dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  schemaIndex: SCHEMA_INDEX,
};

/** A calculated dimension as it arrives in query JSON: a parsed compose-code function call. */
const CD_FUNCTION_CALL = {
  function: 'attributeFactory.customFormula',
  args: [
    'brand cat',
    'Concat([C1], " ", [C2])',
    { '[C1]': 'DM.Brand.Brand', '[C2]': 'DM.Category.Category' },
  ],
};

/** The JAQL a calculated attribute emits. `Attribute.jaql()` is untyped, so narrow it here. */
type CalculatedDimensionJaql = {
  jaql: { type: string; formula: string; context: Record<string, unknown> };
};

const jaqlOf = (attribute: Attribute): CalculatedDimensionJaql['jaql'] =>
  (attribute.jaql() as CalculatedDimensionJaql).jaql;

describe('calculated dimensions in the dimensions channel', () => {
  it('translates a calculated-dimension function call into a calculated attribute', () => {
    const result = translateDimensionsFromJSON({ data: [CD_FUNCTION_CALL], context: CONTEXT });

    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data).toHaveLength(1);

    const { attribute } = data[0];
    expect(MetadataTypes.isCalculatedAttribute(attribute)).toBe(true);
    expect(attribute.name).toBe('brand cat');
  });

  it('emits JAQL carrying type calculated_dimension with the formula and context intact', () => {
    const result = translateDimensionsFromJSON({ data: [CD_FUNCTION_CALL], context: CONTEXT });
    const { attribute } = getSuccessData(result)[0];

    const jaql = jaqlOf(attribute);
    expect(jaql.type).toBe('calculated_dimension');
    expect(jaql.formula).toBe('Concat([C1], " ", [C2])');
    expect(Object.keys(jaql.context)).toEqual(['[C1]', '[C2]']);
  });

  it('coexists with a plain named dimension, preserving order', () => {
    const result = translateDimensionsFromJSON({
      data: ['DM.Category.Category', CD_FUNCTION_CALL],
      context: CONTEXT,
    });

    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data).toHaveLength(2);
    expect(MetadataTypes.isCalculatedAttribute(data[0].attribute)).toBe(false);
    expect(MetadataTypes.isCalculatedAttribute(data[1].attribute)).toBe(true);
  });

  it('round-trips back to JSON as a function call, not a composeCode string', () => {
    const fromJson = translateDimensionsFromJSON({ data: [CD_FUNCTION_CALL], context: CONTEXT });
    const { attribute } = getSuccessData(fromJson)[0];

    const toJson = translateDimensionsToJSON([attribute]);
    expect(toJson.success).toBe(true);
    const [item] = getSuccessData(toJson);

    // A string here would be resolved as a dimension NAME on the way back in, so the emitted item
    // has to be a parsed call — same as measures.
    expect(typeof item).not.toBe('string');
    expect(item).toMatchObject({ function: 'attributeFactory.customFormula' });
  });

  it('survives a full JSON -> CSDK -> JSON -> CSDK round trip', () => {
    const first = translateDimensionsFromJSON({ data: [CD_FUNCTION_CALL], context: CONTEXT });
    const backToJson = translateDimensionsToJSON([getSuccessData(first)[0].attribute]);
    expect(backToJson.success).toBe(true);

    // Feeding the emitted JSON straight back in must yield the same calculated dimension.
    const second = translateDimensionsFromJSON({
      data: getSuccessData(backToJson),
      context: CONTEXT,
    });
    expect(second.success).toBe(true);
    const { attribute } = getSuccessData(second)[0];
    expect(MetadataTypes.isCalculatedAttribute(attribute)).toBe(true);
    expect(attribute.name).toBe('brand cat');

    const jaql = jaqlOf(attribute);
    expect(jaql.type).toBe('calculated_dimension');
    expect(jaql.formula).toBe('Concat([C1], " ", [C2])');
  });

  it('reports a clear error when the formula references a key missing from context', () => {
    const result = translateDimensionsFromJSON({
      data: [
        {
          function: 'attributeFactory.customFormula',
          args: ['bad', 'Concat([C1], [MISSING])', { '[C1]': 'DM.Category.Category' }],
        },
      ],
      context: CONTEXT,
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain('not found in context');
  });

  it('accepts a calculated dimension inside a styled column, keeping the style', () => {
    const result = translateDimensionsFromJSON({
      data: [{ column: CD_FUNCTION_CALL, sortType: 'sortDesc' }],
      context: CONTEXT,
    });

    expect(result.success).toBe(true);
    const [item] = getSuccessData(result);
    expect(MetadataTypes.isCalculatedAttribute(item.attribute)).toBe(true);
    expect(item.style).toEqual({ sortType: 'sortDesc' });
  });

  it('summarises a calculated dimension as a dimension, not a measure', () => {
    expect(getQueryElementSummary(CD_FUNCTION_CALL)).toEqual({
      name: 'brand cat',
      type: 'dimension',
    });
    expect(getQueryElementSummary({ column: CD_FUNCTION_CALL, sortType: 'sortAsc' })).toEqual({
      name: 'brand cat',
      type: 'dimension',
    });
  });
});
