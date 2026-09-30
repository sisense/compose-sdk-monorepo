/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { TranslatableError } from '../../translation/translatable-error.js';
import { DimensionalAttribute, DimensionalLevelAttribute } from '../attributes/attributes.js';
import { createDateDimension, createDimension } from '../dimensions/dimensions.js';
import { AggregationType, AggregationTypes, DateLevels, Sort } from '../types.js';
import * as measureFactory from './factory.js';
import {
  createMeasure,
  DimensionalBaseMeasure,
  DimensionalCalculatedMeasure,
  DimensionalMeasureTemplate,
  getDateMeasureAggregation,
  getDateMeasureAttribute,
  hasDateMeasureLevel,
  isDateMeasure,
  isDimensionalBaseMeasure,
  isDimensionalCalculatedMeasure,
  isDimensionalMeasureTemplate,
} from './measures.js';

// Test data setup with proper typing
const createTestAttribute = (
  name = 'Cost',
  expression = '[Commerce.Cost]',
  type = 'numeric-attribute',
) => new DimensionalAttribute(name, expression, type);

const createTestBaseMeasure = (
  name = 'Total Cost',
  attribute = createTestAttribute(),
  aggregation: AggregationType = AggregationTypes.Sum,
  format?: string,
  sort = Sort.None,
) => new DimensionalBaseMeasure(name, attribute, aggregation, format, undefined, sort);

