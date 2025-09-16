import { getAxes } from './axes';
import { BuildContext } from '../../../types';
import { getCartesianXAxis } from '../../helpers/highchart-options/axis';
import { getBasicYAxisSettings } from '../../helpers/highchart-options/y-axis';
import { withPolarSpecificAxisSettings } from '@/chart-options-processor/cartesian/utils/axis/axis-transformers';

// Mock dependencies
vi.mock('../../helpers/highchart-options/axis', () => ({
  getCartesianXAxis: vi.fn(),
}));

vi.mock('../../helpers/highchart-options/y-axis', () => ({
  getBasicYAxisSettings: vi.fn(),
}));

vi.mock('@/chart-options-processor/cartesian/utils/axis/axis-transformers', () => ({
  withPolarSpecificAxisSettings: vi.fn(),
}));

const mockedGetCartesianXAxis = vi.mocked(getCartesianXAxis);
const mockedGetBasicYAxisSettings = vi.mocked(getBasicYAxisSettings);
const mockedWithPolarSpecificAxisSettings = vi.mocked(withPolarSpecificAxisSettings);

describe('polar-chart axes', () => {
  const mockContext: BuildContext<'polar'> = {
    chartData: {
      type: 'cartesian',
      xValues: [],
      series: [],
      xAxisCount: 1,
    },
    dataOptions: {
      x: [{ column: { name: 'x', type: 'text' } }],
      y: [{ column: { name: 'y', type: 'number' } }],
      breakBy: [],
    },
    designOptions: {
      lineType: 'straight',
      legend: {
        enabled: true,
        position: 'bottom',
      },
      lineWidth: 2,
      valueLabel: {},
      marker: { enabled: false, size: 'small', fill: 'full' },
      xAxis: {
        type: 'linear',
        enabled: true,
        titleEnabled: false,
        title: null,
        gridLine: true,
        labels: true,
        min: null,
        max: null,
        tickInterval: null,
      },
      yAxis: {
        type: 'linear',
        enabled: true,
        titleEnabled: false,
        title: null,
        gridLine: true,
        labels: true,
        min: null,
        max: null,
        tickInterval: null,
      },
      autoZoom: { enabled: true },
      dataLimits: { seriesCapacity: 50, categoriesCapacity: 100000 },
      polarType: 'column',
      designPerSeries: {},
    },
    extraConfig: {
      translate: vi.fn() as any,
      themeSettings: {} as any,
      dateFormatter: vi.fn() as any,
      accessibilityEnabled: false,
    },
  };

  const mockXAxisSettings = [
    {
      type: 'linear',
      enabled: true,
      title: { text: 'X Axis' },
      categories: ['A', 'B', 'C'],
    },
  ];

  const mockYAxisSettings = [
    {
      type: 'linear',
      enabled: true,
      title: { text: null },
      min: 0,
      max: 100,
    },
  ];

  const mockPolarXAxisSettings = [
    {
      type: 'linear',
      enabled: true,
      title: { text: 'X Axis' },
      categories: ['A', 'B', 'C'],
      startOnTick: false,
      endOnTick: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockedGetCartesianXAxis.mockReturnValue(mockXAxisSettings as any);
    mockedGetBasicYAxisSettings.mockReturnValue(mockYAxisSettings as any);
    mockedWithPolarSpecificAxisSettings.mockReturnValue(mockPolarXAxisSettings as any);
  });

  describe('getAxes', () => {
    it('should generate axes for polar charts', () => {
      const result = getAxes(mockContext);

      expect(result).toEqual({
        xAxis: mockPolarXAxisSettings,
        yAxis: mockYAxisSettings,
      });
    });

    it('should call getCartesianXAxis with horizontal orientation', () => {
      getAxes(mockContext);

      expect(mockedGetCartesianXAxis).toHaveBeenCalledWith(mockContext, 'horizontal');
    });

    it('should call getBasicYAxisSettings with polar chart type', () => {
      getAxes(mockContext);

      expect(mockedGetBasicYAxisSettings).toHaveBeenCalledWith(mockContext, 'polar');
    });

    it('should apply polar-specific axis settings to X-axis', () => {
      getAxes(mockContext);

      expect(mockedWithPolarSpecificAxisSettings).toHaveBeenCalledWith(mockXAxisSettings);
    });

    it('should not modify Y-axis settings (handled at design options level)', () => {
      const result = getAxes(mockContext);

      // Y-axis should be returned as-is from getBasicYAxisSettings
      expect(result.yAxis).toBe(mockYAxisSettings);
      // Should not be passed through any polar-specific transformers
      expect(mockedWithPolarSpecificAxisSettings).not.toHaveBeenCalledWith(mockYAxisSettings);
    });

    it('should handle empty axis settings', () => {
      mockedGetCartesianXAxis.mockReturnValue([]);
      mockedGetBasicYAxisSettings.mockReturnValue([]);
      mockedWithPolarSpecificAxisSettings.mockReturnValue([]);

      const result = getAxes(mockContext);

      expect(result).toEqual({
        xAxis: [],
        yAxis: [],
      });
    });

    it('should handle multiple axis settings', () => {
      const multipleXAxis = [
        { type: 'linear', enabled: true, title: { text: 'X1' } },
        { type: 'linear', enabled: true, title: { text: 'X2' } },
      ];
      const multipleYAxis = [
        { type: 'linear', enabled: true, title: { text: null } },
        { type: 'linear', enabled: true, title: { text: null } },
      ];
      const polarMultipleXAxis = [
        { type: 'linear', enabled: true, title: { text: 'X1' }, startOnTick: false },
        { type: 'linear', enabled: true, title: { text: 'X2' }, startOnTick: false },
      ];

      mockedGetCartesianXAxis.mockReturnValue(multipleXAxis as any);
      mockedGetBasicYAxisSettings.mockReturnValue(multipleYAxis as any);
      mockedWithPolarSpecificAxisSettings.mockReturnValue(polarMultipleXAxis as any);

      const result = getAxes(mockContext);

      expect(result).toEqual({
        xAxis: polarMultipleXAxis,
        yAxis: multipleYAxis,
      });

      expect(mockedWithPolarSpecificAxisSettings).toHaveBeenCalledWith(multipleXAxis);
    });
  });
});
