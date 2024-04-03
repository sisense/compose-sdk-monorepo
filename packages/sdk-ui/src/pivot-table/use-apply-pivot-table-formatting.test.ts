import { renderHook } from '@testing-library/react';
import {
  EVENT_DATA_CELL_FORMAT,
  EVENT_HEADER_CELL_FORMAT,
  type DataService,
} from '@sisense/sdk-pivot-client';
import { ClientApplication } from '../app/client-application';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context';
import { useApplyPivotTableFormatting } from './use-apply-pivot-table-formatting';
import { type PivotTableDataOptions } from '..';

vi.mock('../sisense-context/sisense-context');

const dataCellFormatterMock = vi.fn();
vi.mock('./formatters/data-cell-formatters', () => ({
  createDataCellValueFormatter: vi.fn(() => dataCellFormatterMock),
}));

const headerCellFormatterMock = vi.fn();
vi.mock('./formatters/header-cell-formatters', () => ({
  createHeaderCellValueFormatter: vi.fn(() => headerCellFormatterMock),
}));

const DataServiceMock = {
  on: vi.fn<Parameters<DataService['on']>>(),
  off: vi.fn<Parameters<DataService['off']>>(),
};

describe('useApplyPivotTableFormatting', () => {
  const dataService = DataServiceMock as unknown as DataService;
  const dataOptions = {} as PivotTableDataOptions;

  beforeEach(() => {
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      enableTracking: false,
    });
    DataServiceMock.on.mockClear();
    dataCellFormatterMock.mockClear();
    headerCellFormatterMock.mockClear();
  });

  it('should run data cell value formatter', () => {
    renderHook(() => useApplyPivotTableFormatting({ dataService, dataOptions }));

    const [event, handler] = DataServiceMock.on.mock.calls[0];
    expect(event).toBe(EVENT_DATA_CELL_FORMAT);

    handler();

    expect(dataCellFormatterMock).toHaveBeenCalledTimes(1);
  });

  it('should run header cell value formatter', () => {
    renderHook(() => useApplyPivotTableFormatting({ dataService, dataOptions }));

    const [event, handler] = DataServiceMock.on.mock.calls[1];
    expect(event).toBe(EVENT_HEADER_CELL_FORMAT);

    handler();

    expect(headerCellFormatterMock).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe from all events', () => {
    renderHook(() => useApplyPivotTableFormatting({ dataService, dataOptions }));

    const [eventDataCellFormat] = DataServiceMock.off.mock.calls[0];
    expect(eventDataCellFormat).toBe(EVENT_DATA_CELL_FORMAT);

    const [eventHeaderCellFormat] = DataServiceMock.off.mock.calls[1];
    expect(eventHeaderCellFormat).toBe(EVENT_HEADER_CELL_FORMAT);
  });
});
