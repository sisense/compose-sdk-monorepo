import { vi } from 'vitest';

import {
  createAttribute,
  createLevel,
  DimensionalAttribute,
  DimensionalLevelAttribute,
  isDimensionalAttribute,
  isDimensionalLevelAttribute,
  normalizeAttributeName,
} from './attributes.js';
import { DateLevels, Sort } from './types.js';

describe('attributes', () => {
  describe('Attributes jaql preparations', () => {
    it('must prepare simple attribute jaql', () => {
      const result = { jaql: { title: 'Brand', dim: '[Brand.Brand ID]', datatype: 'text' } };
      const attribute = new DimensionalAttribute('Brand', '[Brand.Brand ID]');

      const jaql = attribute.jaql();

      expect(jaql).toStrictEqual(result);
    });

    it('must prepare simple level attribute jaql', () => {
      const result = {
        jaql: {
          title: 'Years',
          dim: '[Commerce.Date (Calendar)]',
          level: 'years',
          datatype: 'datetime',
        },
      };
      const level = new DimensionalLevelAttribute(
        'Years',
        '[Commerce.Date (Calendar)]',
        DateLevels.Years,
      );

      const jaql = level.jaql();

      expect(jaql).toStrictEqual(result);
    });

    it('must prepare minutes level attribute jaql', () => {
      const result = {
        jaql: {
          title: DateLevels.MinutesRoundTo30,
          dim: '[Commerce.Date (Calendar)]',
          dateTimeLevel: 'minutes',
          bucket: '30',
          datatype: 'datetime',
        },
      };
      const level = new DimensionalLevelAttribute(
        DateLevels.MinutesRoundTo30,
        '[Commerce.Date (Calendar)]',
        DateLevels.MinutesRoundTo30,
      );

      const jaql = level.jaql();

      expect(jaql).toStrictEqual(result);
    });

    it('must prepare aggregated minutes level attribute jaql', () => {
      const result = {
        jaql: {
          title: DateLevels.AggMinutesRoundTo1,
          dim: '[Commerce.Date (Calendar)]',
          level: 'minutes',
          bucket: '1',
          datatype: 'datetime',
        },
      };
      const level = new DimensionalLevelAttribute(
        DateLevels.AggMinutesRoundTo1,
        '[Commerce.Date (Calendar)]',
        DateLevels.AggMinutesRoundTo1,
      );

      const jaql = level.jaql();

      expect(jaql).toStrictEqual(result);
    });

    it('must apply format during transform level attribute jaql', () => {
      const format = 'yyyy MM dd';
      const level = new DimensionalLevelAttribute(
        'Years',
        '[Commerce.Date (Calendar)]',
        'Years',
        format,
      );

      const jaql = level.jaql();
      expect(jaql.format?.mask?.years).toEqual(format);
    });
  });

  describe('DimensionalAttribute', () => {
    describe('constructor', () => {
      it('should create attribute with panel set to columns', () => {
        const attribute = new DimensionalAttribute(
          'Brand',
          '[Brand.Brand ID]',
          'text-attribute',
          'Brand description',
          Sort.Ascending,
          undefined,
          'custom-compose-code',
          'columns',
        );

        expect(attribute.panel).toBe('columns');
      });

      it('should not set panel if not columns', () => {
        const attribute = new DimensionalAttribute(
          'Brand',
          '[Brand.Brand ID]',
          'text-attribute',
          'Brand description',
          Sort.Ascending,
          undefined,
          'custom-compose-code',
          'other-panel',
        );

        expect(attribute.panel).toBeUndefined();
      });

      it('should generate composeCode from expression when not provided', () => {
        const attribute = new DimensionalAttribute('Brand', '[Brand.Brand ID]', 'text-attribute');

        expect(attribute.composeCode).toBe('DM.Brand.BrandID');
      });

      it('should not generate composeCode when expression is empty', () => {
        const attribute = new DimensionalAttribute('Brand', '', 'text-attribute');

        expect(attribute.composeCode).toBeUndefined();
      });
    });

    describe('jaql method', () => {
      it('should include panel in jaql when panel is set', () => {
        const attribute = new DimensionalAttribute(
          'Brand',
          '[Brand.Brand ID]',
          'text-attribute',
          undefined,
          undefined,
          undefined,
          undefined,
          'columns',
        );

        const jaql = attribute.jaql();
        expect(jaql.panel).toBe('columns');
      });

      it('should include sort in jaql when sort is ascending', () => {
        const attribute = new DimensionalAttribute(
          'Brand',
          '[Brand.Brand ID]',
          'text-attribute',
          undefined,
          Sort.Ascending,
        );

        const jaql = attribute.jaql();
        expect(jaql.jaql.sort).toBe('asc');
      });

      it('should include sort in jaql when sort is descending', () => {
        const attribute = new DimensionalAttribute(
          'Brand',
          '[Brand.Brand ID]',
          'text-attribute',
          undefined,
          Sort.Descending,
        );

        const jaql = attribute.jaql();
        expect(jaql.jaql.sort).toBe('desc');
      });

      it('should return nested jaql when nested is true', () => {
        const attribute = new DimensionalAttribute('Brand', '[Brand.Brand ID]', 'text-attribute');

        const jaql = attribute.jaql(true);
        expect(jaql).toEqual({
          title: 'Brand',
          dim: '[Brand.Brand ID]',
          datatype: 'text',
        });
      });
    });

    describe('serialize method', () => {
      it('should include sort in serialized result when sort is not None', () => {
        const attribute = new DimensionalAttribute(
          'Brand',
          '[Brand.Brand ID]',
          'text-attribute',
          undefined,
          Sort.Ascending,
        );

        const serialized = attribute.serialize();
        expect(serialized.sort).toBe(Sort.Ascending);
      });

      it('should not include sort in serialized result when sort is None', () => {
        const attribute = new DimensionalAttribute(
          'Brand',
          '[Brand.Brand ID]',
          'text-attribute',
          undefined,
          Sort.None,
        );

        const serialized = attribute.serialize();
        expect(serialized.sort).toBeUndefined();
      });
    });
  });

  describe('DimensionalLevelAttribute', () => {
    describe('constructor', () => {
      it('should create level attribute with panel set to columns', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
          'yyyy',
          'Years description',
          Sort.Ascending,
          undefined,
          'custom-compose-code',
          'columns',
        );

        expect(level.panel).toBe('columns');
      });

      it('should not set panel if not columns', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
          'yyyy',
          'Years description',
          Sort.Ascending,
          undefined,
          'custom-compose-code',
          'other-panel',
        );

        expect(level.panel).toBeUndefined();
      });

      it('should generate composeCode from expression and granularity when not provided', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
        );

        expect(level.composeCode).toBe('DM.Commerce.Date.Years');
      });

      it('should not generate composeCode when expression is empty', () => {
        const level = new DimensionalLevelAttribute('Years', '', DateLevels.Years);

        expect(level.composeCode).toBeUndefined();
      });
    });

    describe('id property', () => {
      it('should generate id for years level', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
        );

        expect(level.id).toBe('[Commerce.Date (Calendar)]_years');
      });

      it('should generate id for minutes level with bucket', () => {
        const level = new DimensionalLevelAttribute(
          'Minutes',
          '[Commerce.Date (Calendar)]',
          DateLevels.MinutesRoundTo30,
        );

        expect(level.id).toBe('[Commerce.Date (Calendar)]_minutes_30');
      });

      it('should generate id for hours level with bucket', () => {
        const level = new DimensionalLevelAttribute(
          'Hours',
          '[Commerce.Date (Calendar)]',
          DateLevels.Hours,
        );

        expect(level.id).toBe('[Commerce.Date (Calendar)]_minutes_60');
      });

      it('should generate id for seconds level', () => {
        const level = new DimensionalLevelAttribute(
          'Seconds',
          '[Commerce.Date (Calendar)]',
          DateLevels.Seconds,
        );

        expect(level.id).toBe('[Commerce.Date (Calendar)]_seconds_0');
      });
    });

    describe('setGranularity method', () => {
      it('should create new level attribute with different granularity', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
          'yyyy',
          'Years description',
          Sort.Ascending,
        );

        const newLevel = level.setGranularity(DateLevels.Months);
        expect(newLevel.granularity).toBe(DateLevels.Months);
        expect(newLevel.name).toBe('Years');
        expect(newLevel.expression).toBe('[Commerce.Date (Calendar)]');
        expect(newLevel.getFormat()).toBe('yyyy');
        expect(newLevel.getSort()).toBe(Sort.Ascending);
      });
    });

    describe('jaql method', () => {
      it('should include panel in jaql when panel is set', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          'columns',
        );

        const jaql = level.jaql();
        expect(jaql.panel).toBe('columns');
      });

      it('should include sort in jaql when sort is ascending', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
          undefined,
          undefined,
          Sort.Ascending,
        );

        const jaql = level.jaql();
        expect(jaql.jaql.sort).toBe('asc');
      });

      it('should include sort in jaql when sort is descending', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
          undefined,
          undefined,
          Sort.Descending,
        );

        const jaql = level.jaql();
        expect(jaql.jaql.sort).toBe('desc');
      });

      it('should return nested jaql when nested is true', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
        );

        const jaql = level.jaql(true);
        expect(jaql).toEqual({
          title: 'Years',
          dim: '[Commerce.Date (Calendar)]',
          datatype: 'datetime',
          level: 'years',
        });
      });
    });

    describe('serialize method', () => {
      it('should include format in serialized result when format is defined', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
          'yyyy',
        );

        const serialized = level.serialize();
        expect(serialized.format).toBe('yyyy');
      });

      it('should not include format in serialized result when format is undefined', () => {
        const level = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
        );

        const serialized = level.serialize();
        expect(serialized.format).toBeUndefined();
      });
    });

    describe('translateGranularityToJaql method', () => {
      it('should translate Hours granularity', () => {
        const level = new DimensionalLevelAttribute(
          'Hours',
          '[Commerce.Date (Calendar)]',
          DateLevels.Hours,
        );

        const jaql = level.translateGranularityToJaql();
        expect(jaql).toEqual({
          dateTimeLevel: 'minutes',
          bucket: '60',
        });
      });

      it('should translate MinutesRoundTo15 granularity', () => {
        const level = new DimensionalLevelAttribute(
          'Minutes15',
          '[Commerce.Date (Calendar)]',
          DateLevels.MinutesRoundTo15,
        );

        const jaql = level.translateGranularityToJaql();
        expect(jaql).toEqual({
          dateTimeLevel: 'minutes',
          bucket: '15',
        });
      });

      it('should translate AggHours granularity', () => {
        const level = new DimensionalLevelAttribute(
          'AggHours',
          '[Commerce.Date (Calendar)]',
          DateLevels.AggHours,
        );

        const jaql = level.translateGranularityToJaql();
        expect(jaql).toEqual({
          level: 'minutes',
          bucket: '60',
        });
      });

      it('should translate AggMinutesRoundTo30 granularity', () => {
        const level = new DimensionalLevelAttribute(
          'AggMinutes30',
          '[Commerce.Date (Calendar)]',
          DateLevels.AggMinutesRoundTo30,
        );

        const jaql = level.translateGranularityToJaql();
        expect(jaql).toEqual({
          level: 'minutes',
          bucket: '30',
        });
      });

      it('should handle unsupported granularity', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const level = new DimensionalLevelAttribute(
          'Unsupported',
          '[Commerce.Date (Calendar)]',
          'unsupported-granularity',
        );

        const jaql = level.translateGranularityToJaql();
        expect(jaql).toEqual({
          level: 'unsupported-granularity',
        });
        expect(consoleSpy).toHaveBeenCalledWith('Unsupported level');

        consoleSpy.mockRestore();
      });
    });
  });

  describe('Attributes with composeCode', () => {
    const MOCK_COMPOSE_CODE = 'someCode';
    it('must prepare simple attribute with composeCode', () => {
      const attribute = new DimensionalAttribute(
        'Brand',
        '[Brand.Brand ID]',
        undefined,
        undefined,
        undefined,
        undefined,
        MOCK_COMPOSE_CODE,
      );
      expect(attribute.composeCode).toBe(MOCK_COMPOSE_CODE);
      expect(attribute.sort(Sort.Descending).composeCode).toBe(MOCK_COMPOSE_CODE);
    });

    it('must prepare simple level attribute with composeCode', () => {
      const level = new DimensionalLevelAttribute(
        'Years',
        '[Commerce.Date (Calendar)]',
        DateLevels.Years,
        undefined,
        undefined,
        undefined,
        undefined,
        MOCK_COMPOSE_CODE,
      );

      expect(level.composeCode).toBe(MOCK_COMPOSE_CODE);
      expect(level.sort(Sort.Descending).composeCode).toBe(MOCK_COMPOSE_CODE);
      expect(level.format('someFormat').composeCode).toBe(MOCK_COMPOSE_CODE);
    });
  });

  describe('createAttribute', () => {
    it('should create attribute from json', () => {
      const numericAttribute = createAttribute({
        name: 'BrandID',
        type: 'numeric-attribute',
        expression: '[Commerce.Brand ID]',
        description: 'Fortune999 Brands',
      });

      expect(numericAttribute).toBeInstanceOf(DimensionalAttribute);
      expect(numericAttribute.name).toBe('BrandID');
      expect(numericAttribute.expression).toBe('[Commerce.Brand ID]');
      expect(numericAttribute.type).toBe('numeric-attribute');
      expect(numericAttribute.description).toBe('Fortune999 Brands');
    });

    it('should create level attribute when granularity is present', () => {
      const levelAttribute = createAttribute({
        name: 'Years',
        expression: '[Commerce.Date]',
        granularity: DateLevels.Years,
        format: 'yyyy',
        description: 'Years level',
        sort: Sort.Ascending,
      });

      expect(levelAttribute).toBeInstanceOf(DimensionalLevelAttribute);
      expect(levelAttribute.name).toBe('Years');
      expect(levelAttribute.expression).toBe('[Commerce.Date]');
      expect((levelAttribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Years);
    });

    it('should handle json with title instead of name', () => {
      const attribute = createAttribute({
        title: 'Brand Title',
        expression: '[Brand.Brand ID]',
        type: 'text-attribute',
      });

      expect(attribute.name).toBe('Brand Title');
    });

    it('should handle json with attribute property instead of expression', () => {
      const attribute = createAttribute({
        name: 'Brand',
        attribute: '[Brand.Brand ID]',
        type: 'text-attribute',
      });

      expect(attribute.expression).toBe('[Brand.Brand ID]');
    });

    it('should handle json with dim property instead of expression', () => {
      const attribute = createAttribute({
        name: 'Brand',
        dim: '[Brand.Brand ID]',
        type: 'text-attribute',
      });

      expect(attribute.expression).toBe('[Brand.Brand ID]');
    });

    it('should handle json with desc instead of description', () => {
      const attribute = createAttribute({
        name: 'Brand',
        expression: '[Brand.Brand ID]',
        type: 'text-attribute',
        desc: 'Brand description',
      });

      expect(attribute.description).toBe('Brand description');
    });
  });

  describe('createLevel', () => {
    it('should create level attribute from json', () => {
      const levelAttribute = createLevel({
        name: 'Years',
        expression: '[Commerce.Date]',
        granularity: DateLevels.Years,
        format: 'yyyy',
        description: 'Years level',
        sort: Sort.Ascending,
      });

      expect(levelAttribute).toBeInstanceOf(DimensionalLevelAttribute);
      expect(levelAttribute.name).toBe('Years');
      expect(levelAttribute.expression).toBe('[Commerce.Date]');
      expect(levelAttribute.granularity).toBe(DateLevels.Years);
      expect(levelAttribute.getFormat()).toBe('yyyy');
      expect(levelAttribute.getSort()).toBe(Sort.Ascending);
    });

    it('should handle json with title instead of name', () => {
      const levelAttribute = createLevel({
        title: 'Years Title',
        expression: '[Commerce.Date]',
        granularity: DateLevels.Years,
      });

      expect(levelAttribute.name).toBe('Years Title');
    });

    it('should handle json with attribute property instead of expression', () => {
      const levelAttribute = createLevel({
        name: 'Years',
        attribute: '[Commerce.Date]',
        granularity: DateLevels.Years,
      });

      expect(levelAttribute.expression).toBe('[Commerce.Date]');
    });

    it('should handle json with dim property instead of expression', () => {
      const levelAttribute = createLevel({
        name: 'Years',
        dim: '[Commerce.Date]',
        granularity: DateLevels.Years,
      });

      expect(levelAttribute.expression).toBe('[Commerce.Date]');
    });

    it('should handle json with desc instead of description', () => {
      const levelAttribute = createLevel({
        name: 'Years',
        expression: '[Commerce.Date]',
        granularity: DateLevels.Years,
        desc: 'Years description',
      });

      expect(levelAttribute.description).toBe('Years description');
    });
  });

  describe('translateJaqlToGranularity', () => {
    it('should handle unsupported dateTimeLevel', () => {
      const json = { dateTimeLevel: 'unsupported', bucket: '15' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe('unsupported');
    });

    it('should handle unsupported level', () => {
      const json = { level: 'unsupported' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe('unsupported');
    });

    it('should translate years level', () => {
      const json = { level: 'years' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Years);
    });

    it('should translate quarters level', () => {
      const json = { level: 'quarters' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Quarters);
    });

    it('should translate months level', () => {
      const json = { level: 'months' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Months);
    });

    it('should translate weeks level', () => {
      const json = { level: 'weeks' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Weeks);
    });

    it('should translate days level', () => {
      const json = { level: 'days' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Days);
    });

    it('should translate aggregated minutes level with 60 bucket', () => {
      const json = { level: 'minutes', bucket: '60' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.AggHours);
    });

    it('should translate aggregated minutes level with 30 bucket', () => {
      const json = { level: 'minutes', bucket: '30' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
        DateLevels.AggMinutesRoundTo30,
      );
    });

    it('should translate aggregated minutes level with 15 bucket', () => {
      const json = { level: 'minutes', bucket: '15' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
        DateLevels.AggMinutesRoundTo15,
      );
    });

    it('should translate aggregated minutes level with 1 bucket', () => {
      const json = { level: 'minutes', bucket: '1' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
        DateLevels.AggMinutesRoundTo1,
      );
    });

    it('should translate minutes level with 60 bucket', () => {
      const json = { dateTimeLevel: 'minutes', bucket: '60' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Hours);
    });

    it('should translate minutes level with 30 bucket', () => {
      const json = { dateTimeLevel: 'minutes', bucket: '30' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
        DateLevels.MinutesRoundTo30,
      );
    });

    it('should translate minutes level with 15 bucket', () => {
      const json = { dateTimeLevel: 'minutes', bucket: '15' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
        DateLevels.MinutesRoundTo15,
      );
    });

    it('should translate minutes level with 1 bucket', () => {
      const json = { dateTimeLevel: 'minutes', bucket: '1' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Minutes);
    });

    it('should translate seconds level with 0 bucket', () => {
      const json = { dateTimeLevel: 'seconds', bucket: '0' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Seconds);
    });

    it('should handle unsupported dateTimeLevel bucket', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const json = { dateTimeLevel: 'minutes', bucket: 'unsupported' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe('minutes');
      expect(consoleSpy).toHaveBeenCalledWith('Unsupported granularity', 'minutes');

      consoleSpy.mockRestore();
    });

    it('should handle unsupported level bucket', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const json = { level: 'minutes', bucket: 'unsupported' };
      expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe('minutes');
      expect(consoleSpy).toHaveBeenCalledWith('Unsupported granularity', 'minutes');

      consoleSpy.mockRestore();
    });
  });

  describe('getDefaultFormatForGranularity', () => {
    it('should return default format', () => {
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Years)).toBe(
        'yyyy',
      );
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Quarters)).toBe(
        'Q yyyy',
      );
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Months)).toBe(
        'yyyy-MM',
      );
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Weeks)).toBe(
        'ww yyyy',
      );
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Days)).toBe(
        'yyyy-MM-dd',
      );
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Hours)).toBe(
        'yyyy-MM-dd HH:mm',
      );
      expect(
        DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.MinutesRoundTo30),
      ).toBe('yyyy-MM-dd HH:mm');
      expect(
        DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.MinutesRoundTo15),
      ).toBe('yyyy-MM-dd HH:mm');
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Minutes)).toBe(
        'yyyy-MM-dd HH:mm',
      );
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Seconds)).toBe(
        'yyyy-MM-dd HH:mm:ss',
      );
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.AggHours)).toBe(
        'HH:mm',
      );
      expect(
        DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.AggMinutesRoundTo30),
      ).toBe('HH:mm');
      expect(
        DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.AggMinutesRoundTo15),
      ).toBe('HH:mm');
      expect(
        DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.AggMinutesRoundTo1),
      ).toBe('HH:mm');
      expect(DimensionalLevelAttribute.getDefaultFormatForGranularity('unrecognized-level')).toBe(
        '',
      );
    });
  });

  describe('normalizeAttributeName', () => {
    it('should normalize attribute name with all parameters', () => {
      const result = normalizeAttributeName('Commerce Sales', 'Order Date', 'Years', 'DM');
      expect(result).toBe('DM.CommerceSales.OrderDate.Years');
    });

    it('should normalize attribute name without model name', () => {
      const result = normalizeAttributeName('Commerce Sales', 'Order Date', 'Years');
      expect(result).toBe('CommerceSales.OrderDate.Years');
    });

    it('should normalize attribute name without granularity', () => {
      const result = normalizeAttributeName('Commerce Sales', 'Order Date', '', 'DM');
      expect(result).toBe('DM.CommerceSales.OrderDate');
    });

    it('should normalize attribute name without granularity and model name', () => {
      const result = normalizeAttributeName('Commerce Sales', 'Order Date');
      expect(result).toBe('CommerceSales.OrderDate');
    });

    it('should handle empty model name', () => {
      const result = normalizeAttributeName('Commerce Sales', 'Order Date', 'Years', '');
      expect(result).toBe('CommerceSales.OrderDate.Years');
    });

    it('should handle empty granularity', () => {
      const result = normalizeAttributeName('Commerce Sales', 'Order Date', '', 'DM');
      expect(result).toBe('DM.CommerceSales.OrderDate');
    });
  });

  describe('Type Guard Functions', () => {
    describe('isDimensionalAttribute', () => {
      it('should return true for valid DimensionalAttribute instances', () => {
        const attribute = new DimensionalAttribute('Brand', '[Brand.Brand ID]');
        expect(isDimensionalAttribute(attribute)).toBe(true);
      });

      it('should return false for DimensionalLevelAttribute instances', () => {
        const levelAttribute = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
        );
        expect(isDimensionalAttribute(levelAttribute)).toBe(false);
      });

      it('should return false for null and undefined', () => {
        expect(isDimensionalAttribute(null as any)).toBe(false);
        expect(isDimensionalAttribute(undefined as any)).toBe(false);
      });

      it('should return false for plain objects', () => {
        const plainObject = { name: 'test', __serializable: 'SomethingElse' };
        expect(isDimensionalAttribute(plainObject)).toBe(false);
      });

      it('should return false for objects without __serializable property', () => {
        const objectWithoutSerializable = { name: 'test', expression: '[Test.Column]' };
        expect(isDimensionalAttribute(objectWithoutSerializable)).toBe(false);
      });

      it('should return false for objects with wrong __serializable value', () => {
        const wrongSerializable = { __serializable: 'DimensionalLevelAttribute' };
        expect(isDimensionalAttribute(wrongSerializable)).toBe(false);
      });

      it('should work correctly with attributes created through factory', () => {
        const json = {
          name: 'Factory Attribute',
          expression: '[Factory.Column]',
          type: 'text-attribute',
        };

        const attribute = createAttribute(json);
        expect(isDimensionalAttribute(attribute)).toBe(true);
      });

      it('should handle serialized and deserialized attributes', () => {
        const original = new DimensionalAttribute('Brand', '[Brand.Brand ID]');
        const serialized = original.serialize();

        // The serialized object should be recognized as having the correct __serializable property
        expect(isDimensionalAttribute(serialized)).toBe(true);

        // But an attribute created from the serialized data should also be recognized
        const recreated = createAttribute({
          ...serialized,
          expression: original.expression,
        });
        expect(isDimensionalAttribute(recreated)).toBe(true);
      });

      it('should handle attributes with all optional properties', () => {
        const fullAttribute = new DimensionalAttribute(
          'Full Attribute',
          '[Full.Column]',
          'text-attribute',
          'Description',
          Sort.Ascending,
          { title: 'DataSource' },
          'compose.code',
          'columns',
        );

        expect(isDimensionalAttribute(fullAttribute)).toBe(true);
      });
    });

    describe('isDimensionalLevelAttribute', () => {
      it('should return true for valid DimensionalLevelAttribute instances', () => {
        const levelAttribute = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
        );
        expect(isDimensionalLevelAttribute(levelAttribute)).toBe(true);
      });

      it('should return false for DimensionalAttribute instances', () => {
        const attribute = new DimensionalAttribute('Brand', '[Brand.Brand ID]');
        expect(isDimensionalLevelAttribute(attribute)).toBe(false);
      });

      it('should return false for null and undefined', () => {
        expect(isDimensionalLevelAttribute(null as any)).toBe(false);
        expect(isDimensionalLevelAttribute(undefined as any)).toBe(false);
      });

      it('should return false for plain objects', () => {
        const plainObject = { name: 'test', __serializable: 'SomethingElse' };
        expect(isDimensionalLevelAttribute(plainObject)).toBe(false);
      });

      it('should return false for objects without __serializable property', () => {
        const objectWithoutSerializable = {
          name: 'test',
          expression: '[Test.Date]',
          granularity: 'Years',
        };
        expect(isDimensionalLevelAttribute(objectWithoutSerializable)).toBe(false);
      });

      it('should return false for objects with wrong __serializable value', () => {
        const wrongSerializable = { __serializable: 'DimensionalAttribute' };
        expect(isDimensionalLevelAttribute(wrongSerializable)).toBe(false);
      });

      it('should work correctly with level attributes created through factory', () => {
        const json = {
          name: 'Factory Level',
          expression: '[Factory.Date]',
          granularity: DateLevels.Years,
        };

        const levelAttribute = createAttribute(json);
        expect(isDimensionalLevelAttribute(levelAttribute)).toBe(true);
      });

      it('should handle serialized and deserialized level attributes', () => {
        const original = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
        );
        const serialized = original.serialize();

        // The serialized object should be recognized as having the correct __serializable property
        expect(isDimensionalLevelAttribute(serialized)).toBe(true);

        // But a level attribute created from the serialized data should also be recognized
        const recreated = createAttribute({
          ...serialized,
          expression: original.expression,
        });
        expect(isDimensionalLevelAttribute(recreated)).toBe(true);
      });

      it('should handle level attributes with all optional properties', () => {
        const fullLevelAttribute = new DimensionalLevelAttribute(
          'Full Level',
          '[Full.Date]',
          DateLevels.Years,
          'yyyy',
          'Description',
          Sort.Descending,
          { title: 'DataSource' },
          'compose.code',
          'columns',
        );

        expect(isDimensionalLevelAttribute(fullLevelAttribute)).toBe(true);
      });

      it('should handle different granularities correctly', () => {
        const granularities = [
          DateLevels.Years,
          DateLevels.Months,
          DateLevels.Days,
          DateLevels.Hours,
          DateLevels.Minutes,
          DateLevels.MinutesRoundTo15,
          DateLevels.MinutesRoundTo30,
          DateLevels.AggHours,
        ];

        granularities.forEach((granularity) => {
          const levelAttribute = new DimensionalLevelAttribute('Test', '[Test.Date]', granularity);
          expect(isDimensionalLevelAttribute(levelAttribute)).toBe(true);
        });
      });
    });

    describe('Type Guard Functions - Cross validation', () => {
      it('should handle objects that look like attributes but are not', () => {
        const fakeAttribute = {
          name: 'Fake',
          expression: '[Fake.Column]',
          __serializable: 'FakeAttribute',
        };

        expect(isDimensionalAttribute(fakeAttribute)).toBe(false);
        expect(isDimensionalLevelAttribute(fakeAttribute)).toBe(false);
      });

      it('should properly distinguish between attribute types', () => {
        const attribute = new DimensionalAttribute('Brand', '[Brand.Brand ID]');
        const levelAttribute = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
        );

        // Cross-checks to ensure they don't match each other's type guards
        expect(isDimensionalAttribute(attribute)).toBe(true);
        expect(isDimensionalLevelAttribute(attribute)).toBe(false);

        expect(isDimensionalLevelAttribute(levelAttribute)).toBe(true);
        expect(isDimensionalAttribute(levelAttribute)).toBe(false);
      });

      it('should handle mixed serialized objects correctly', () => {
        const attribute = new DimensionalAttribute('Brand', '[Brand.Brand ID]');
        const levelAttribute = new DimensionalLevelAttribute(
          'Years',
          '[Commerce.Date (Calendar)]',
          DateLevels.Years,
        );

        const serializedAttribute = attribute.serialize();
        const serializedLevelAttribute = levelAttribute.serialize();

        expect(isDimensionalAttribute(serializedAttribute)).toBe(true);
        expect(isDimensionalLevelAttribute(serializedAttribute)).toBe(false);

        expect(isDimensionalLevelAttribute(serializedLevelAttribute)).toBe(true);
        expect(isDimensionalAttribute(serializedLevelAttribute)).toBe(false);
      });

      it('should handle edge cases with complex property combinations', () => {
        // Object that has both attribute and level-like properties but wrong __serializable
        const mixedObject = {
          name: 'Mixed',
          expression: '[Mixed.Date]',
          granularity: DateLevels.Years,
          format: 'yyyy',
          __serializable: 'SomethingElse',
        };

        expect(isDimensionalAttribute(mixedObject)).toBe(false);
        expect(isDimensionalLevelAttribute(mixedObject)).toBe(false);
      });
    });
  });
});
