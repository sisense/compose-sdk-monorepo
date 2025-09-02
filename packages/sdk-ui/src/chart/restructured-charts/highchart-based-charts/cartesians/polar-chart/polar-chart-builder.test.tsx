// Mock dependencies first, before imports
vi.mock('./data-options', () => ({
  dataOptionsTranslators: {
    translateDataOptionsToInternal: vi.fn(),
    getAttributes: vi.fn(),
    getMeasures: vi.fn(),
    isCorrectDataOptions: vi.fn(),
    isCorrectDataOptionsInternal: vi.fn(),
  },
}));

vi.mock('./data', () => ({
  dataTranslators: {
    loadData: vi.fn(),
    getChartData: vi.fn(),
  },
}));

vi.mock('./design-options', () => ({
  designOptionsTranslators: {
    translateStyleOptionsToDesignOptions: vi.fn(),
    isCorrectStyleOptions: vi.fn(),
  },
}));

vi.mock('../../highcharts-based-chart-renderer/highcharts-based-chart-renderer', () => {
  const mockChartRenderer = vi.fn();
  return {
    createHighchartsBasedChartRenderer: vi.fn(() => mockChartRenderer),
    isHighchartsBasedChartRendererProps: vi.fn(),
  };
});

vi.mock('./highchart-options/highcharts-options-builder', () => ({
  polarHighchartsOptionsBuilder: {
    getChart: vi.fn(),
    getSeries: vi.fn(),
    getAxes: vi.fn(),
    getLegend: vi.fn(),
    getPlotOptions: vi.fn(),
    getTooltip: vi.fn(),
    getExtras: vi.fn(),
  },
}));

vi.mock('../helpers/alerts', () => ({
  getCommonCartesianAlerts: vi.fn(),
}));

// Import after mocking
import { polarChartBuilder } from './polar-chart-builder';
import { dataOptionsTranslators } from './data-options';
import { dataTranslators } from './data';
import { designOptionsTranslators } from './design-options';
import { isHighchartsBasedChartRendererProps } from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';