const createTestCalculatedMeasure = (
  name = 'Calculated',
  expression = '[M1] + [M2]',
  context: Record<string, any> = {},
  format?: string,
  sort = Sort.None,
) => new DimensionalCalculatedMeasure(name, expression, context, format, undefined, sort);
describe('measures', () => {
  describe('DimensionalBaseMeasure', () => {
    describe('constructor and basic properties', () => {
      it('should create a base measure with required parameters', () => {
        const attribute = createTestAttribute();
        const measure = new DimensionalBaseMeasure('Test Measure', attribute, AggregationTypes.Sum);

        expect(measure.name).toBe('Test Measure');
        expect(measure.attribute).toBe(attribute);
        expect(measure.aggregation).toBe(AggregationTypes.Sum);
        expect(measure.getSort()).toBe(Sort.None);
        expect(measure.getFormat()).toBeUndefined();
      });

      it('should create a base measure with all optional parameters', () => {
        const attribute = createTestAttribute();
        const measure = new DimensionalBaseMeasure(
          'Formatted Measure',
          attribute,
          AggregationTypes.Average,
          '0.00%',
          'Description',
          Sort.Ascending,
          { title: 'test' },
          'composeCode',
        );

        expect(measure.name).toBe('Formatted Measure');
        expect(measure.aggregation).toBe(AggregationTypes.Average);
        expect(measure.getFormat()).toBe('0.00%');
        expect(measure.getSort()).toBe(Sort.Ascending);
        expect(measure.description).toBe('Description');
        expect(measure.composeCode).toBe('composeCode');
      });
    });

    describe('aggregation conversion methods', () => {
      const aggregationMappings = [
        ['sum', AggregationTypes.Sum],
        ['avg', AggregationTypes.Average],
        ['min', AggregationTypes.Min],
        ['max', AggregationTypes.Max],
        ['countduplicates', AggregationTypes.Count],
        ['count', AggregationTypes.CountDistinct],
        ['median', AggregationTypes.Median],
        ['var', AggregationTypes.Variance],
        ['stdev', AggregationTypes.StandardDeviation],
      ];

      describe('aggregationFromJAQL', () => {
        it.each(aggregationMappings)(
          'should convert JAQL aggregation "%s" to SDK aggregation "%s"',
          (jaqlAgg, sdkAgg) => {
            expect(DimensionalBaseMeasure.aggregationFromJAQL(jaqlAgg)).toBe(sdkAgg);
          },
        );

        it('should return Sum as default for unknown aggregation types', () => {
          expect(DimensionalBaseMeasure.aggregationFromJAQL('unknown')).toBe(AggregationTypes.Sum);
          expect(DimensionalBaseMeasure.aggregationFromJAQL('')).toBe(AggregationTypes.Sum);
        });
      });

      describe('aggregationToJAQL', () => {
        it.each(aggregationMappings)(
          'should convert SDK aggregation "%s" to JAQL aggregation "%s"',
          (jaqlAgg, sdkAgg) => {
            expect(DimensionalBaseMeasure.aggregationToJAQL(sdkAgg)).toBe(jaqlAgg);
          },
        );

        it('should return "sum" as default for unknown aggregation types', () => {
          expect(DimensionalBaseMeasure.aggregationToJAQL('unknown')).toBe('sum');
          expect(DimensionalBaseMeasure.aggregationToJAQL('')).toBe('sum');
        });
      });
    });

    describe('id property', () => {
      it('should generate correct ID from attribute expression and aggregation', () => {
        const attribute = createTestAttribute('Revenue', '[Commerce.Revenue]');
        const measure = createTestBaseMeasure('Total Revenue', attribute, AggregationTypes.Sum);

        expect(measure.id).toBe('[Commerce.Revenue]_sum');
      });

      it('should handle complex attribute expressions', () => {
        const attribute = createTestAttribute('Complex', '[Table.Column With Spaces]');
        const measure = createTestBaseMeasure(
          'Complex Measure',
          attribute,
          AggregationTypes.Average,
        );

        expect(measure.id).toBe('[Table.Column With Spaces]_avg');
      });
    });

    describe('sorting functionality', () => {
      it('should create a new sorted instance without modifying original', () => {
        const original = createTestBaseMeasure();
        const sorted = original.sort(Sort.Descending);

        expect(original.getSort()).toBe(Sort.None);
        expect(sorted.getSort()).toBe(Sort.Descending);
        expect(sorted).not.toBe(original);
        expect(sorted.name).toBe(original.name);
        expect((sorted as DimensionalBaseMeasure).aggregation).toBe(original.aggregation);
      });

      it('should preserve all properties when sorting', () => {
        const original = new DimensionalBaseMeasure(
          'Test',
          createTestAttribute(),
          AggregationTypes.Max,
          '0.00',
          'desc',
          Sort.None,
          { title: 'ds' },
          'code',
        );
        const sorted = original.sort(Sort.Ascending);

        expect(sorted.getFormat()).toBe('0.00');
        expect(sorted.description).toBe('desc');
        expect(sorted.composeCode).toBe('code');
      });
    });

    describe('formatting functionality', () => {
      it('should create a new formatted instance without modifying original', () => {
        const original = createTestBaseMeasure();
        const formatted = original.format('$0,0.00');

        expect(original.getFormat()).toBeUndefined();
        expect(formatted.getFormat()).toBe('$0,0.00');
        expect(formatted).not.toBe(original);
      });

      it('should preserve all properties when formatting', () => {
        const original = new DimensionalBaseMeasure(
          'Test',
          createTestAttribute(),
          AggregationTypes.Count,
          undefined,
          'desc',
          Sort.Ascending,
          { title: 'ds' },
          'code',
        );
        const formatted = original.format('0,0');

        expect(formatted.getSort()).toBe(Sort.Ascending);
        expect(formatted.description).toBe('desc');
        expect(formatted.composeCode).toBe('code');
      });
    });

    describe('serialization', () => {
      it('should serialize with all required properties', () => {
        const attribute = createTestAttribute();
        const measure = createTestBaseMeasure(
          'Serialized Measure',
          attribute,
          AggregationTypes.Sum,
        );
        const serialized = measure.serialize();

        expect(serialized.__serializable).toBe('DimensionalBaseMeasure');
        expect(serialized.aggregation).toBe(AggregationTypes.Sum);
        expect(serialized.attribute).toEqual(attribute.serialize());
        expect(serialized.name).toBe('Serialized Measure');
      });

      it('should include format and sort in serialization when present', () => {
        const measure = new DimensionalBaseMeasure(
          'Test',
          createTestAttribute(),
          AggregationTypes.Average,
          '0.00%',
          'desc',
          Sort.Descending,
        );
        const serialized = measure.serialize();

        expect(serialized.format).toBe('0.00%');
        expect(serialized.sort).toBe(Sort.Descending);
      });
    });

    describe('JAQL generation', () => {
      it('should generate correct JAQL for simple measure', () => {
        const attribute = createTestAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute');
        const measure = createTestBaseMeasure('Total Cost', attribute, AggregationTypes.Sum);
        const jaql = measure.jaql();

        expect(jaql).toEqual({
          jaql: {
            title: 'Total Cost',
            agg: 'sum',
            dim: '[Commerce.Cost]',
            datatype: 'numeric',
          },
        });
      });

      it('should include format in JAQL when present', () => {
        const measure = createTestBaseMeasure(
          'Formatted',
          undefined,
          AggregationTypes.Sum,
          '$0,0.00',
        );
        const jaql = measure.jaql();

        expect(jaql.format).toEqual({ number: '$0,0.00' });
      });

      it('should include sort in JAQL when not None', () => {
        const ascendingMeasure = createTestBaseMeasure(
          'Asc',
          undefined,
          AggregationTypes.Sum,
          undefined,
          Sort.Ascending,
        );
        const descendingMeasure = createTestBaseMeasure(
          'Desc',
          undefined,
          AggregationTypes.Sum,
          undefined,
          Sort.Descending,
        );

        expect(ascendingMeasure.jaql().jaql.sort).toBe('asc');
        expect(descendingMeasure.jaql().jaql.sort).toBe('desc');
      });

      it('should return nested JAQL when requested', () => {
        const measure = createTestBaseMeasure();
        const nestedJaql = measure.jaql(true);

        expect(nestedJaql.title).toBeDefined();
        expect(nestedJaql.agg).toBeDefined();
        expect(nestedJaql.dim).toBeDefined();
      });

      it('should use name (not title) for JAQL title when they differ', () => {
        const attribute = createTestAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute');
        const measure = new DimensionalBaseMeasure(
          'Total Cost',
          attribute,
          AggregationTypes.Sum,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          'Some Other Title',
        );

        expect(measure.title).toBe('Some Other Title');
        expect(measure.jaql().jaql.title).toBe('Total Cost');
      });
    });
  });

  describe('DimensionalCalculatedMeasure', () => {
    describe('constructor and basic properties', () => {
      it('should create calculated measure with required parameters', () => {
        const context = { '[M1]': createTestBaseMeasure() };
        const measure = new DimensionalCalculatedMeasure('Calc', '[M1] * 2', context);

        expect(measure.name).toBe('Calc');
        expect(measure.expression).toBe('[M1] * 2');
        expect(measure.context).toBe(context);
      });

      it('should create calculated measure with all optional parameters', () => {
        const context = { '[M1]': createTestBaseMeasure() };
        const measure = new DimensionalCalculatedMeasure(
          'Complex Calc',
          'SUM([M1])',
          context,
          '0.00%',
          'description',
          Sort.Ascending,
          { title: 'ds' },
          'code',
        );

        expect(measure.getFormat()).toBe('0.00%');
        expect(measure.description).toBe('description');
        expect(measure.getSort()).toBe(Sort.Ascending);
        expect(measure.composeCode).toBe('code');
      });
    });

    describe('id property', () => {
      it('should use expression as ID', () => {
        const measure = createTestCalculatedMeasure('Test', 'SUM([Revenue])');
        expect(measure.id).toBe('SUM([Revenue])');
      });
    });

    describe('sorting and formatting', () => {
      it('should create new sorted instance preserving all properties', () => {
        const context = { '[M1]': createTestBaseMeasure() };
        const original = new DimensionalCalculatedMeasure(
          'Original',
          '[M1] + 100',
          context,
          '0.00',
          'desc',
          Sort.None,
          { title: 'ds' },
          'code',
        );
        const sorted = original.sort(Sort.Descending);

        expect(sorted.getSort()).toBe(Sort.Descending);
        expect((sorted as DimensionalCalculatedMeasure).expression).toBe(original.expression);
        expect((sorted as DimensionalCalculatedMeasure).context).toBe(original.context);
        expect(sorted.getFormat()).toBe('0.00');
        expect(sorted.composeCode).toBe('code');
      });

      it('should create new formatted instance preserving all properties', () => {
        const context = { '[M1]': createTestBaseMeasure() };
        const original = createTestCalculatedMeasure('Test', '[M1] * 2', context);
        const formatted = original.format('$0,0.00');

        expect(formatted.getFormat()).toBe('$0,0.00');
        expect((formatted as DimensionalCalculatedMeasure).expression).toBe(original.expression);
        expect((formatted as DimensionalCalculatedMeasure).context).toBe(original.context);
      });
    });

    describe('serialization', () => {
      it('should serialize with context serialization', () => {
        const baseMeasure = createTestBaseMeasure();
        const context = { '[M1]': baseMeasure };
        const measure = createTestCalculatedMeasure('Test', '[M1] + 10', context);
        const serialized = measure.serialize();

        expect(serialized.__serializable).toBe('DimensionalCalculatedMeasure');
        expect(serialized.expression).toBe('[M1] + 10');
        expect((serialized.context as Record<string, unknown>)?.['[M1]']).toEqual(
          baseMeasure.serialize(),
        );
      });

      it('should handle context items without serialize method', () => {
        const context = { '[M1]': { value: 42 } };
        const measure = createTestCalculatedMeasure('Test', '[M1]', context);
        const serialized = measure.serialize();

        expect((serialized.context as Record<string, unknown>)?.['[M1]']).toEqual({ value: 42 });
      });
    });

    describe('JAQL generation', () => {
      it('should generate correct JAQL for calculated measure', () => {
        const baseMeasure = createTestBaseMeasure(
          'Revenue',
          createTestAttribute('Revenue', '[Commerce.Revenue]'),
          AggregationTypes.Sum,
        );
        const context = { '[M1]': baseMeasure };
        const measure = createTestCalculatedMeasure('Profit Margin', '[M1] * 0.1', context);
        const jaql = measure.jaql();

        expect(jaql.jaql.title).toBe('Profit Margin');
        expect(jaql.jaql.formula).toBe('[M1] * 0.1');
        expect(jaql.jaql.context?.['[M1]']).toEqual(baseMeasure.jaql(true));
      });

      it('should use name (not title) for JAQL title when they differ', () => {
        const context = { '[M1]': createTestBaseMeasure() };
        const measure = new DimensionalCalculatedMeasure(
          'Profit Margin',
          '[M1] * 0.1',
          context,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          'Some Other Title',
        );

        expect(measure.title).toBe('Some Other Title');
        expect(measure.jaql().jaql.title).toBe('Profit Margin');
      });

      it('should include format and sort in JAQL when present', () => {
        const context = { '[M1]': createTestBaseMeasure() };
        const measure = new DimensionalCalculatedMeasure(
          'Test',
          '[M1]',
          context,
          '0.00%',
          undefined,
          Sort.Ascending,
        );
        const jaql = measure.jaql();

        expect(jaql.format).toEqual({ number: '0.00%' });
        expect(jaql.jaql.sort).toBe('asc');
      });

      it('should handle empty context', () => {
        const measure = createTestCalculatedMeasure('Constant', '42', {});
        const jaql = measure.jaql();

        expect(jaql.jaql.context).toEqual({});
        expect(jaql.jaql.formula).toBe('42');
      });
    });
  });

  describe('DimensionalMeasureTemplate', () => {
    describe('constructor and basic properties', () => {
      it('should create measure template with required parameters', () => {
        const attribute = createTestAttribute();
        const template = new DimensionalMeasureTemplate('Template', attribute);

        expect(template.name).toBe('Template');
        expect(template.attribute).toBe(attribute);
      });

      it('should create measure template with all optional parameters', () => {
        const attribute = createTestAttribute();
        const template = new DimensionalMeasureTemplate(
          'Full Template',
          attribute,
          '0.00',
          'description',
          Sort.Descending,
          { title: 'ds' },
          'code',
        );

        expect(template.getFormat()).toBe('0.00');
        expect(template.description).toBe('description');
        expect(template.getSort()).toBe(Sort.Descending);
        expect(template.composeCode).toBe('code');
      });
    });

    describe('id property', () => {
      it('should generate ID with wildcard aggregation', () => {
        const attribute = createTestAttribute('Revenue', '[Commerce.Revenue]');
        const template = new DimensionalMeasureTemplate('Template', attribute);

        expect(template.id).toBe('[Commerce.Revenue]_*');
      });
    });

    describe('sorting and formatting', () => {
      it('should create new sorted template preserving properties', () => {
        const original = new DimensionalMeasureTemplate(
          'Original',
          createTestAttribute(),
          '0.00',
          'desc',
          Sort.None,
          { title: 'ds' },
          'code',
        );
        const sorted = original.sort(Sort.Ascending);

        expect(sorted.getSort()).toBe(Sort.Ascending);
        expect((sorted as DimensionalMeasureTemplate).attribute).toBe(original.attribute);
        expect(sorted.getFormat()).toBe('0.00');
        expect(sorted.composeCode).toBe('code');
      });

      it('should create new formatted template preserving properties', () => {
        const original = new DimensionalMeasureTemplate('Test', createTestAttribute());
        const formatted = original.format('$0,0.00');

        expect(formatted.getFormat()).toBe('$0,0.00');
        expect((formatted as DimensionalMeasureTemplate).attribute).toBe(original.attribute);
      });
    });

    describe('serialization', () => {
      it('should serialize with attribute serialization', () => {
        const attribute = createTestAttribute();
        const template = new DimensionalMeasureTemplate('Test Template', attribute);
        const serialized = template.serialize();

        expect(serialized.__serializable).toBe('DimensionalMeasureTemplate');
        expect(serialized.attribute).toEqual(attribute.serialize());
        expect(serialized.name).toBe('Test Template');
      });
    });

    describe('aggregation methods', () => {
      let template: DimensionalMeasureTemplate;

      beforeEach(() => {
        template = new DimensionalMeasureTemplate(
          'Test Template',
          createTestAttribute(),
          undefined,
          undefined,
          Sort.Ascending,
        );
      });

      it('should create sum measure with preserved sort', () => {
        const sumMeasure = template.sum('$0,0.00');
        expect(sumMeasure.getSort()).toBe(Sort.Ascending);
      });

      it('should create average measure with preserved sort', () => {
        const avgMeasure = template.average('0.00%');
        expect(avgMeasure.getSort()).toBe(Sort.Ascending);
      });

      it('should create median measure with preserved sort', () => {
        const medianMeasure = template.median();
        expect(medianMeasure.getSort()).toBe(Sort.Ascending);
      });

      it('should create min measure with preserved sort', () => {
        const minMeasure = template.min();
        expect(minMeasure.getSort()).toBe(Sort.Ascending);
      });

      it('should create max measure with preserved sort', () => {
        const maxMeasure = template.max();
        expect(maxMeasure.getSort()).toBe(Sort.Ascending);
      });

      it('should create count measure with preserved sort', () => {
        const countMeasure = template.count();
        expect(countMeasure.getSort()).toBe(Sort.Ascending);
      });

      it('should create countDistinct measure with preserved sort', () => {
        const countDistinctMeasure = template.countDistinct();
        expect(countDistinctMeasure.getSort()).toBe(Sort.Ascending);
      });
    });

    describe('JAQL generation', () => {
      it('should generate JAQL using sum aggregation by default', () => {
        const attribute = createTestAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute');
        const template = new DimensionalMeasureTemplate('Template', attribute);
        const jaql = template.jaql();

        expect(jaql.jaql.title).toBe('sum Cost');
        expect(jaql.jaql.agg).toBe('sum');
        expect(jaql.jaql.dim).toBe('[Commerce.Cost]');
      });
    });
  });

  describe('AbstractMeasure', () => {
    describe('getSort and getFormat', () => {
      it('should return default values for new measures', () => {
        const measure = createTestBaseMeasure();
        expect(measure.getSort()).toBe(Sort.None);
        expect(measure.getFormat()).toBeUndefined();
      });
    });

    describe('serialize method', () => {
      it('should include format when defined', () => {
        const measure = createTestBaseMeasure('Test', undefined, AggregationTypes.Sum, '0.00%');
        const serialized = measure.serialize();
        expect(serialized.format).toBe('0.00%');
      });

      it('should not include format when undefined', () => {
        const measure = new DimensionalBaseMeasure(
          'Test',
          createTestAttribute(),
          AggregationTypes.Sum,
          undefined,
        );
        const serialized = measure.serialize();
        expect(serialized.format).toBeUndefined();
      });

      it('should include sort when not None', () => {
        const measure = createTestBaseMeasure(
          'Test',
          undefined,
          AggregationTypes.Sum,
          undefined,
          Sort.Ascending,
        );
        const serialized = measure.serialize();
        expect(serialized.sort).toBe(Sort.Ascending);
      });
    });
  });

  describe('createMeasure function', () => {
    describe('BaseMeasure creation', () => {
      it('should create BaseMeasure from valid JSON with attribute', () => {
        const json = {
          name: 'Total Revenue',
          agg: 'sum',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalBaseMeasure);
        expect(measure.name).toBe('Total Revenue');
        expect((measure as DimensionalBaseMeasure).aggregation).toBe('sum');
      });

      it('should create BaseMeasure from legacy JSON with dim', () => {
        const json = {
          title: 'Legacy Measure',
          agg: 'avg', // Use 'agg' instead of 'aggregation' for legacy compatibility
          dim: '[Legacy.Column]',
          // Add jaql property to make it detectable as BaseMeasure
          jaql: { dim: '[Legacy.Column]' },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalBaseMeasure);
        expect(measure.name).toBe('Legacy Measure');
        expect((measure as DimensionalBaseMeasure).aggregation).toBe('avg');
      });

      it('should create BaseMeasure from legacy JSON with expression', () => {
        const json = {
          title: 'Expression Measure',
          agg: 'sum',
          expression: '[Commerce.Revenue]',
          // Add jaql property to make it detectable as BaseMeasure
          jaql: { dim: '[Commerce.Revenue]' },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalBaseMeasure);
        expect(measure.name).toBe('Expression Measure');
        expect((measure as DimensionalBaseMeasure).aggregation).toBe('sum');
      });

      it('should create BaseMeasure without sort parameter', () => {
        const json = {
          name: 'No Sort Measure',
          agg: 'sum',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalBaseMeasure);
        expect(measure.name).toBe('No Sort Measure');
        expect(measure.getSort()).toBe(Sort.None);
      });

      it('should throw error when BaseMeasure has no attribute', () => {
        const json = {
          name: 'Invalid Measure',
          agg: 'sum',
        };

        expect(() => createMeasure(json)).toThrow(TranslatableError);
      });

      it('should throw error when BaseMeasure has no aggregation', () => {
        const json = {
          name: 'Invalid Measure',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        expect(() => createMeasure(json)).toThrow(TranslatableError);
      });
    });

    describe('CalculatedMeasure creation', () => {
      it('should create CalculatedMeasure from valid JSON', () => {
        const json = {
          name: 'Calculated Revenue',
          formula: '[M1] + [M2]',
          context: {
            '[M1]': {
              name: 'Revenue',
              agg: 'sum',
              attribute: {
                name: 'Revenue',
                expression: '[Commerce.Revenue]',
                type: 'numeric-attribute',
              },
            },
            '[M2]': {
              name: 'Cost',
              agg: 'sum',
              attribute: {
                name: 'Cost',
                expression: '[Commerce.Cost]',
                type: 'numeric-attribute',
              },
            },
          },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalCalculatedMeasure);
        expect(measure.name).toBe('Calculated Revenue');
        expect((measure as DimensionalCalculatedMeasure).expression).toBe('[M1] + [M2]');
      });

      it('should throw error when CalculatedMeasure has no context', () => {
        const json = {
          name: 'Invalid Calculated',
          formula: '[M1] + [M2]',
        };

        expect(() => createMeasure(json)).toThrow(TranslatableError);
      });

      it('should handle expression property instead of formula', () => {
        const json = {
          name: 'Expression Measure',
          expression: 'SUM([Revenue])',
          context: {},
        };

        const measure = createMeasure(json);
        expect((measure as DimensionalCalculatedMeasure).expression).toBe('SUM([Revenue])');
      });
    });

    describe('MeasureTemplate creation', () => {
      it('should create MeasureTemplate from valid JSON', () => {
        const json = {
          name: 'Revenue Template',
          agg: '*',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalMeasureTemplate);
        expect(measure.name).toBe('Revenue Template');
      });

      it('should create MeasureTemplate without sort parameter', () => {
        const json = {
          name: 'Template No Sort',
          agg: '*',
          format: '0.00',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalMeasureTemplate);
        expect(measure.name).toBe('Template No Sort');
        expect(measure.getFormat()).toBe('0.00');
        expect(measure.getSort()).toBe(Sort.None);
      });

      it('should throw error when MeasureTemplate has no attribute', () => {
        const json = {
          name: 'Invalid Template',
          agg: '*',
        };

        expect(() => createMeasure(json)).toThrow(TranslatableError);
      });
    });

    describe('error handling', () => {
      it('should throw error for unsupported measure type', () => {
        const json = {
          name: 'Unknown Type',
          type: 'unknown',
        };

        expect(() => createMeasure(json)).toThrow(TranslatableError);
      });

      it('should handle missing name/title gracefully', () => {
        const json = {
          agg: 'sum',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure.name).toBe('');
        expect(measure.title).toBe('');
      });
    });

    describe('property handling', () => {
      it('should handle format property', () => {
        const json = {
          name: 'Formatted Measure',
          agg: 'sum',
          format: '$0,0.00',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure.getFormat()).toBe('$0,0.00');
      });

      it('should handle sort property', () => {
        const json = {
          name: 'Sorted Measure',
          agg: 'sum',
          sort: Sort.Ascending,
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        // Note: createMeasure doesn't pass sort to DimensionalBaseMeasure constructor
        expect(measure.getSort()).toBe(Sort.Ascending);
      });

      it('should handle description property', () => {
        const json = {
          name: 'Described Measure',
          description: 'A test measure',
          agg: 'sum',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure.description).toBe('A test measure');
      });
    });
  });

  describe('Edge cases and error conditions', () => {
    describe('Type Guard Functions', () => {
      describe('isDimensionalBaseMeasure', () => {
        it('should return true for valid DimensionalBaseMeasure instances', () => {
          const measure = createTestBaseMeasure();
          expect(isDimensionalBaseMeasure(measure)).toBe(true);
        });

        it('should return false for DimensionalCalculatedMeasure instances', () => {
          const measure = createTestCalculatedMeasure();
          expect(isDimensionalBaseMeasure(measure)).toBe(false);
        });

        it('should return false for DimensionalMeasureTemplate instances', () => {
          const template = new DimensionalMeasureTemplate('Template', createTestAttribute());
          expect(isDimensionalBaseMeasure(template)).toBe(false);
        });

        it('should return false for null and undefined', () => {
          expect(isDimensionalBaseMeasure(null as any)).toBe(false);
          expect(isDimensionalBaseMeasure(undefined as any)).toBe(false);
        });

        it('should return false for plain objects', () => {
          const plainObject = { name: 'test', __serializable: 'SomethingElse' };
          expect(isDimensionalBaseMeasure(plainObject)).toBe(false);
        });

        it('should return false for objects without __serializable property', () => {
          const objectWithoutSerializable = { name: 'test', aggregation: 'sum' };
          expect(isDimensionalBaseMeasure(objectWithoutSerializable)).toBe(false);
        });

        it('should return false for objects with wrong __serializable value', () => {
          const wrongSerializable = { __serializable: 'DimensionalCalculatedMeasure' };
          expect(isDimensionalBaseMeasure(wrongSerializable)).toBe(false);
        });
      });

      describe('isDimensionalCalculatedMeasure', () => {
        it('should return true for valid DimensionalCalculatedMeasure instances', () => {
          const measure = createTestCalculatedMeasure();
          expect(isDimensionalCalculatedMeasure(measure)).toBe(true);
        });

        it('should return false for DimensionalBaseMeasure instances', () => {
          const measure = createTestBaseMeasure();
          expect(isDimensionalCalculatedMeasure(measure)).toBe(false);
        });

        it('should return false for DimensionalMeasureTemplate instances', () => {
          const template = new DimensionalMeasureTemplate('Template', createTestAttribute());
          expect(isDimensionalCalculatedMeasure(template)).toBe(false);
        });

        it('should return false for null and undefined', () => {
          expect(isDimensionalCalculatedMeasure(null as any)).toBe(false);
          expect(isDimensionalCalculatedMeasure(undefined as any)).toBe(false);
        });

        it('should return false for plain objects', () => {
          const plainObject = { name: 'test', __serializable: 'SomethingElse' };
          expect(isDimensionalCalculatedMeasure(plainObject)).toBe(false);
        });

        it('should return false for objects without __serializable property', () => {
          const objectWithoutSerializable = { name: 'test', expression: '[M1] + [M2]' };
          expect(isDimensionalCalculatedMeasure(objectWithoutSerializable)).toBe(false);
        });

        it('should return false for objects with wrong __serializable value', () => {
          const wrongSerializable = { __serializable: 'DimensionalBaseMeasure' };
          expect(isDimensionalCalculatedMeasure(wrongSerializable)).toBe(false);
        });
      });

      describe('isDimensionalMeasureTemplate', () => {
        it('should return true for valid DimensionalMeasureTemplate instances', () => {
          const template = new DimensionalMeasureTemplate('Template', createTestAttribute());
          expect(isDimensionalMeasureTemplate(template)).toBe(true);
        });

        it('should return false for DimensionalBaseMeasure instances', () => {
          const measure = createTestBaseMeasure();
          expect(isDimensionalMeasureTemplate(measure)).toBe(false);
        });

        it('should return false for DimensionalCalculatedMeasure instances', () => {
          const measure = createTestCalculatedMeasure();
          expect(isDimensionalMeasureTemplate(measure)).toBe(false);
        });

        it('should return false for null and undefined', () => {
          expect(isDimensionalMeasureTemplate(null as any)).toBe(false);
          expect(isDimensionalMeasureTemplate(undefined as any)).toBe(false);
        });

        it('should return false for plain objects', () => {
          const plainObject = { name: 'test', __serializable: 'SomethingElse' };
          expect(isDimensionalMeasureTemplate(plainObject)).toBe(false);
        });

        it('should return false for objects without __serializable property', () => {
          const objectWithoutSerializable = { name: 'test', attribute: {} };
          expect(isDimensionalMeasureTemplate(objectWithoutSerializable)).toBe(false);
        });

        it('should return false for objects with wrong __serializable value', () => {
          const wrongSerializable = { __serializable: 'DimensionalBaseMeasure' };
          expect(isDimensionalMeasureTemplate(wrongSerializable)).toBe(false);
        });
      });

      describe('Type Guard Functions - Complex scenarios', () => {
        it('should handle objects that look like measures but are not', () => {
          const fakeMeasure = {
            name: 'Fake',
            aggregation: 'sum',
            attribute: createTestAttribute(),
            __serializable: 'FakeMeasure',
          };

          expect(isDimensionalBaseMeasure(fakeMeasure)).toBe(false);
          expect(isDimensionalCalculatedMeasure(fakeMeasure)).toBe(false);
          expect(isDimensionalMeasureTemplate(fakeMeasure)).toBe(false);
        });

        it('should work correctly with instances created through factory', () => {
          const baseMeasureJson = {
            name: 'Factory Base',
            agg: 'sum',
            attribute: {
              name: 'Revenue',
              expression: '[Commerce.Revenue]',
              type: 'numeric-attribute',
            },
          };

          const calculatedMeasureJson = {
            name: 'Factory Calculated',
            formula: '[M1] + [M2]',
            context: {
              '[M1]': baseMeasureJson,
              '[M2]': baseMeasureJson,
            },
          };

          const templateJson = {
            name: 'Factory Template',
            agg: '*',
            attribute: {
              name: 'Revenue',
              expression: '[Commerce.Revenue]',
              type: 'numeric-attribute',
            },
          };

          const baseMeasure = createMeasure(baseMeasureJson);
          const calculatedMeasure = createMeasure(calculatedMeasureJson);
          const template = createMeasure(templateJson);

          expect(isDimensionalBaseMeasure(baseMeasure)).toBe(true);
          expect(isDimensionalCalculatedMeasure(calculatedMeasure)).toBe(true);
          expect(isDimensionalMeasureTemplate(template)).toBe(true);

          // Cross-checks
          expect(isDimensionalBaseMeasure(calculatedMeasure)).toBe(false);
          expect(isDimensionalBaseMeasure(template)).toBe(false);
          expect(isDimensionalCalculatedMeasure(baseMeasure)).toBe(false);
          expect(isDimensionalCalculatedMeasure(template)).toBe(false);
          expect(isDimensionalMeasureTemplate(baseMeasure)).toBe(false);
          expect(isDimensionalMeasureTemplate(calculatedMeasure)).toBe(false);
        });

        it('should handle serialized and deserialized measures', () => {
          const original = createTestBaseMeasure();
          const serialized = original.serialize();

          // The serialized object should be recognized as having the correct __serializable property
          expect(isDimensionalBaseMeasure(serialized)).toBe(true);

          // But a measure created from the serialized data should also be recognized
          const recreated = createMeasure({
            ...serialized,
            agg: original.aggregation,
            attribute: original.attribute,
          });
          expect(isDimensionalBaseMeasure(recreated)).toBe(true);
        });

        it('should handle measures with all optional properties', () => {
          const fullBaseMeasure = new DimensionalBaseMeasure(
            'Full Measure',
            createTestAttribute(),
            AggregationTypes.Sum,
            '$0,0.00',
            'Description',
            Sort.Ascending,
            { title: 'DataSource' },
            'compose.code',
          );

          const fullCalculatedMeasure = new DimensionalCalculatedMeasure(
            'Full Calculated',
            '[M1] * 2',
            { '[M1]': fullBaseMeasure },
            '0.00%',
            'Calculated Description',
            Sort.Descending,
            { title: 'DataSource' },
            'calc.code',
          );

          const fullTemplate = new DimensionalMeasureTemplate(
            'Full Template',
            createTestAttribute(),
            '0.00',
            'Template Description',
            Sort.Ascending,
            { title: 'DataSource' },
            'template.code',
          );

          expect(isDimensionalBaseMeasure(fullBaseMeasure)).toBe(true);
          expect(isDimensionalCalculatedMeasure(fullCalculatedMeasure)).toBe(true);
          expect(isDimensionalMeasureTemplate(fullTemplate)).toBe(true);
        });
      });
    });

    describe('null and undefined handling', () => {
      it('should handle undefined format gracefully', () => {
        const measure = new DimensionalBaseMeasure(
          'Test',
          createTestAttribute(),
          AggregationTypes.Sum,
          undefined,
        );
        expect(measure.getFormat()).toBeUndefined();
      });

      it('should handle empty context in calculated measures', () => {
        const measure = new DimensionalCalculatedMeasure('Empty Context', '42', {});
        expect(Object.keys(measure.context)).toHaveLength(0);
      });
    });

    describe('complex expressions and contexts', () => {
      it('should handle complex formula expressions', () => {
        const context = {
          '[M1]': createTestBaseMeasure('Revenue', undefined, AggregationTypes.Sum),
          '[M2]': createTestBaseMeasure('Cost', undefined, AggregationTypes.Sum),
        };
        const measure = createTestCalculatedMeasure(
          'Profit',
          '([M1] - [M2]) / [M1] * 100',
          context,
        );

        expect(measure.expression).toBe('([M1] - [M2]) / [M1] * 100');
        expect(Object.keys(measure.context)).toHaveLength(2);
      });

      it('should handle nested calculated measures in context', () => {
        const baseMeasure = createTestBaseMeasure();
        const nestedCalculated = createTestCalculatedMeasure('Nested', '[M1] * 2', {
          '[M1]': baseMeasure,
        });
        const context = { '[M2]': nestedCalculated };
        const measure = createTestCalculatedMeasure('Complex', '[M2] + 10', context);

        expect(measure.context['[M2]']).toBe(nestedCalculated);
      });
    });

    describe('JAQL edge cases', () => {
      it('should handle nested JAQL generation correctly', () => {
        const measure = createTestBaseMeasure();
        const nestedJaql = measure.jaql(true);
        const rootJaql = measure.jaql(false);

        expect(nestedJaql).not.toHaveProperty('format');
        expect(rootJaql).toHaveProperty('jaql');
      });

      it('should handle measures without format in JAQL', () => {
        const measure = createTestBaseMeasure('No Format', undefined, AggregationTypes.Sum);
        const jaql = measure.jaql();

        expect(jaql).not.toHaveProperty('format');
        expect(jaql.jaql.title).toBe('No Format');
      });

      it('should handle measures with Sort.None in JAQL', () => {
        const measure = createTestBaseMeasure(
          'No Sort',
          undefined,
          AggregationTypes.Sum,
          undefined,
          Sort.None,
        );
        const jaql = measure.jaql();

        expect(jaql.jaql).not.toHaveProperty('sort');
      });
    });

    describe('attribute type handling', () => {
      it('should handle text attributes', () => {
        const textAttribute = createTestAttribute(
          'Category',
          '[Commerce.Category]',
          'text-attribute',
        );
        const measure = createTestBaseMeasure(
          'Category Count',
          textAttribute,
          AggregationTypes.Count,
        );

        expect(measure.attribute.type).toBe('text-attribute');
        expect(measure.jaql().jaql.datatype).toBe('text');
      });

      it('should handle numeric attributes', () => {
        const numericAttribute = createTestAttribute(
          'Price',
          '[Commerce.Price]',
          'numeric-attribute',
        );
        const measure = createTestBaseMeasure(
          'Total Price',
          numericAttribute,
          AggregationTypes.Sum,
        );

        expect(measure.attribute.type).toBe('numeric-attribute');
        expect(measure.jaql().jaql.datatype).toBe('numeric');
      });

      it('should handle date attributes', () => {
        const dateAttribute = createTestAttribute('Date', '[Commerce.Date]', 'datetime-attribute');
        const measure = createTestBaseMeasure('Date Count', dateAttribute, AggregationTypes.Count);

        expect(measure.attribute.type).toBe('datetime-attribute');
        // The datatype mapping depends on the attribute's jaql method, which may return 'text' for unknown types
        expect(measure.jaql().jaql.datatype).toBe('text');
      });
    });

    describe('immutability and cloning', () => {
      it('should ensure sort creates a new instance', () => {
        const original = createTestBaseMeasure();
        const sorted = original.sort(Sort.Ascending);

        expect(sorted).not.toBe(original);
        expect(sorted.name).toBe(original.name);
        expect((sorted as DimensionalBaseMeasure).attribute).toBe(original.attribute);
        expect((sorted as DimensionalBaseMeasure).aggregation).toBe(original.aggregation);
      });

      it('should ensure format creates a new instance', () => {
        const original = createTestBaseMeasure();
        const formatted = original.format('$0,0.00') as DimensionalBaseMeasure;

        expect(formatted).not.toBe(original);
        expect(formatted.name).toBe(original.name);
        expect(formatted.attribute).toBe(original.attribute);
        expect(formatted.aggregation).toBe(original.aggregation);
      });

      it('should preserve dataSource and composeCode in cloned instances', () => {
        const dataSource = { title: 'Test DS' };
        const composeCode = 'test.code';
        const original = new DimensionalBaseMeasure(
          'Test',
          createTestAttribute(),
          AggregationTypes.Sum,
          undefined,
          undefined,
          Sort.None,
          dataSource,
          composeCode,
        );

        const sorted = original.sort(Sort.Ascending);
        expect(sorted.dataSource).toBe(dataSource);
        expect(sorted.composeCode).toBe(composeCode);
      });
    });

    describe('serialization edge cases', () => {
      it('should handle serialization with all optional properties', () => {
        const measure = new DimensionalBaseMeasure(
          'Full Measure',
          createTestAttribute(),
          AggregationTypes.Sum,
          '$0,0.00',
          'A comprehensive measure',
          Sort.Descending,
          { title: 'Test DS' },
          'test.code',
        );

        const serialized = measure.serialize();
        expect(serialized.name).toBe('Full Measure');
        expect(serialized.format).toBe('$0,0.00');
        expect(serialized.description).toBe('A comprehensive measure');
        expect(serialized.sort).toBe(Sort.Descending);
        expect(serialized.dataSource).toEqual({ title: 'Test DS' });
        expect(serialized.composeCode).toBe('test.code');
      });

      it('should handle calculated measure context serialization with mixed types', () => {
        const baseMeasure = createTestBaseMeasure();
        const customObject = {
          customProperty: 'value',
          serialize: () => ({ custom: 'serialized' }),
        };
        const plainObject = { plain: 'object' };

        const context = {
          '[M1]': baseMeasure,
          '[M2]': customObject,
          '[M3]': plainObject,
        };

        const measure = createTestCalculatedMeasure('Mixed Context', '[M1] + [M2] + [M3]', context);
        const serialized = measure.serialize();

        const serializedContext = serialized.context as Record<string, unknown>;
        expect(serializedContext?.['[M1]']).toEqual(baseMeasure.serialize());
        expect(serializedContext?.['[M2]']).toEqual({ custom: 'serialized' });
        expect(serializedContext?.['[M3]']).toEqual({ plain: 'object' });
      });
    });

    describe('createMeasure function comprehensive tests', () => {
      it('should handle createMeasure with all property variations', () => {
        const json = {
          name: 'Complete Measure',
          desc: 'A complete measure description',
          format: '0.00%',
          sort: Sort.Ascending,
          agg: 'sum',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure.name).toBe('Complete Measure');
        expect(measure.description).toBe('A complete measure description');
        expect(measure.getFormat()).toBe('0.00%');
        expect(measure.getSort()).toBe(Sort.Ascending); // createMeasure now passes sort
      });

      it('should handle createMeasure with title instead of name', () => {
        const json = {
          title: 'Title Measure',
          agg: 'avg',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure.name).toBe('Title Measure');
      });

      it('should handle createMeasure with aggregation instead of agg', () => {
        const json = {
          name: 'Aggregation Measure',
          aggregation: 'max',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalBaseMeasure);
        expect((measure as DimensionalBaseMeasure).aggregation).toBe('max');
      });

      it('should handle createMeasure for calculated measure with formula', () => {
        const json = {
          name: 'Formula Measure',
          formula: '[M1] * [M2]',
          context: {
            '[M1]': {
              name: 'Revenue',
              agg: 'sum',
              attribute: {
                name: 'Revenue',
                expression: '[Commerce.Revenue]',
                type: 'numeric-attribute',
              },
            },
            '[M2]': {
              name: 'Multiplier',
              agg: 'avg',
              attribute: {
                name: 'Multiplier',
                expression: '[Commerce.Multiplier]',
                type: 'numeric-attribute',
              },
            },
          },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalCalculatedMeasure);
        expect((measure as DimensionalCalculatedMeasure).expression).toBe('[M1] * [M2]');
      });

      it('should handle createMeasure with complex context creation', () => {
        const json = {
          name: 'Complex Context',
          expression: '[M1] + [M2]',
          context: {
            '[M1]': {
              name: 'Base Revenue',
              agg: 'sum',
              attribute: {
                name: 'Revenue',
                expression: '[Commerce.Revenue]',
                type: 'numeric-attribute',
              },
            },
            '[M2]': {
              name: 'Calculated Bonus',
              formula: '[M3] * 0.1',
              context: {
                '[M3]': {
                  name: 'Bonus Base',
                  agg: 'avg',
                  attribute: {
                    name: 'Bonus',
                    expression: '[Commerce.Bonus]',
                    type: 'numeric-attribute',
                  },
                },
              },
            },
          },
        };

        const measure = createMeasure(json);
        expect(measure).toBeInstanceOf(DimensionalCalculatedMeasure);
        const calcMeasure = measure as DimensionalCalculatedMeasure;
        expect(Object.keys(calcMeasure.context)).toHaveLength(2);
        expect(calcMeasure.context['[M1]']).toBeInstanceOf(DimensionalBaseMeasure);
        expect(calcMeasure.context['[M2]']).toBeInstanceOf(DimensionalCalculatedMeasure);
      });
    });

    describe('MeasureTemplate comprehensive tests', () => {
      it('should test all aggregation methods with format', () => {
        const template = new DimensionalMeasureTemplate(
          'Test Template',
          createTestAttribute(),
          undefined,
          'A test template',
          Sort.Ascending,
        );

        // The template methods now correctly pass format to the format parameter
        const sumMeasure = template.sum('$0,0.00');
        expect(sumMeasure.getFormat()).toBe('$0,0.00'); // Format is now correctly applied
        expect(sumMeasure.getSort()).toBe(Sort.Ascending);
      });

      it('should handle template format method', () => {
        const template = new DimensionalMeasureTemplate(
          'Template',
          createTestAttribute(),
          undefined,
          undefined,
          Sort.Ascending,
        );

        const formatted = template.format('$0,0.00');
        expect(formatted.getFormat()).toBe('$0,0.00');
        expect(formatted.getSort()).toBe(Sort.Ascending);
      });

      it('should handle template JAQL generation', () => {
        const template = new DimensionalMeasureTemplate(
          'Template JAQL',
          createTestAttribute('Revenue', '[Commerce.Revenue]', 'numeric-attribute'),
          '0.00%',
          'Template description',
          Sort.Descending,
        );

        const jaql = template.jaql();
        expect(jaql.jaql.title).toBe('sum Revenue');
        expect(jaql.jaql.agg).toBe('sum');
        expect(jaql.jaql.sort).toBe('desc');
        // The template format is applied to the template, and the JAQL comes from sum() which gets the format
        expect(jaql.format).toEqual({ number: '0.00%' }); // Now includes template format
      });
    });

    describe('aggregation mapping edge cases', () => {
      it('should handle case sensitivity in aggregation conversion', () => {
        expect(DimensionalBaseMeasure.aggregationFromJAQL('SUM')).toBe(AggregationTypes.Sum);
        expect(DimensionalBaseMeasure.aggregationFromJAQL('Sum')).toBe(AggregationTypes.Sum);
        expect(DimensionalBaseMeasure.aggregationToJAQL('SUM')).toBe('sum');
      });

      it('should handle null and undefined aggregation types', () => {
        expect(DimensionalBaseMeasure.aggregationFromJAQL(null as any)).toBe(AggregationTypes.Sum);
        expect(DimensionalBaseMeasure.aggregationFromJAQL(undefined as any)).toBe(
          AggregationTypes.Sum,
        );
        expect(DimensionalBaseMeasure.aggregationToJAQL(null as any)).toBe('sum');
        expect(DimensionalBaseMeasure.aggregationToJAQL(undefined as any)).toBe('sum');
      });
    });
  });
});

/* The stamp is the only thing saying a formula answers with a date when the formula is not a bare
   MIN or MAX, so it has to survive a round trip or the measure comes back as a number. */
describe('a stamped date measure through serialize and createMeasure', () => {
  const dateDimension = createDateDimension({
    name: 'Date',
    expression: '[Commerce.Date (Calendar)]',
  });
  const roundTrip = (measure: { serialize: () => object }) =>
    createMeasure(JSON.parse(JSON.stringify(measure.serialize())));

  it('keeps the datatype when the formula cannot re-derive it', () => {
    // built the way a saved Fusion measure arrives, which is the only way one carries a stamp
    const stamped = new DimensionalCalculatedMeasure(
      'Last sale',
      'MAX([D], [F])',
      { D: dateDimension.Days },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'datetime',
    );

    expect(isDateMeasure(stamped)).toBe(true);
    expect(isDateMeasure(roundTrip(stamped))).toBe(true);
    expect(roundTrip(stamped).jaql().jaql.datatype).toBe('datetime');
  });

  it('does not invent one for a formula that never carried it', () => {
    const plain = measureFactory.customFormula('Total', 'SUM([D])', { D: dateDimension.Days });

    expect('datatype' in plain.serialize()).toBe(false);
    expect(isDateMeasure(roundTrip(plain))).toBe(false);
  });
});

describe('date measure predicates', () => {
  const dateDimension = createDateDimension({
    name: 'Date',
    expression: '[Commerce.Date (Calendar)]',
  });
  const revenue = new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'numeric-attribute');

  describe('isDateMeasure', () => {
    it.each([
      ['max', measureFactory.max(dateDimension.Days)],
      ['min', measureFactory.min(dateDimension.Days)],
    ])('is true for %s over a datetime attribute', (_aggregation, measure) => {
      expect(isDateMeasure(measure)).toBe(true);
    });

    it.each([
      ['count', measureFactory.count(dateDimension.Days)],
      ['countDistinct', measureFactory.countDistinct(dateDimension.Days)],
      ['sum', measureFactory.sum(dateDimension.Days)],
      ['average', measureFactory.average(dateDimension.Days)],
      ['avg', measureFactory.avg(dateDimension.Days)],
      ['median', measureFactory.median(dateDimension.Days)],
      ['mode', measureFactory.mode(dateDimension.Days)],
      ['aggregate with sum', measureFactory.aggregate(dateDimension.Days, AggregationTypes.Sum)],
      ['aggregate with an unknown type', measureFactory.aggregate(dateDimension.Days, 'whatever')],
    ])('is false for %s over the same datetime attribute', (_aggregation, measure) => {
      expect(isDateMeasure(measure)).toBe(false);
    });

    it('is true for aggregate with max, which builds the same measure as max', () => {
      expect(
        isDateMeasure(measureFactory.aggregate(dateDimension.Days, AggregationTypes.Max)),
      ).toBe(true);
    });

    it('is false for max over a numeric attribute', () => {
      expect(isDateMeasure(measureFactory.max(revenue))).toBe(false);
    });

    it('is false for sum over a numeric attribute', () => {
      expect(isDateMeasure(measureFactory.sum(revenue))).toBe(false);
    });

    it('is false for a custom formula measure', () => {
      const measure = measureFactory.customFormula('Total', 'SUM([R])', { R: revenue });

      expect(isDateMeasure(measure)).toBe(false);
    });

    it('is true for a sub-day granularity, which the mask resolver clamps to days', () => {
      expect(isDateMeasure(measureFactory.max(dateDimension.Minutes))).toBe(true);
    });

    it.each([
      ['max', measureFactory.max(dateDimension)],
      ['min', measureFactory.min(dateDimension)],
    ])(
      'is true for %s over a bare date dimension, which is queried at its default level',
      (_aggregation, measure) => {
        expect(isDateMeasure(measure)).toBe(true);
      },
    );

    it('is false for max over a bare non-date dimension', () => {
      const productDimension = createDimension({
        name: 'Product',
        Name: new DimensionalAttribute('Name', '[Product.Name]', 'text-attribute'),
      });

      expect(isDateMeasure(measureFactory.max(productDimension))).toBe(false);
    });

    it('is false for count over a bare date dimension', () => {
      expect(isDateMeasure(measureFactory.count(dateDimension))).toBe(false);
    });

    it('is false for a value that is not a measure', () => {
      expect(isDateMeasure({ name: 'Years', type: 'datelevel' })).toBe(false);
    });
  });

  describe('getDateMeasureAttribute', () => {
    it('returns the aggregated level attribute of a date measure', () => {
      expect(getDateMeasureAttribute(measureFactory.max(dateDimension.Days))).toBe(
        dateDimension.Days,
      );
    });

    it('returns the default level attribute for a measure over a bare date dimension', () => {
      expect(dateDimension.defaultLevel).toBe(DateLevels.Years);
      expect(getDateMeasureAttribute(measureFactory.max(dateDimension))).toBe(dateDimension.Years);
    });

    it.each([
      ['count over a date attribute', measureFactory.count(dateDimension.Days)],
      ['sum over a numeric attribute', measureFactory.sum(revenue)],
      [
        'a custom formula measure',
        measureFactory.customFormula('Total', 'SUM([R])', { R: revenue }),
      ],
    ])('returns undefined for %s', (_case, measure) => {
      expect(getDateMeasureAttribute(measure)).toBeUndefined();
    });
  });
});

describe('date measure jaql format', () => {
  const dateDimension = createDateDimension({
    name: 'Date',
    expression: '[Commerce.Date (Calendar)]',
  });
  const revenue = new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'numeric-attribute');
  const formatOf = (measure: { jaql: () => { format?: unknown } }) => measure.jaql().format;

  it.each([
    [DateLevels.Years, 'years', 'yyyy'],
    [DateLevels.Months, 'months', 'yyyy-MM'],
    [DateLevels.Days, 'days', 'yyyy-MM-dd'],
  ])('emits a %s mask keyed by the level the jaql carries', (level, key, mask) => {
    expect(formatOf(measureFactory.max(dateDimension[level]))).toEqual({ mask: { [key]: mask } });
  });

  it('keeps datatype and level in the jaql beside the mask', () => {
    const { jaql, format } = measureFactory.max(dateDimension.Years).jaql();

    expect(jaql.datatype).toBe('datetime');
    expect(jaql.level).toBe('years');
    expect(format).toEqual({ mask: { years: 'yyyy' } });
  });

  it('clamps a sub-day level to the days mask (getDefaultDateMeasureFormat)', () => {
    expect(formatOf(measureFactory.max(dateDimension.Hours))).toEqual({
      mask: { minutes: 'yyyy-MM-dd' },
    });
  });

  it('keeps a format set on a sub-day level rather than clamping it', () => {
    const hours = dateDimension.Hours.format('MM/dd/yyyy HH:mm');

    expect(formatOf(measureFactory.max(hours))).toEqual({
      mask: { minutes: 'MM/dd/yyyy HH:mm' },
    });
  });

  it('keeps a format set on a day level, the control the clamp must not widen to', () => {
    const days = dateDimension.Days.format('MM/dd/yyyy');

    expect(formatOf(measureFactory.max(days))).toEqual({ mask: { days: 'MM/dd/yyyy' } });
  });

  it('keeps an explicit format, emitted as a mask rather than as a number', () => {
    expect(formatOf(measureFactory.max(dateDimension.Days).format('MM/yyyy'))).toEqual({
      mask: { days: 'MM/yyyy' },
    });
  });

  it('emits no mask for a date PART, whose answer is an ordinal and not a date', () => {
    const weekOfYear = new DimensionalLevelAttribute(
      'Week of year',
      '[Commerce.Date (Calendar)]',
      DateLevels.WeekOfYear,
    );

    expect(formatOf(measureFactory.max(weekOfYear))).toBeUndefined();
  });

  it.each([
    ['sum', measureFactory.sum(dateDimension.Days)],
    ['average', measureFactory.average(dateDimension.Days)],
    ['median', measureFactory.median(dateDimension.Days)],
    ['count', measureFactory.count(dateDimension.Days)],
    ['countDistinct', measureFactory.countDistinct(dateDimension.Days)],
    ['aggregate with sum', measureFactory.aggregate(dateDimension.Days, AggregationTypes.Sum)],
  ])('emits no mask for %s over a date, which answers a number', (_aggregation, measure) => {
    expect(formatOf(measure)).toBeUndefined();
  });

  it('emits a number format, not a mask, when a non-date aggregation over a date is formatted', () => {
    expect(formatOf(measureFactory.sum(dateDimension.Days).format('0,0'))).toEqual({
      number: '0,0',
    });
  });

  it('keeps a number format for a formula measure', () => {
    const formula = measureFactory.customFormula('Total', 'SUM([R])', { R: revenue });

    expect(formatOf(formula.format('0,0'))).toEqual({ number: '0,0' });
  });

  it('leaves a numeric measure untouched, the control', () => {
    expect(formatOf(measureFactory.sum(revenue))).toBeUndefined();
    expect(formatOf(measureFactory.sum(revenue).format('0.00'))).toEqual({ number: '0.00' });
  });

  it('a date dimension still emits its own mask', () => {
    const { format } = dateDimension.Days.format('yyyy-MM-dd').jaql();

    expect(format).toEqual({ mask: { days: 'yyyy-MM-dd' } });
  });
});

