import {
  createFilterFromJaql,
  type Filter,
  isMembersFilter,
  MetadataTypes,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../../__mocks__/mock-data-sources.js';
import { createSchemaIndex } from '../../shared/utils/schema-index.js';
import {
  getErrors,
  getSuccessData,
  stripDelimitersFromJson,
} from '../../shared/utils/translation-helpers.js';
import type { FunctionCall } from '../../types.js';
import { translateMeasuresFromJSON } from '../measures/translate-measures-from-json.js';
import { translateFiltersFromJSONFunctionCall } from './translate-filters-from-json.js';
import { translateFiltersToJSON } from './translate-filters-to-json.js';

const CONTEXT = {
  dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  schemaIndex: createSchemaIndex(MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE),
};

/** A members filter on a calculated dimension, as a dashboard stores it. */
const CD_MEMBERS_FILTER_JAQL = {
  type: 'calculated_dimension',
  formula: 'right([6F1B0-58F], 1)',
  context: {
    '[6F1B0-58F]': { dim: '[Commerce.Age Range]', datatype: 'text', title: 'Age Range' },
  },
  title: 'right([Age Range], 1)',
  datatype: 'text',
  filter: { explicit: true, multiSelection: true, members: ['4'] },
};

/** A filter on a shared formula: the CD wraps another formula that Fusion leaves untyped. */
const SHARED_CD_MEMBERS_FILTER_JAQL = {
  type: 'calculated_dimension',
  formula: '[05D77-477]',
  context: {
    '[05D77-477]': {
      formula: "CASE WHEN [9D294-64E] IN ('0-18', '19-24') THEN 'Young' ELSE 'Other' END",
      context: {
        '[9D294-64E]': { dim: '[Commerce.Age Range]', datatype: 'text', title: 'Age Range' },
      },
      title: 'Age Group',
    },
  },
  title: '[Age Group]',
  datatype: 'text',
  filter: { explicit: true, multiSelection: true, members: ['Young'] },
};

const toFilter = (jaql: object): Filter =>
  createFilterFromJaql(jaql as Parameters<typeof createFilterFromJaql>[0]);

const cdFilter = (): Filter => toFilter(CD_MEMBERS_FILTER_JAQL);

describe('filters on calculated dimensions', () => {
  it('emits the calculated dimension as a function call, not a serialized object', () => {
    const result = translateFiltersToJSON([cdFilter()]);

    expect(result.success).toBe(true);
    const [filterCall] = getSuccessData(result);
    expect(filterCall.function).toBe('filterFactory.members');
    expect(filterCall.args[0]).toMatchObject({ function: 'attributeFactory.customFormula' });
    expect(JSON.stringify(filterCall)).not.toContain('__serializable');
  });

  it('round-trips a calculated-dimension members filter back to CSDK', () => {
    const toJson = translateFiltersToJSON([cdFilter()]);
    const json = stripDelimitersFromJson(getSuccessData(toJson));

    const fromJson = translateFiltersFromJSONFunctionCall({ data: json, context: CONTEXT });

    expect(fromJson.success).toBe(true);
    const [filter] = getSuccessData(fromJson) as Filter[];
    expect(isMembersFilter(filter)).toBe(true);
    expect(MetadataTypes.isCalculatedAttribute(filter.attribute)).toBe(true);
    expect(filter.attribute.name).toBe('right([Age Range], 1)');

    const { jaql } = filter.jaql();
    expect(jaql.type).toBe('calculated_dimension');
    expect(jaql.formula).toBe('right([6F1B0-58F], 1)');
    expect(jaql.filter).toMatchObject({ members: ['4'] });
  });

  it('round-trips a filter on a shared formula as a nested calculated dimension', () => {
    const toJson = translateFiltersToJSON([toFilter(SHARED_CD_MEMBERS_FILTER_JAQL)]);
    const json = stripDelimitersFromJson(getSuccessData(toJson));

    const fromJson = translateFiltersFromJSONFunctionCall({ data: json, context: CONTEXT });

    expect(fromJson.success).toBe(true);
    const [filter] = getSuccessData(fromJson) as Filter[];
    const { jaql } = filter.jaql();
    // the engine needs the filter's datatype to resolve the formula
    expect(jaql.datatype).toBe('text');
    expect(jaql.context['[05D77-477]'].type).toBe('calculated_dimension');
    expect(jaql.filter).toMatchObject({ members: ['Young'] });
  });

  describe('data type of a numeric calculated dimension', () => {
    /** A numeric range filter on a calculated dimension that passes a numeric column through. */
    const NUMERIC_CD_BETWEEN_FILTER_JAQL = {
      type: 'calculated_dimension',
      formula: '[A1]',
      context: { '[A1]': { dim: '[Commerce.Cost]', datatype: 'numeric', title: 'Cost' } },
      title: 'Cost CD',
      datatype: 'numeric',
      filter: { from: 9, to: 12 },
    };

    const caseFilter = (dataTypeArg: string[]): FunctionCall => ({
      function: 'filterFactory.between',
      args: [
        {
          function: 'attributeFactory.customFormula',
          args: [
            'Cost Band',
            'CASE WHEN [A1] > 100 THEN 100 ELSE 5 END',
            { '[A1]': 'DM.Commerce.Cost' },
            ...dataTypeArg,
          ],
        },
        9,
        12,
      ],
    });

    const translatedDataType = (json: FunctionCall[]): unknown => {
      const fromJson = translateFiltersFromJSONFunctionCall({ data: json, context: CONTEXT });
      expect(fromJson.success).toBe(true);
      const [filter] = getSuccessData(fromJson) as Filter[];
      return filter.jaql().jaql.datatype;
    };

    it('keeps numeric through the round trip', () => {
      const toJson = translateFiltersToJSON([toFilter(NUMERIC_CD_BETWEEN_FILTER_JAQL)]);
      const json = stripDelimitersFromJson(getSuccessData(toJson));

      expect(translatedDataType(json)).toBe('numeric');
    });

    it('infers numeric when the data type is missing', () => {
      expect(translatedDataType([caseFilter([])])).toBe('numeric');
    });

    it('corrects a wrong data type from the formula', () => {
      expect(translatedDataType([caseFilter(['text'])])).toBe('numeric');
    });
  });

  describe('filter checks on calculated dimensions', () => {
    const cdCall = (formula: string, ctx: Record<string, string>, ...dataType: string[]) => ({
      function: 'attributeFactory.customFormula',
      args: ['CD', formula, ctx, ...dataType],
    });
    const textCd = cdCall("CASE WHEN [A] = '0-18' THEN 'Young' ELSE 'Other' END", {
      '[A]': 'DM.Commerce.Age Range',
    });
    const translate = (filter: FunctionCall) =>
      translateFiltersFromJSONFunctionCall({ data: [filter], context: CONTEXT });

    it('accepts text filters on a text calculated dimension', () => {
      const contains = translate({ function: 'filterFactory.contains', args: [textCd, 'Yo'] });
      const equals = translate({ function: 'filterFactory.equals', args: [textCd, 'Young'] });

      expect(contains.success).toBe(true);
      expect(equals.success).toBe(true);
    });

    it('rejects a numeric filter on a text calculated dimension', () => {
      const result = translate({ function: 'filterFactory.greaterThan', args: [textCd, 5] });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('must be numeric type, got text');
    });

    it('infers the type when context keys come without brackets', () => {
      const result = translate({
        function: 'filterFactory.greaterThan',
        args: [cdCall('[cost]', { cost: 'DM.Commerce.Cost' }), 5],
      });

      expect(result.success).toBe(true);
    });

    it('rejects an attribute argument that is an object but not a calculated dimension', () => {
      const result = translate({
        function: 'filterFactory.members',
        args: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Cost'] }, ['1']],
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Expected attribute string');
    });

    it('rejects aggregating a calculated dimension, which the engine cannot run', () => {
      const result = translateMeasuresFromJSON({
        data: [
          { function: 'measureFactory.sum', args: [cdCall('[c]', { '[c]': 'DM.Commerce.Cost' })] },
        ],
        context: CONTEXT,
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Cannot aggregate a calculated dimension');
    });

    it.each([
      ['min', []],
      ['max', []],
      ['count', []],
      ['countDistinct', []],
      ['aggregate', ['sum']],
    ])('rejects %s over a calculated dimension', (fn, extraArgs) => {
      const result = translateMeasuresFromJSON({
        data: [
          {
            function: `measureFactory.${fn}`,
            args: [cdCall('[c]', { '[c]': 'DM.Commerce.Cost' }), ...extraArgs],
          },
        ],
        context: CONTEXT,
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Cannot aggregate a calculated dimension');
    });
  });
});
