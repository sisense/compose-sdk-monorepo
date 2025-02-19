import { renderHook } from '@testing-library/react';
import {
  EVENT_DATA_CELL_FORMAT,
  EVENT_HEADER_CELL_FORMAT,
  type DataService,
} from '@sisense/sdk-pivot-client';

import { useApplyPivotTableFormatting } from './use-apply-pivot-table-formatting';
import { useSisenseContextMock } from '@/sisense-context/__mocks__/sisense-context';
import type { PivotTableDataOptions } from '@/chart-data-options/types';
import type { ClientApplication } from '@/app/client-application';

vi.mock('@/sisense-context/sisense-context');

const dataCellFormatterMock = vi.fn();
vi.mock('../formatters/data-cell-formatters', () => ({
  createDataCellValueFormatter: vi.fn(() => dataCellFormatterMock),
}));

const headerCellFormatterMock = vi.fn();
vi.mock('../formatters/header-cell-formatters', () => ({
  createHeaderCellValueFormatter: vi.fn(() => headerCellFormatterMock),
}));

const DataServiceMock = {
  on: vi.fn(),
  off: vi.fn(),
};

describe('useApplyPivotTableFormatting', () => {
  const dataService = DataServiceMock as unknown as DataService;
  const dataOptions = {} as PivotTableDataOptions;

  beforeEach(() => {
    useSisenseContextMock.mockReturnValue({
      app: { settings: { trackingConfig: { enabled: false } } } as ClientApplication,
      isInitialized: true,
    });
    DataServiceMock.on.mockClear();
    dataCellFormatterMock.mockClear();
    headerCellFormatterMock.mockClear();
  });

  it('should run data cell value formatter', () => {
    expect(dataCellFormatterMock).toHaveBeenCalledTimes(0);
    expect(headerCellFormatterMock).toHaveBeenCalledTimes(0);

    renderHook(() => useApplyPivotTableFormatting({ dataService, dataOptions }));
    const cell = {};

    const [event, handler] = DataServiceMock.on.mock.calls[0];
    expect(event).toBe(EVENT_DATA_CELL_FORMAT);

    handler(cell, {}, {});

    expect(dataCellFormatterMock).toHaveBeenCalledTimes(1);
  });

  it('should run header cell value formatter', () => {
    expect(dataCellFormatterMock).toHaveBeenCalledTimes(0);
    expect(headerCellFormatterMock).toHaveBeenCalledTimes(0);

    const cell = {};
    renderHook(() => useApplyPivotTableFormatting({ dataService, dataOptions }));

    const [event, handler] = DataServiceMock.on.mock.calls[1];
    expect(event).toBe(EVENT_HEADER_CELL_FORMAT);

    handler(cell);

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