describe('date measures written as a formula', () => {
  const dateDimension = createDateDimension({
    name: 'Date',
    expression: '[Commerce.Date (Calendar)]',
  });
  const revenue = new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'numeric-attribute');
  // Fusion stamps the datatype at save time; `customFormula` has no parameter for it
  const stamped = (measure: unknown, datatype: string) =>
    (measure as DimensionalCalculatedMeasure).withDatatype(datatype);

  it('reads the date operand of a formula Fusion stamped as a datetime', () => {
    const measure = stamped(
      measureFactory.customFormula('Last sale', 'MAX([D])', { D: dateDimension.Days }),
      'datetime',
    );

    expect(getDateMeasureAttribute(measure)).toBe(dateDimension.Days);
    expect(isDateMeasure(measure)).toBe(true);
  });

  it('reads the date operand of a bare MAX formula with no stamped datatype', () => {
    const measure = measureFactory.customFormula('Max date', 'MAX([D])', { D: dateDimension.Days });

    expect(getDateMeasureAttribute(measure)).toBe(dateDimension.Days);
  });

  it('passes hasDateMeasureLevel, so the exports mask a formula the same way', () => {
    const measure = measureFactory.customFormula('Max date', 'MAX([D])', { D: dateDimension.Days });

    expect(hasDateMeasureLevel(measure)).toBe(true);
  });

  it('resolves a bare date dimension to its default level, as the aggregation shape does', () => {
    const measure = measureFactory.customFormula('Max date', 'MAX([D])', { D: dateDimension });

    expect(getDateMeasureAttribute(measure)).toBe(
      dateDimension[dateDimension.defaultLevel as keyof typeof dateDimension],
    );
  });

  it.each([
    ['a numeric formula, which must stay numeric', 'SUM([R])', { R: revenue }],
    ['a date operand behind arithmetic', 'MAX([D]) + 1', { D: dateDimension.Days }],
    ['an aggregation that does not keep the datatype', 'SUM([D])', { D: dateDimension.Days }],
  ])('returns nothing for %s', (_case, formula, context) => {
    const measure = measureFactory.customFormula('m', formula, context);

    expect(getDateMeasureAttribute(measure)).toBeUndefined();
    expect(isDateMeasure(measure)).toBe(false);
  });

  it('returns nothing for a numeric formula Fusion stamped, which must stay numeric', () => {
    const measure = stamped(
      measureFactory.customFormula('Customer lifetime', 'SUM([R])', { R: revenue }),
      'numeric',
    );

    expect(getDateMeasureAttribute(measure)).toBeUndefined();
  });

  it('returns nothing when two date operands leave the answer ambiguous', () => {
    const measure = stamped(
      measureFactory.customFormula('Span', '[A] - [B]', {
        A: dateDimension.Days,
        B: dateDimension.Years,
      }),
      'datetime',
    );

    expect(getDateMeasureAttribute(measure)).toBeUndefined();
  });
});

