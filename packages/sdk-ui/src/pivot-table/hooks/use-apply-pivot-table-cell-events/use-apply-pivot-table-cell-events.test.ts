/* eslint-disable sonarjs/no-identical-functions */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { getDataPointMetadata } from '@/chart-options-processor/data-points';
import { useApplyPivotTableCellEvents } from './use-apply-pivot-table-cell-events';
import {
  createMockDataOptions,
  createMockCellPayload,
  createMockTreeNode,
} from './__test-helpers__/pivot-cell-payload-mock';
import { PivotTableCellPayload, RowDataNode, ColumnDataNode, ValueDataNode } from './types';

// Mock the getDataPointMetadata function
vi.mock('@/chart-options-processor/data-points', () => ({
  getDataPointMetadata: vi.fn(),
}));

describe('useApplyPivotTableCellEvents', () => {
  const mockGetDataPointMetadata = vi.mocked(getDataPointMetadata);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDataPointMetadata.mockImplementation((id, dataOption) => ({
      id,
      dataOption,
    }));
  });

  it('should call onDataPointClick for click events', () => {
    const dataOptions = createMockDataOptions();
    const onDataPointClick = vi.fn();
    const onDataPointContextMenu = vi.fn();

    const { result } = renderHook(() =>
      useApplyPivotTableCellEvents({
        dataOptions,
        onDataPointClick,
        onDataPointContextMenu,
      }),
    );

    const payload = createMockCellPayload('click');

    act(() => {
      result.current.handlePivotTableCellClick(payload);
    });

    expect(onDataPointClick).toHaveBeenCalledTimes(1);
    expect(onDataPointContextMenu).not.toHaveBeenCalled();

    const [dataPoint, event] = onDataPointClick.mock.calls[0];
    expect(dataPoint).toEqual(
      expect.objectContaining({
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: expect.objectContaining({
          rows: expect.any(Array),
          columns: expect.any(Array),
          values: expect.any(Array),
        }),
      }),
    );
    expect(event).toBe(payload.event);
  });

  it('should call onDataPointContextMenu for contextmenu events', () => {
    const dataOptions = createMockDataOptions();
    const onDataPointClick = vi.fn();
    const onDataPointContextMenu = vi.fn();

    const { result } = renderHook(() =>
      useApplyPivotTableCellEvents({
        dataOptions,
        onDataPointClick,
        onDataPointContextMenu,
      }),
    );

    const payload = createMockCellPayload('contextmenu');

    act(() => {
      result.current.handlePivotTableCellClick(payload);
    });

    expect(onDataPointContextMenu).toHaveBeenCalledTimes(1);
    expect(onDataPointClick).not.toHaveBeenCalled();

    const [dataPoint, event] = onDataPointContextMenu.mock.calls[0];
    expect(dataPoint).toEqual(
      expect.objectContaining({
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
      }),
    );
    expect(event).toBe(payload.event);
  });

  it('should transform cell payload to data point correctly', () => {
    const dataOptions = createMockDataOptions();
    const onDataPointClick = vi.fn();

    const { result } = renderHook(() =>
      useApplyPivotTableCellEvents({
        dataOptions,
        onDataPointClick,
      }),
    );

    const rowParent = createMockTreeNode('Electronics', 'Electronics', 0, 'rows', 'data');
    const rowTreeNode = createMockTreeNode(
      'Laptops',
      'Laptops',
      1,
      'rows',
      'data',
      undefined,
      rowParent,
    );
    const columnParent = createMockTreeNode('2023', '2023', 0, 'columns', 'data');
    const columnTreeNode = createMockTreeNode(
      'Q1',
      'Q1',
      1,
      'columns',
      'data',
      undefined,
      columnParent,
    );
    const measureTreeNode = createMockTreeNode<ValueDataNode>(
      'Sales',
      '$50,000',
      0,
      'measures',
      'measureBottom',
      0,
    );

    const dataNode = createMockTreeNode<ValueDataNode>('50000', '$50,000', 0, 'values', 'data', 0);

    const payload: PivotTableCellPayload = {
      dataNode,
      rowTreeNode: rowTreeNode as RowDataNode,
      columnTreeNode: columnTreeNode as ColumnDataNode,
      measureTreeNode,
      isDataCell: true,
      event: new MouseEvent('click'),
    };

    act(() => {
      result.current.handlePivotTableCellClick(payload);
    });

    expect(onDataPointClick).toHaveBeenCalledTimes(1);
    const [dataPoint] = onDataPointClick.mock.calls[0];

    expect(dataPoint.isDataCell).toBe(true);
    expect(dataPoint.isCaptionCell).toBe(false);
    expect(dataPoint.isTotalCell).toBe(false);
    expect(dataPoint.entries.rows).toHaveLength(2);
    expect(dataPoint.entries.columns).toHaveLength(2);
    expect(dataPoint.entries.values).toHaveLength(1);
  });
});
