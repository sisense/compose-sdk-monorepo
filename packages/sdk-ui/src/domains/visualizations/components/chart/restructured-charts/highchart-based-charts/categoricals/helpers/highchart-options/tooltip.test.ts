import { getCategoryTooltipSettings } from '@/domains/visualizations/core/chart-options-processor/tooltip.js';
import { TooltipSettings } from '@/domains/visualizations/core/chart-options-processor/translations/tooltip-utils.js';

import { BuildContext } from '../../../types.js';
import { getBasicCategoricalTooltip } from './tooltip.js';

// Mock the getCategoryTooltipSettings function
vi.mock('@/domains/visualizations/core/chart-options-processor/tooltip', () => ({
  getCategoryTooltipSettings: vi.fn(),
}));

const mockGetCategoryTooltipSettings = vi.mocked(getCategoryTooltipSettings);

describe('tooltip.ts', () => {
  describe('getBasicCategoricalTooltip', () => {
    const mockDataOptions = {
      y: [],
      breakBy: [],
    };

    const createMockBuildContext = (
      showDecimals?: boolean,
      dataOptionsOverride: any = mockDataOptions,
    ): BuildContext<'pie'> => ({
      chartData: {
        type: 'categorical' as const,
        series: [],
        xAxisCount: 1,
        xValues: [],
      },
      dataOptions: dataOptionsOverride,
      designOptions: {
        seriesLabels: {
          enabled: true,
          showCategory: true,
          showValue: true,
          percentageLabels: {
            enabled: true,
            showDecimals: showDecimals ?? false,
          },
        },
        pieType: 'classic' as const,
        legend: 'bottom' as const,
        valueLabel: {},
        lineType: 'smooth' as const,
        lineWidth: {},
        markers: {},
        y2Axis: {},
        xAxis: {},
        yAxis: {},
        convolution: {},
        panel: {},
      } as any,
      extraConfig: {
        translate: vi.fn((key: string) => key) as any,
        themeSettings: {} as any,
        dateFormatter: vi.fn(),
        accessibilityEnabled: false,
      },
    });

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call getCategoryTooltipSettings with showDecimals true and dataOptions', () => {
      const expectedTooltipSettings: TooltipSettings = {
        animation: false,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
      };

      mockGetCategoryTooltipSettings.mockReturnValue(expectedTooltipSettings);

      const ctx = createMockBuildContext(true);
      const result = getBasicCategoricalTooltip(ctx);

      expect(mockGetCategoryTooltipSettings).toHaveBeenCalledWith(true, mockDataOptions);
      expect(result).toEqual(expectedTooltipSettings);
    });

    it('should call getCategoryTooltipSettings with showDecimals false and dataOptions', () => {
      const expectedTooltipSettings: TooltipSettings = {
        animation: false,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
      };

      mockGetCategoryTooltipSettings.mockReturnValue(expectedTooltipSettings);

      const ctx = createMockBuildContext(false);
      const result = getBasicCategoricalTooltip(ctx);

      expect(mockGetCategoryTooltipSettings).toHaveBeenCalledWith(false, mockDataOptions);
      expect(result).toEqual(expectedTooltipSettings);
    });

    it('should call getCategoryTooltipSettings with undefined showDecimals when pieLabels is undefined', () => {
      const expectedTooltipSettings: TooltipSettings = {
        animation: false,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
      };

      mockGetCategoryTooltipSettings.mockReturnValue(expectedTooltipSettings);

      const ctx = createMockBuildContext(undefined);
      const result = getBasicCategoricalTooltip(ctx);

      expect(mockGetCategoryTooltipSettings).toHaveBeenCalledWith(false, mockDataOptions);
      expect(result).toEqual(expectedTooltipSettings);
    });

    it('should call getCategoryTooltipSettings with showDecimals false when pieLabels has showDecimals false', () => {
      const expectedTooltipSettings: TooltipSettings = {
        animation: false,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
      };

      mockGetCategoryTooltipSettings.mockReturnValue(expectedTooltipSettings);

      const ctx: BuildContext<'pie'> = {
        chartData: {
          type: 'categorical' as const,
          series: [],
          xAxisCount: 1,
          xValues: [],
        },
        dataOptions: mockDataOptions,
        designOptions: {
          seriesLabels: {
            enabled: true,
            showCategory: true,
            showValue: true,
            percentageLabels: {
              enabled: true,
              showDecimals: false,
            },
          },
          pieType: 'classic' as const,
          legend: 'bottom' as const,
          valueLabel: {},
          lineType: 'smooth' as const,
          lineWidth: {},
          markers: {},
          y2Axis: {},
          xAxis: {},
          yAxis: {},
          convolution: {},
          panel: {},
        } as any,
        extraConfig: {
          translate: vi.fn((key: string) => key) as any,
          themeSettings: {} as any,
          dateFormatter: vi.fn(),
          accessibilityEnabled: false,
        },
      };

      const result = getBasicCategoricalTooltip(ctx);

      expect(mockGetCategoryTooltipSettings).toHaveBeenCalledWith(false, mockDataOptions);
      expect(result).toEqual(expectedTooltipSettings);
    });

    it('should pass through the exact dataOptions from the context', () => {
      const customDataOptions = {
        y: [] as any[],
        breakBy: [] as any[],
        seriesToColorMap: new Map(),
      };

      const expectedTooltipSettings: TooltipSettings = {
        animation: false,
        backgroundColor: '#ffffff',
      };

      mockGetCategoryTooltipSettings.mockReturnValue(expectedTooltipSettings);

      const ctx = createMockBuildContext(true, customDataOptions);
      const result = getBasicCategoricalTooltip(ctx);

      expect(mockGetCategoryTooltipSettings).toHaveBeenCalledWith(true, customDataOptions);
      expect(result).toEqual(expectedTooltipSettings);
    });

    it('should return TooltipSettings type', () => {
      const expectedTooltipSettings: TooltipSettings = {
        animation: false,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
        formatter: vi.fn(),
      };

      mockGetCategoryTooltipSettings.mockReturnValue(expectedTooltipSettings);

      const ctx = createMockBuildContext(true);
      const result: TooltipSettings = getBasicCategoricalTooltip(ctx);

      // Type assertions to ensure the function returns the correct type
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('animation');
      expect(result).toHaveProperty('backgroundColor');
    });

    it('should handle all possible tooltip settings returned by getCategoryTooltipSettings', () => {
      const fullTooltipSettings: TooltipSettings = {
        enabled: true,
        animation: false,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
        crosshairs: false,
        shared: true,
        formatter: vi.fn(),
        style: {
          fontFamily: 'Arial',
        },
        padding: 8,
        outside: false,
      };

      mockGetCategoryTooltipSettings.mockReturnValue(fullTooltipSettings);

      const ctx = createMockBuildContext(true);
      const result = getBasicCategoricalTooltip(ctx);

      expect(result).toEqual(fullTooltipSettings);
      expect(result.enabled).toBe(true);
      expect(result.animation).toBe(false);
      expect(result.backgroundColor).toBe('#ffffff');
      expect(result.borderColor).toBe('#cccccc');
      expect(result.borderRadius).toBe(10);
      expect(result.borderWidth).toBe(1);
      expect(result.useHTML).toBe(true);
      expect(result.crosshairs).toBe(false);
      expect(result.shared).toBe(true);
      expect(result.formatter).toBeDefined();
      expect(result.style?.fontFamily).toBe('Arial');
      expect(result.padding).toBe(8);
      expect(result.outside).toBe(false);
    });

    describe('function delegation behavior', () => {
      it('should be a pure function that delegates to getCategoryTooltipSettings', () => {
        const mockResult: TooltipSettings = { animation: false };
        mockGetCategoryTooltipSettings.mockReturnValue(mockResult);

        const ctx = createMockBuildContext(true);
        const result = getBasicCategoricalTooltip(ctx);

        expect(mockGetCategoryTooltipSettings).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockResult); // Should return exact same reference
      });

      it('should extract showDecimals correctly from nested pieLabels property', () => {
        mockGetCategoryTooltipSettings.mockReturnValue({ animation: false });

        const ctx = createMockBuildContext(true);
        getBasicCategoricalTooltip(ctx);

        const [showDecimalsArg] = mockGetCategoryTooltipSettings.mock.calls[0];
        expect(showDecimalsArg).toBe(true);
      });

      it('should pass dataOptions as second parameter', () => {
        mockGetCategoryTooltipSettings.mockReturnValue({ animation: false });

        const ctx = createMockBuildContext(true);
        getBasicCategoricalTooltip(ctx);

        const [, dataOptionsArg] = mockGetCategoryTooltipSettings.mock.calls[0];
        expect(dataOptionsArg).toBe(ctx.dataOptions);
      });
    });
  });
});
