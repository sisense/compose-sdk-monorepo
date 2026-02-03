import { describe, expect, it } from 'vitest';

// <-- Update this import path to your actual file
import {
  legacyChartDataOptions as legacyChartDataOptionsMock,
  legacyChartOptions as legacyChartOptionsMock,
} from './__mocks__/indicator-mocks.js';
import {
  applyIndicatorRenderOptions,
  buildRenderOptionsFromLegacyOptions,
  IndicatorRenderOptions,
} from './indicator-render-options.js';

describe('indicator-render-options', () => {
  describe('buildRenderOptionsFromLegacyOptions', () => {
    it('should build merged IndicatorRenderOptions from legacy data and chart options', () => {
      const result = buildRenderOptionsFromLegacyOptions(
        legacyChartDataOptionsMock,
        legacyChartOptionsMock,
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('applyIndicatorRenderOptions', () => {
    it('should override legacyDataOptions and legacyChartOptions from indicatorRenderOptions', () => {
      const indicatorRenderOptions: IndicatorRenderOptions = {
        value: { data: 999, text: 'New Value', color: '#999999' },
        secondary: {
          data: 1000,
          text: 'New Secondary',
          color: '#123123',
          fontWeight: 'extra-bold',
        },
        title: { text: 'New Title', color: '#987987' },
        secondaryTitle: { text: 'New Secondary Title', color: '#555555' },
      };

      const {
        legacyDataOptions: customizedLegacyDataOptions,
        legacyChartOptions: customizedLegacyChartOptions,
      } = applyIndicatorRenderOptions(
        indicatorRenderOptions,
        legacyChartDataOptionsMock,
        legacyChartOptionsMock,
      );
      expect(customizedLegacyDataOptions).toMatchSnapshot();
      expect(customizedLegacyChartOptions).toMatchSnapshot();
    });
  });
});
