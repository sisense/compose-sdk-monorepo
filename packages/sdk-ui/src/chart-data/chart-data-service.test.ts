import { ChartDataOptionsInternal } from '../chart-data-options/types';
import { DataTable } from '../chart-data-processor/table-processor';
import { chartDataService } from './chart-data-service';
import { indicatorData } from './indicator-data';
import { ChartType } from '../types';

vi.mock('./indicator-data'); // Mock the indicatorData module
vi.mock('./table-data'); // Mock the tableData module

describe('chartDataService', () => {
  it("should call indicatorData() if chartType is 'indicator'", () => {
    const chartType = 'indicator';
    const chartDataOptionsMock: ChartDataOptionsInternal = {};
    const dataTableMock: DataTable = {
      columns: [],
      rows: [],
    };

    chartDataService(chartType, chartDataOptionsMock, dataTableMock);

    expect(indicatorData).toHaveBeenCalledWith(chartDataOptionsMock, dataTableMock);
  });

  it('should throw error on unsupported chartType', () => {
    const chartType = 'pivot';
    const chartDataOptionsMock: ChartDataOptionsInternal = {};
    const dataTableMock: DataTable = {
      columns: [],
      rows: [],
    };

    let isErrorThrew = false;
    try {
      chartDataService(chartType as ChartType, chartDataOptionsMock, dataTableMock);
    } catch (e) {
      isErrorThrew = true;
    }

    expect(isErrorThrew).toBeTruthy();
  });
});