describe('polar-chart-builder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('polarChartBuilder structure', () => {
    it('should have the correct structure for a ChartBuilder', () => {
      expect(polarChartBuilder).toHaveProperty('dataOptions');
      expect(polarChartBuilder).toHaveProperty('data');
      expect(polarChartBuilder).toHaveProperty('designOptions');
      expect(polarChartBuilder).toHaveProperty('renderer');
    });

    it('should reference the correct data options translators', () => {
      expect(polarChartBuilder.dataOptions).toBe(dataOptionsTranslators);
    });

    it('should reference the correct data translators', () => {
      expect(polarChartBuilder.data).toBe(dataTranslators);
    });

    it('should reference the correct design options translators', () => {
      expect(polarChartBuilder.designOptions).toBe(designOptionsTranslators);
    });
  });

  describe('renderer configuration', () => {
    it('should have the correct renderer structure', () => {
      expect(polarChartBuilder.renderer).toHaveProperty('ChartRendererComponent');
      expect(polarChartBuilder.renderer).toHaveProperty('isCorrectRendererProps');
    });

    it('should use the correct renderer props validator', () => {
      expect(polarChartBuilder.renderer.isCorrectRendererProps).toBe(
        isHighchartsBasedChartRendererProps,
      );
    });
  });

  describe('data options integration', () => {
    it('should expose all required data options methods', () => {
      expect(polarChartBuilder.dataOptions).toHaveProperty('translateDataOptionsToInternal');
      expect(polarChartBuilder.dataOptions).toHaveProperty('getAttributes');
      expect(polarChartBuilder.dataOptions).toHaveProperty('getMeasures');
      expect(polarChartBuilder.dataOptions).toHaveProperty('isCorrectDataOptions');
      expect(polarChartBuilder.dataOptions).toHaveProperty('isCorrectDataOptionsInternal');
    });

    it('should delegate data options calls to the correct translators', () => {
      const mockDataOptions = { x: [], y: [], breakBy: [] };

      // Test method delegation
      polarChartBuilder.dataOptions.translateDataOptionsToInternal(mockDataOptions as any);
      expect(dataOptionsTranslators.translateDataOptionsToInternal).toHaveBeenCalledWith(
        mockDataOptions,
      );

      polarChartBuilder.dataOptions.getAttributes(mockDataOptions as any);
      expect(dataOptionsTranslators.getAttributes).toHaveBeenCalledWith(mockDataOptions);

      polarChartBuilder.dataOptions.getMeasures(mockDataOptions as any);
      expect(dataOptionsTranslators.getMeasures).toHaveBeenCalledWith(mockDataOptions);

      polarChartBuilder.dataOptions.isCorrectDataOptions(mockDataOptions as any);
      expect(dataOptionsTranslators.isCorrectDataOptions).toHaveBeenCalledWith(mockDataOptions);

      polarChartBuilder.dataOptions.isCorrectDataOptionsInternal(mockDataOptions as any);
      expect(dataOptionsTranslators.isCorrectDataOptionsInternal).toHaveBeenCalledWith(
        mockDataOptions,
      );
    });
  });

  describe('data integration', () => {
    it('should expose all required data methods', () => {
      expect(polarChartBuilder.data).toHaveProperty('loadData');
      expect(polarChartBuilder.data).toHaveProperty('getChartData');
    });

    it('should delegate data calls to the correct translators', () => {
      const mockQueryParams = { dataSource: 'test' };
      const mockQueryResult = { data: [], columns: [] };
      const mockDataOptions = { x: [], y: [], breakBy: [] };

      // Test method delegation
      polarChartBuilder.data.loadData(mockQueryParams as any);
      expect(dataTranslators.loadData).toHaveBeenCalledWith(mockQueryParams);

      polarChartBuilder.data.getChartData(mockQueryResult as any, mockDataOptions as any);
      expect(dataTranslators.getChartData).toHaveBeenCalledWith(mockQueryResult, mockDataOptions);
    });
  });

  describe('design options integration', () => {
    it('should expose all required design options methods', () => {
      expect(polarChartBuilder.designOptions).toHaveProperty(
        'translateStyleOptionsToDesignOptions',
      );
      expect(polarChartBuilder.designOptions).toHaveProperty('isCorrectStyleOptions');
    });

    it('should delegate design options calls to the correct translators', () => {
      const mockStyleOptions = { subtype: 'polar/column' };
      const mockDataOptions = { x: [], y: [], breakBy: [] };

      // Test method delegation
      polarChartBuilder.designOptions.translateStyleOptionsToDesignOptions(
        mockStyleOptions as any,
        mockDataOptions as any,
      );
      expect(designOptionsTranslators.translateStyleOptionsToDesignOptions).toHaveBeenCalledWith(
        mockStyleOptions,
        mockDataOptions,
      );

      polarChartBuilder.designOptions.isCorrectStyleOptions(mockStyleOptions as any);
      expect(designOptionsTranslators.isCorrectStyleOptions).toHaveBeenCalledWith(mockStyleOptions);
    });
  });

  describe('chart renderer integration', () => {
    it('should use the highcharts-based chart renderer props validator', () => {
      expect(polarChartBuilder.renderer.isCorrectRendererProps).toBe(
        isHighchartsBasedChartRendererProps,
      );
    });

    it('should expose the created chart renderer component', () => {
      expect(typeof polarChartBuilder.renderer.ChartRendererComponent).toBe('function');
    });
  });

  describe('type conformance', () => {
    it('should conform to ChartBuilder<"polar"> interface', () => {
      // This test ensures that the builder has the correct TypeScript type
      // The test will fail at compile time if the structure is incorrect

      // Verify the structure matches the expected ChartBuilder interface
      const builder = polarChartBuilder;

      // These should all exist and be the correct types
      expect(typeof builder.dataOptions.translateDataOptionsToInternal).toBe('function');
      expect(typeof builder.dataOptions.getAttributes).toBe('function');
      expect(typeof builder.dataOptions.getMeasures).toBe('function');
      expect(typeof builder.dataOptions.isCorrectDataOptions).toBe('function');
      expect(typeof builder.dataOptions.isCorrectDataOptionsInternal).toBe('function');

      expect(typeof builder.data.loadData).toBe('function');
      expect(typeof builder.data.getChartData).toBe('function');

      expect(typeof builder.designOptions.translateStyleOptionsToDesignOptions).toBe('function');
      expect(typeof builder.designOptions.isCorrectStyleOptions).toBe('function');

      expect(typeof builder.renderer.ChartRendererComponent).toBe('function');
      expect(typeof builder.renderer.isCorrectRendererProps).toBe('function');
    });
  });
});
