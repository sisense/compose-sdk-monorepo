import { dataOptionsTranslators } from './data-options';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';

import { AreamapChartDataOptions, AreamapChartDataOptionsInternal } from '@/index';

describe('areamap - data options translators', () => {
  describe('translateDataOptionsToInternal', () => {
    it('should return an object with geo and color properties', () => {
      const dataOptions: AreamapChartDataOptions = {
        geo: [
          {
            column: DM.Country.Country,
            isColored: false,
          },
        ],
        color: [
          {
            column: measureFactory.sum(DM.Commerce.Cost),
            color: {
              type: 'range',
              steps: 9,
              minColor: '#ffab03',
              maxColor: '#ff0000',
            },
          },
        ],
      };
      const result = dataOptionsTranslators.translateDataOptionsToInternal(dataOptions);
      expect(result).toMatchSnapshot();
    });
  });

  describe('getAttributes', () => {
    it('should return an attribute if geo.column is an attribute column', () => {
      const internalDataOptions: AreamapChartDataOptionsInternal = {
        geo: { column: DM.Commerce.AgeRange },
      };
      const result = dataOptionsTranslators.getAttributes(internalDataOptions);
      expect(result).toEqual([DM.Commerce.AgeRange]);
    });

    it('should return an empty array if geo.column is a measure column', () => {
      const internalDataOptions: AreamapChartDataOptionsInternal = {
        geo: { column: measureFactory.sum(DM.Commerce.Cost) },
      };
      const result = dataOptionsTranslators.getAttributes(internalDataOptions);
      expect(result).toEqual([]);
    });
  });

  describe('getMeasures', () => {
    it('should return the measure if color.column is a measure column', () => {
      const TotalCostMeasure = measureFactory.sum(DM.Commerce.Cost);
      const internalDataOptions: AreamapChartDataOptionsInternal = {
        geo: { column: DM.Country.Country },
        color: { column: TotalCostMeasure },
      };
      const result = dataOptionsTranslators.getMeasures(internalDataOptions);
      expect(result).toEqual([TotalCostMeasure]);
    });

    it('should return an empty array if color.column is not a measure column', () => {
      const internalDataOptions: AreamapChartDataOptionsInternal = {
        geo: { column: DM.Country.Country },
        color: { column: DM.Commerce.AgeRange },
      };
      const result = dataOptionsTranslators.getMeasures(internalDataOptions);
      expect(result).toEqual([]);
    });

    it('should return an empty array if color is undefined', () => {
      const internalDataOptions = { geo: { column: {} } } as any;
      const result = dataOptionsTranslators.getMeasures(internalDataOptions);
      expect(result).toEqual([]);
    });
  });

  describe('isCorrectDataOptions', () => {
    it('should return true if dataOptions has a geo property that is an array', () => {
      const dataOptions = { geo: [] };
      const result = dataOptionsTranslators.isCorrectDataOptions(dataOptions);
      expect(result).toBe(true);
    });

    it('should return false if geo property is missing', () => {
      const dataOptions = { notGeo: [] } as any;
      const result = dataOptionsTranslators.isCorrectDataOptions(dataOptions);
      expect(result).toBe(false);
    });

    it('should return false if geo is not an array', () => {
      const dataOptions = { geo: 'not an array' } as any;
      const result = dataOptionsTranslators.isCorrectDataOptions(dataOptions);
      expect(result).toBe(false);
    });
  });

  describe('isCorrectDataOptionsInternal', () => {
    it('should return true if internal data options has geo with a correct column', () => {
      const dataOptionsInternal: AreamapChartDataOptionsInternal = {
        geo: { column: DM.Country.Country },
      };
      const result = dataOptionsTranslators.isCorrectDataOptionsInternal(dataOptionsInternal);
      expect(result).toBe(true);
    });

    it('should return false if geo property is missing', () => {
      const dataOptionsInternal = {
        notGeo: { column: DM.Country.Country },
      } as unknown as AreamapChartDataOptionsInternal;
      const result = dataOptionsTranslators.isCorrectDataOptionsInternal(dataOptionsInternal);
      expect(result).toBe(false);
    });

    it('should return false if geo.column is falsy', () => {
      const dataOptionsInternal = {
        geo: { column: null },
      } as unknown as AreamapChartDataOptionsInternal;
      const result = dataOptionsTranslators.isCorrectDataOptionsInternal(dataOptionsInternal);
      expect(result).toBe(false);
    });
  });
});
