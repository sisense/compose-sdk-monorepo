import { loadDataBySingleQuery } from '../../../../helpers/data-loading';
import { getCartesianChartData } from '../../helpers/data';
import { dataTranslators } from './index';

// Mock the helper functions
vi.mock('../../../../helpers/data-loading', () => ({
  loadDataBySingleQuery: vi.fn(),
}));

vi.mock('../../helpers/data', () => ({
  getCartesianChartData: vi.fn(),
}));

describe('polar-chart data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dataTranslators', () => {
    it('should export the correct data translator functions', () => {
      expect(dataTranslators).toEqual({
        loadData: loadDataBySingleQuery,
        getChartData: getCartesianChartData,
      });
    });

    it('should use cartesian data translators for polar charts', () => {
      // Verify that polar charts reuse cartesian chart data logic
      expect(dataTranslators.loadData).toBe(loadDataBySingleQuery);
      expect(dataTranslators.getChartData).toBe(getCartesianChartData);
    });

    it('should delegate loadData calls to loadDataBySingleQuery', () => {
      const mockQueryParams = {
        dataSource: 'mock-datasource',
        attributes: [],
        measures: [],
        filters: [],
      };

      dataTranslators.loadData(mockQueryParams as any);
      expect(loadDataBySingleQuery).toHaveBeenCalledWith(mockQueryParams);
    });

    it('should delegate getChartData calls to getCartesianChartData', () => {
      const mockQueryResult = { data: [], columns: [] };
      const mockDataOptions = { x: [], y: [], breakBy: [] };

      dataTranslators.getChartData(mockQueryResult as any, mockDataOptions as any);
      expect(getCartesianChartData).toHaveBeenCalledWith(mockQueryResult, mockDataOptions);
    });
  });
});
