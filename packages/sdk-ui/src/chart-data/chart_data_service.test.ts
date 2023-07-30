import { ChartDataOptionsInternal } from '../chart-data-options/types';
import { DataTable } from '../chart-data-processor/table_processor';
import { chartDataService } from './chart_data_service';
import { indicatorData } from './indicator_data';
import { ChartType } from '../types';

jest.mock('./indicator_data'); // Mock the indicatorData module
jest.mock('./table_data'); // Mock the tableData module

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
