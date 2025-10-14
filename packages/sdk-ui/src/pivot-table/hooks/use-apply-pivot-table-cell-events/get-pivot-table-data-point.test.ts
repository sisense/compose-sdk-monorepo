/* eslint-disable sonarjs/no-identical-functions */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDataPointMetadata } from '@/chart-options-processor/data-points';

import {
  createMockDataOptions,
  createMockTreeNode,
} from './__test-helpers__/pivot-cell-payload-mock';
import { getPivotTableDataPoint } from './get-pivot-table-data-point';
import { ColumnDataNode, PivotTableCellPayload, RowDataNode, ValueDataNode } from './types';

// Mock the getDataPointMetadata function
vi.mock('@/chart-options-processor/data-points', () => ({
  getDataPointMetadata: vi.fn(),
}));

describe('getPivotTableDataPoint', () => {
  const mockGetDataPointMetadata = vi.mocked(getDataPointMetadata);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDataPointMetadata.mockImplementation((id, dataOption) => ({
      id,
      dataOption,
    }));
  });

  describe('Data Value Cell', () => {
    it('should handle regular data value cell', () => {
      const dataOptions = createMockDataOptions();
      const rowParent = createMockTreeNode<RowDataNode>(
        'Electronics',
        'Electronics',
        0,
        'rows',
        'data',
        0,
      );
      const rowTreeNode = createMockTreeNode<RowDataNode>(
        'Laptops',
        'Laptops',
        1,
        'rows',
        'data',
        1,
        rowParent,
      );
      const columnParent = createMockTreeNode<ColumnDataNode>(
        '2023',
        '2023',
        0,
        'columns',
        'data',
        0,
      );
      const columnTreeNode = createMockTreeNode<ColumnDataNode>(
        'Q1',
        'Q1',
        1,
        'columns',
        'data',
        1,
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

      const dataNode = createMockTreeNode<ValueDataNode>(
        '50000',
        '$50,000',
        0,
        'values',
        'data',
        0,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        rowTreeNode: rowTreeNode,
        columnTreeNode: columnTreeNode,
        measureTreeNode,
        isDataCell: true,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(true);
      expect(result.isCaptionCell).toBe(false);
      expect(result.isTotalCell).toBe(false);
      expect(result.entries.rows).toHaveLength(2);
      expect(result.entries.columns).toHaveLength(2);
      expect(result.entries.values).toHaveLength(1);
      expect(result.entries.rows![0].value).toBe('Electronics');
      expect(result.entries.rows![1].value).toBe('Laptops');
      expect(result.entries.columns![0].value).toBe('2023');
      expect(result.entries.columns![1].value).toBe('Q1');
      expect(result.entries.values![0].value).toBe('50000');
    });

    it('should handle data value cell on subtotal row', () => {
      const dataOptions = createMockDataOptions();
      const rowParent = createMockTreeNode<RowDataNode>(
        'Electronics',
        'Electronics',
        0,
        'rows',
        'data',
        0,
      );
      const rowTreeNode = createMockTreeNode<RowDataNode>(
        'SubTotal',
        'SubTotal',
        1,
        'rows',
        'subTotal',
        1,
        rowParent,
      );

      const columnParent = createMockTreeNode<ColumnDataNode>(
        '2023',
        '2023',
        0,
        'columns',
        'data',
        0,
      );
      const columnTreeNode = createMockTreeNode<ColumnDataNode>(
        'Q1',
        'Q1',
        1,
        'columns',
        'data',
        1,
        columnParent,
      );
      const measureTreeNode = createMockTreeNode<ValueDataNode>(
        'Sales',
        '$150,000',
        0,
        'measures',
        'measureBottom',
        0,
      );

      const dataNode = createMockTreeNode<ValueDataNode>(
        '150000',
        '$150,000',
        0,
        'values',
        'data',
        0,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        rowTreeNode,
        columnTreeNode: columnTreeNode,
        measureTreeNode,
        isDataCell: true,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(true);
      expect(result.isCaptionCell).toBe(false);
      expect(result.isTotalCell).toBe(true);
      expect(result.entries.rows).toHaveLength(2);
      expect(result.entries.rows![0].value).toBe('Electronics');
      expect(result.entries.rows![1].value).toBe('SubTotal');
      expect(result.entries.values![0].value).toBe('150000');
    });

    it('should handle data value cell on grand total row', () => {
      const dataOptions = createMockDataOptions();
      const rowTreeNode = createMockTreeNode<RowDataNode>(
        'Grand Total',
        'Grand Total',
        0,
        'rows',
        'grandTotal',
        0,
      );

      const columnParent = createMockTreeNode<ColumnDataNode>('2023', '2023', 0, 'columns', 'data');
      const columnTreeNode = createMockTreeNode<ColumnDataNode>(
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
        '$500,000',
        0,
        'measures',
        'measureBottom',
        0,
      );

      const dataNode = createMockTreeNode<ValueDataNode>(
        '500000',
        '$500,000',
        0,
        'values',
        'data',
        0,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        rowTreeNode,
        columnTreeNode: columnTreeNode,
        measureTreeNode,
        isDataCell: true,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(true);
      expect(result.isCaptionCell).toBe(false);
      expect(result.isTotalCell).toBe(true);
      expect(result.entries.rows).toHaveLength(0);
      expect(result.entries.columns).toHaveLength(2);
      expect(result.entries.values![0].value).toBe('500000');
    });

    it('should handle data value cell on subtotal column', () => {
      const dataOptions = createMockDataOptions();
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

      const columnTreeNode = createMockTreeNode<ColumnDataNode>(
        'SubTotal',
        'SubTotal',
        0,
        'columns',
        'subTotal',
        1,
      );

      const measureTreeNode = createMockTreeNode<ValueDataNode>(
        'Sales',
        '$200,000',
        0,
        'measures',
        'measureBottom',
        0,
      );

      const dataNode = createMockTreeNode<ValueDataNode>(
        '200000',
        '$200,000',
        0,
        'values',
        'data',
        0,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        rowTreeNode: rowTreeNode as RowDataNode,
        columnTreeNode,
        measureTreeNode,
        isDataCell: true,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(true);
      expect(result.isCaptionCell).toBe(false);
      expect(result.isTotalCell).toBe(true);
      expect(result.entries.rows).toHaveLength(2);
      expect(result.entries.columns).toHaveLength(1);
      expect(result.entries.values![0].value).toBe('200000');
    });

    it('should handle data value cell on grand total column', () => {
      const dataOptions = createMockDataOptions();
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

      const columnTreeNode = createMockTreeNode<ColumnDataNode>(
        'Grand Total',
        'Grand Total',
        0,
        'columns',
        'grandTotal',
        2,
      ); // Index that would map to second value when modulo with values length

      const dataNode = createMockTreeNode<ValueDataNode>(
        '300000',
        '$300,000',
        0,
        'values',
        'data',
        0,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        rowTreeNode: rowTreeNode as RowDataNode,
        columnTreeNode,
        measureTreeNode: undefined,
        isDataCell: true,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(true);
      expect(result.isCaptionCell).toBe(false);
      expect(result.isTotalCell).toBe(true);
      expect(result.entries.rows).toHaveLength(2);
      expect(result.entries.columns).toHaveLength(0);
      expect(result.entries.values![0].value).toBe('300000');
    });
  });

  describe('Data Row Cell', () => {
    it('should handle data row cell', () => {
      const dataOptions = createMockDataOptions();
      const rowParent = createMockTreeNode('Electronics', 'Electronics', 0, 'rows', 'data');
      const dataNode = createMockTreeNode(
        'Laptops',
        'Laptops',
        1,
        'rows',
        'data',
        1,
        rowParent,
      ) as RowDataNode;

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(true);
      expect(result.isCaptionCell).toBe(false);
      expect(result.isTotalCell).toBe(false);
      expect(result.entries.rows).toHaveLength(2);
      expect(result.entries.columns).toHaveLength(0);
      expect(result.entries.values).toHaveLength(0);
      expect(result.entries.rows![0].value).toBe('Electronics');
      expect(result.entries.rows![1].value).toBe('Laptops');
    });
  });

  describe('Data Column Cell', () => {
    it('should handle data column cell with single value', () => {
      const dataOptions = {
        ...createMockDataOptions(),
        values: [{ column: { name: 'Sales' } }] as any, // Single value
      };

      const columnParent = createMockTreeNode<ColumnDataNode>('2023', '2023', 1, 'columns', 'data'); // level 1 because of single value adjustment
      const dataNode = createMockTreeNode<ColumnDataNode>(
        'Q1',
        'Q1',
        2,
        'columns',
        'data',
        2,
        columnParent,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(true);
      expect(result.isCaptionCell).toBe(false);
      expect(result.isTotalCell).toBe(false);
      expect(result.entries.rows).toHaveLength(0);
      expect(result.entries.columns).toHaveLength(2);
      expect(result.entries.values).toHaveLength(0);
      expect(result.entries.columns![0].value).toBe('2023');
      expect(result.entries.columns![1].value).toBe('Q1');
    });

    it('should handle data column cell with multiple values', () => {
      const dataOptions = createMockDataOptions(); // Has 2 values

      const columnParent = createMockTreeNode<ColumnDataNode>('2023', '2023', 0, 'columns', 'data');
      const dataNode = createMockTreeNode<ColumnDataNode>(
        'Q1',
        'Q1',
        1,
        'columns',
        'data',
        1,
        columnParent,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(true);
      expect(result.isCaptionCell).toBe(false);
      expect(result.isTotalCell).toBe(false);
      expect(result.entries.rows).toHaveLength(0);
      expect(result.entries.columns).toHaveLength(2);
      expect(result.entries.values).toHaveLength(0);
      expect(result.entries.columns![0].value).toBe('2023');
      expect(result.entries.columns![1].value).toBe('Q1');
    });
  });

  describe('Caption Row Cell', () => {
    it('should handle corner caption row cell', () => {
      const dataOptions = createMockDataOptions();
      const dataNode = createMockTreeNode<RowDataNode>(
        'Category',
        'Category',
        0,
        'rows',
        'corner',
        0,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(false);
      expect(result.isCaptionCell).toBe(true);
      expect(result.isTotalCell).toBe(false);
      expect(result.entries.rows).toHaveLength(1);
      expect(result.entries.columns).toHaveLength(0);
      expect(result.entries.values).toHaveLength(0);
      expect(result.entries.rows![0].value).toBe('Category');
    });

    it('should handle subtotal caption row cell', () => {
      const dataOptions = createMockDataOptions();
      const dataNode = createMockTreeNode<RowDataNode>(
        'SubTotal',
        'SubTotal',
        1,
        'rows',
        'subTotal',
        1,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(false);
      expect(result.isCaptionCell).toBe(true);
      expect(result.isTotalCell).toBe(true);
      expect(result.entries.rows).toHaveLength(1);
      expect(result.entries.columns).toHaveLength(0);
      expect(result.entries.values).toHaveLength(0);
      expect(result.entries.rows![0].value).toBe('SubTotal');
    });

    it('should handle grand total caption row cell', () => {
      const dataOptions = createMockDataOptions();
      const dataNode = createMockTreeNode<RowDataNode>(
        'Grand Total',
        'Grand Total',
        0,
        'rows',
        'grandTotal',
        0,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(false);
      expect(result.isCaptionCell).toBe(true);
      expect(result.isTotalCell).toBe(true);
      expect(result.entries.rows).toHaveLength(0);
      expect(result.entries.columns).toHaveLength(0);
      expect(result.entries.values).toHaveLength(0);
    });
  });

  describe('Caption Column Cell', () => {
    it('should handle subtotal caption column cell', () => {
      const dataOptions = createMockDataOptions();
      const dataNode = createMockTreeNode<ColumnDataNode>(
        'SubTotal',
        'SubTotal',
        1,
        'columns',
        'subTotal',
        1,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(false);
      expect(result.isCaptionCell).toBe(true);
      expect(result.isTotalCell).toBe(true);
      expect(result.entries.rows).toHaveLength(0);
      expect(result.entries.columns).toHaveLength(1);
      expect(result.entries.values).toHaveLength(0);
      expect(result.entries.columns![0].value).toBe('SubTotal');
    });

    it('should handle grand total caption column cell', () => {
      const dataOptions = createMockDataOptions();
      const dataNode = createMockTreeNode<ColumnDataNode>(
        'Grand Total',
        'Grand Total',
        0,
        'columns',
        'grandTotal',
        0,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(false);
      expect(result.isCaptionCell).toBe(true);
      expect(result.isTotalCell).toBe(true);
      expect(result.entries.rows).toHaveLength(0);
      expect(result.entries.columns).toHaveLength(0);
      expect(result.entries.values).toHaveLength(0);
    });
  });

  describe('Caption Value Cell', () => {
    it('should handle measure bottom caption value cell', () => {
      const dataOptions = createMockDataOptions();
      const columnParent = createMockTreeNode<ColumnDataNode>('2023', '2023', 0, 'columns', 'data');
      const dataNode = createMockTreeNode<ColumnDataNode>(
        'Sales',
        'Sales',
        1,
        'measures',
        'measureBottom',
        0,
        columnParent,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(false);
      expect(result.isCaptionCell).toBe(true);
      expect(result.isTotalCell).toBe(false);
      expect(result.entries.rows).toHaveLength(0);
      expect(result.entries.columns).toHaveLength(2);
      expect(result.entries.values).toHaveLength(1);
      expect(result.entries.values![0].value).toBe('Sales');
      expect(result.entries.columns![0].value).toBe('2023');
    });

    it('should handle measure top caption value cell', () => {
      const dataOptions = createMockDataOptions();
      const columnParent = createMockTreeNode<ColumnDataNode>('Q1', 'Q1', 1, 'columns', 'data');
      const dataNode = createMockTreeNode<ColumnDataNode>(
        'Profit',
        'Profit',
        0,
        'measures',
        'measureTop',
        1,
        columnParent,
      );

      const cellPayload: PivotTableCellPayload = {
        dataNode,
        isDataCell: false,
        event: new MouseEvent('click'),
      };

      const result = getPivotTableDataPoint(cellPayload, dataOptions);

      expect(result.isDataCell).toBe(false);
      expect(result.isCaptionCell).toBe(true);
      expect(result.isTotalCell).toBe(false);
      expect(result.entries.rows).toHaveLength(0);
      expect(result.entries.columns).toHaveLength(2);
      expect(result.entries.values).toHaveLength(1);
      expect(result.entries.values![0].value).toBe('Profit');
      expect(result.entries.columns![0].value).toBe('Q1');
    });
  });
});