describe('date formula jaql format', () => {
  const dateDimension = createDateDimension({
    name: 'Date',
    expression: '[Commerce.Date (Calendar)]',
  });
  const revenue = new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'numeric-attribute');
  const stamped = (measure: unknown, datatype: string) =>
    (measure as DimensionalCalculatedMeasure).withDatatype(datatype);
  const maxDate = (level = dateDimension.Days, format?: string) =>
    stamped(
      measureFactory.customFormula('Last sale', 'MAX([D])', { D: level }, format),
      'datetime',
    ).jaql();

  it('sends a date formula as a datetime, carrying the level of its operand', () => {
    const { jaql } = maxDate();

    expect(jaql.datatype).toBe('datetime');
    expect(jaql.level).toBe('days');
    expect(jaql.formula).toBe('MAX([D])');
  });

  it('masks the result with the level default when nothing was saved', () => {
    expect(maxDate().format).toEqual({ mask: { days: 'yyyy-MM-dd' } });
  });

  it('keeps the mask the widget saved, so the measure and the dimension beside it agree', () => {
    expect(maxDate(dateDimension.Days, 'shortDate').format).toEqual({
      mask: { days: 'shortDate' },
    });
  });

  it('clamps a sub-day operand to the days mask, as the aggregation shape does', () => {
    const { jaql, format } = maxDate(dateDimension.Hours);

    expect(jaql.dateTimeLevel).toBe('minutes');
    expect(format).toEqual({ mask: { minutes: 'yyyy-MM-dd' } });
  });

  it('leaves a numeric formula on a number format, with no datatype and no level', () => {
    const { jaql, format } = measureFactory
      .customFormula('Customer lifetime', 'SUM([R])', { R: revenue }, '0,0')
      .jaql();

    expect(format).toEqual({ number: '0,0' });
    expect(jaql.datatype).toBeUndefined();
    expect(jaql.level).toBeUndefined();
  });

  it('emits no format at all for an unformatted numeric formula', () => {
    const { format } = measureFactory.customFormula('Total', 'SUM([R])', { R: revenue }).jaql();

    expect(format).toBeUndefined();
  });

  it('sends a date PART formula as it was, since its answer is an ordinal', () => {
    const weekOfYear = new DimensionalLevelAttribute(
      'Week of year',
      '[Commerce.Date (Calendar)]',
      DateLevels.WeekOfYear,
    );
    const { jaql, format } = stamped(
      measureFactory.customFormula('Week', 'MAX([W])', { W: weekOfYear }),
      'datetime',
    ).jaql();

    expect(jaql.datatype).toBeUndefined();
    expect(format).toBeUndefined();
  });
});

describe('getDateMeasureAggregation', () => {
  const dateDimension = createDateDimension({
    name: 'Date',
    expression: '[Commerce.Date (Calendar)]',
  });
  const revenue = new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'numeric-attribute');

  it.each([
    ['max', measureFactory.max(dateDimension.Days, 'Max Date')],
    ['min', measureFactory.min(dateDimension.Days, 'Min Date')],
  ])('reads %s off an aggregation measure', (expected, measure) => {
    expect(getDateMeasureAggregation(measure)).toBe(expected);
  });

  it.each([
    ['max', 'MAX([D])'],
    ['min', 'MIN([D])'],
    ['max', 'max([D])'],
  ])('reads %s out of the formula %s', (expected, formula) => {
    const measure = measureFactory.customFormula('m', formula, { D: dateDimension.Days });

    expect(getDateMeasureAggregation(measure)).toBe(expected);
  });

  it('answers nothing for a measure that is not a date measure', () => {
    expect(getDateMeasureAggregation(measureFactory.sum(revenue, 'Total'))).toBeUndefined();
    expect(
      getDateMeasureAggregation(
        measureFactory.customFormula('Lifetime', 'SUM([R])', { R: revenue }),
      ),
    ).toBeUndefined();
  });
});
