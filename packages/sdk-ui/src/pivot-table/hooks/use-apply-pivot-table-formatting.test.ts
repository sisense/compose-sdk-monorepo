import { renderHook } from '@testing-library/react';
import {
  EVENT_DATA_CELL_FORMAT,
  EVENT_HEADER_CELL_FORMAT,
  type DataService,
} from '@sisense/sdk-pivot-client';

import { useApplyPivotTableFormatting } from './use-apply-pivot-table-formatting';
import { useSisenseContextMock } from '@/sisense-context/__mocks__/sisense-context';
import type { PivotTableDataOptionsInternal } from '@/chart-data-options/types';
import type { ClientApplication } from '@/app/client-application';
import type {
  CustomDataCellFormatter,
  CustomHeaderCellFormatter,
} from '@/pivot-table/formatters/types';

vi.mock('@/sisense-context/sisense-context');

const dataCellFormatterMock = vi.fn();
vi.mock('../formatters/data-cell-formatters', () => ({
  createDataCellValueFormatter: vi.fn(() => dataCellFormatterMock),
}));

const headerCellFormatterMock = vi.fn();
vi.mock('../formatters/header-cell-formatters', () => ({
  createHeaderCellValueFormatter: vi.fn(() => headerCellFormatterMock),
}));

const unifiedDataCellFormatterMock = vi.fn();
const unifiedHeaderCellFormatterMock = vi.fn();
vi.mock('../formatters/formatter-utils', () => ({
  createUnifiedDataCellFormatter: vi.fn(() => unifiedDataCellFormatterMock),
  createUnifiedHeaderCellFormatter: vi.fn(() => unifiedHeaderCellFormatterMock),
}));

const DataServiceMock = {
  on: vi.fn(),
  off: vi.fn(),
};

describe('useApplyPivotTableFormatting', () => {
  const dataService = DataServiceMock as unknown as DataService;
  const dataOptions = {} as PivotTableDataOptionsInternal;

  beforeEach(() => {
    useSisenseContextMock.mockReturnValue({
      app: { settings: { trackingConfig: { enabled: false } } } as ClientApplication,
      isInitialized: true,
    });
    DataServiceMock.on.mockClear();
    DataServiceMock.off.mockClear();
    dataCellFormatterMock.mockClear();
    headerCellFormatterMock.mockClear();
    unifiedDataCellFormatterMock.mockClear();
    unifiedHeaderCellFormatterMock.mockClear();
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
    const { unmount } = renderHook(() =>
      useApplyPivotTableFormatting({ dataService, dataOptions }),
    );

    // Unmount to trigger cleanup
    unmount();

    const [eventDataCellFormat] = DataServiceMock.off.mock.calls[0];
    expect(eventDataCellFormat).toBe(EVENT_DATA_CELL_FORMAT);

    const [eventHeaderCellFormat] = DataServiceMock.off.mock.calls[1];
    expect(eventHeaderCellFormat).toBe(EVENT_HEADER_CELL_FORMAT);
  });

  describe('with custom data cell formatter', () => {
    it('should include custom data cell formatter in the formatting pipeline', () => {
      const customDataCellFormatter: CustomDataCellFormatter = vi.fn();

      renderHook(() =>
        useApplyPivotTableFormatting({
          dataService,
          dataOptions,
          onDataCellFormat: customDataCellFormatter,
        }),
      );

      const cell = {};
      const [event, handler] = DataServiceMock.on.mock.calls[0];
      expect(event).toBe(EVENT_DATA_CELL_FORMAT);

      handler(cell, {}, {});

      // Should call both the default formatter and the unified custom formatter
      expect(dataCellFormatterMock).toHaveBeenCalledTimes(1);
      expect(unifiedDataCellFormatterMock).toHaveBeenCalledTimes(1);
    });

    it('should not include custom data cell formatter when not provided', () => {
      renderHook(() => useApplyPivotTableFormatting({ dataService, dataOptions }));

      const cell = {};
      const [, handler] = DataServiceMock.on.mock.calls[0];
      handler(cell, {}, {});

      expect(dataCellFormatterMock).toHaveBeenCalledTimes(1);
      expect(unifiedDataCellFormatterMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('with custom header cell formatter', () => {
    it('should include custom header cell formatter in the formatting pipeline', () => {
      const customHeaderCellFormatter: CustomHeaderCellFormatter = vi.fn();

      renderHook(() =>
        useApplyPivotTableFormatting({
          dataService,
          dataOptions,
          onHeaderCellFormat: customHeaderCellFormatter,
        }),
      );

      const cell = {};
      const [event, handler] = DataServiceMock.on.mock.calls[1];
      expect(event).toBe(EVENT_HEADER_CELL_FORMAT);

      handler(cell);

      // Should call both the default formatter and the unified custom formatter
      expect(headerCellFormatterMock).toHaveBeenCalledTimes(1);
      expect(unifiedHeaderCellFormatterMock).toHaveBeenCalledTimes(1);
    });

    it('should not include custom header cell formatter when not provided', () => {
      renderHook(() => useApplyPivotTableFormatting({ dataService, dataOptions }));

      const cell = {};
      const [, handler] = DataServiceMock.on.mock.calls[1];
      handler(cell);

      expect(headerCellFormatterMock).toHaveBeenCalledTimes(1);
      expect(unifiedHeaderCellFormatterMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('with both custom formatters', () => {
    it('should include both custom formatters in their respective pipelines', () => {
      const customDataCellFormatter: CustomDataCellFormatter = vi.fn();
      const customHeaderCellFormatter: CustomHeaderCellFormatter = vi.fn();

      renderHook(() =>
        useApplyPivotTableFormatting({
          dataService,
          dataOptions,
          onDataCellFormat: customDataCellFormatter,
          onHeaderCellFormat: customHeaderCellFormatter,
        }),
      );

      // Test data cell formatting
      const dataCell = {};
      const [dataEvent, dataHandler] = DataServiceMock.on.mock.calls[0];
      expect(dataEvent).toBe(EVENT_DATA_CELL_FORMAT);
      dataHandler(dataCell, {}, {});

      // Test header cell formatting
      const headerCell = {};
      const [headerEvent, headerHandler] = DataServiceMock.on.mock.calls[1];
      expect(headerEvent).toBe(EVENT_HEADER_CELL_FORMAT);
      headerHandler(headerCell);

      expect(dataCellFormatterMock).toHaveBeenCalledTimes(1);
      expect(unifiedDataCellFormatterMock).toHaveBeenCalledTimes(1);
      expect(headerCellFormatterMock).toHaveBeenCalledTimes(1);
      expect(unifiedHeaderCellFormatterMock).toHaveBeenCalledTimes(1);
    });
  });
});
