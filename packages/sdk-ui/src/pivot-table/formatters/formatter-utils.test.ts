import {
  applyCellFormattingResult,
  createUnifiedDataCellFormatter,
  createUnifiedHeaderCellFormatter,
} from './formatter-utils.js';
import type {
  CustomDataCellFormatter,
  CustomHeaderCellFormatter,
  CellFormattingResult,
} from './types.js';
import type { JaqlPanel, PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-client';
import type { PivotTableDataOptionsInternal } from '@/chart-data-options/types';
import { getPivotDataOptionByJaqlIndex, getPivotDataOptionIdByJaqlIndex } from './utils.js';

// Mock the utility functions
vi.mock('./utils.js', () => ({
  getPivotDataOptionByJaqlIndex: vi.fn(),
  getPivotDataOptionIdByJaqlIndex: vi.fn(),
}));

const getPivotDataOptionByJaqlIndexMock = vi.mocked(getPivotDataOptionByJaqlIndex);
const getPivotDataOptionIdByJaqlIndexMock = vi.mocked(getPivotDataOptionIdByJaqlIndex);

describe('formatter-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('applyCellFormattingResult', () => {
    it('should merge styles into cell', () => {
      const cell = { style: { color: 'red' } } as PivotDataNode;
      const result: CellFormattingResult = {
        style: { fontSize: '14px', color: 'blue' },
      };

      applyCellFormattingResult(cell, result);

      expect(cell.style).toEqual({ color: 'blue', fontSize: '14px' });
    });

    it('should handle undefined values gracefully', () => {
      const cell = { content: 'original' } as PivotDataNode;
      const result: CellFormattingResult = {};

      applyCellFormattingResult(cell, result);

      expect(cell.content).toBe('original');
    });
  });

  describe('createUnifiedDataCellFormatter', () => {
    const mockDataOptions = {} as PivotTableDataOptionsInternal;
    const mockDataOption = { type: 'measure' };
    const mockId = 'test-id';

    beforeEach(() => {
      getPivotDataOptionByJaqlIndexMock.mockReturnValue(mockDataOption as any);
      getPivotDataOptionIdByJaqlIndexMock.mockReturnValue(mockId);
    });

    it('should create a unified formatter that calls the custom formatter', () => {
      const customFormatter: CustomDataCellFormatter = vi.fn().mockReturnValue({
        content: 'formatted content',
        style: { color: 'red' },
      });

      const unifiedFormatter = createUnifiedDataCellFormatter(customFormatter, mockDataOptions);

      const cell = { content: 'original' } as PivotDataNode;
      const rowItem = {} as PivotTreeNode;
      const columnItem = {} as PivotTreeNode;
      const jaqlPanelItem = { field: { index: 0 } } as JaqlPanel;

      unifiedFormatter(cell, rowItem, columnItem, jaqlPanelItem);

      expect(customFormatter).toHaveBeenCalledWith(cell, jaqlPanelItem, mockDataOption, mockId);
      expect(cell.content).toBe('formatted content');
      expect(cell.style).toEqual({ color: 'red' });
    });

    it('should not apply formatting when dataOption is not found', () => {
      getPivotDataOptionByJaqlIndexMock.mockReturnValue(undefined);

      const customFormatter: CustomDataCellFormatter = vi.fn();
      const unifiedFormatter = createUnifiedDataCellFormatter(customFormatter, mockDataOptions);

      const cell = { content: 'original' } as PivotDataNode;
      const jaqlPanelItem = { field: { index: 0 } } as JaqlPanel;

      unifiedFormatter(cell, {} as PivotTreeNode, {} as PivotTreeNode, jaqlPanelItem);

      expect(customFormatter).not.toHaveBeenCalled();
      expect(cell.content).toBe('original');
    });

    it('should not apply formatting when custom formatter returns void', () => {
      const customFormatter: CustomDataCellFormatter = vi.fn().mockReturnValue(undefined);
      const unifiedFormatter = createUnifiedDataCellFormatter(customFormatter, mockDataOptions);

      const cell = { content: 'original' } as PivotDataNode;
      const jaqlPanelItem = { field: { index: 0 } } as JaqlPanel;

      unifiedFormatter(cell, {} as PivotTreeNode, {} as PivotTreeNode, jaqlPanelItem);

      expect(customFormatter).toHaveBeenCalled();
      expect(cell.content).toBe('original');
    });

    it('should handle missing jaqlPanelItem.field gracefully', () => {
      const customFormatter: CustomDataCellFormatter = vi.fn();
      const unifiedFormatter = createUnifiedDataCellFormatter(customFormatter, mockDataOptions);

      const cell = { content: 'original' } as PivotDataNode;
      const jaqlPanelItem = {} as JaqlPanel;

      unifiedFormatter(cell, {} as PivotTreeNode, {} as PivotTreeNode, jaqlPanelItem);

      expect(getPivotDataOptionByJaqlIndexMock).toHaveBeenCalledWith(mockDataOptions, undefined);
    });

    it('should handle empty id gracefully', () => {
      getPivotDataOptionIdByJaqlIndexMock.mockReturnValue(undefined);

      const customFormatter: CustomDataCellFormatter = vi.fn().mockReturnValue({
        content: 'formatted',
      });
      const unifiedFormatter = createUnifiedDataCellFormatter(customFormatter, mockDataOptions);

      const cell = { content: 'original' } as PivotDataNode;
      const jaqlPanelItem = { field: { index: 0 } } as JaqlPanel;

      unifiedFormatter(cell, {} as PivotTreeNode, {} as PivotTreeNode, jaqlPanelItem);

      expect(customFormatter).toHaveBeenCalledWith(cell, jaqlPanelItem, mockDataOption, '');
      expect(cell.content).toBe('formatted');
    });
  });

  describe('createUnifiedHeaderCellFormatter', () => {
    const mockDataOptions = {} as PivotTableDataOptionsInternal;
    const mockDataOption = { type: 'dimension' };
    const mockId = 'header-id';

    beforeEach(() => {
      getPivotDataOptionByJaqlIndexMock.mockReturnValue(mockDataOption as any);
      getPivotDataOptionIdByJaqlIndexMock.mockReturnValue(mockId);
    });

    it('should create a unified header formatter that calls the custom formatter', () => {
      const customFormatter: CustomHeaderCellFormatter = vi.fn().mockReturnValue({
        content: 'formatted header',
        style: { fontWeight: 'bold' },
      });

      const unifiedFormatter = createUnifiedHeaderCellFormatter(customFormatter, mockDataOptions);

      const cell = { content: 'original header' } as PivotTreeNode;
      const jaqlPanelItem = { field: { index: 0 } } as JaqlPanel;

      unifiedFormatter(cell, jaqlPanelItem);

      expect(customFormatter).toHaveBeenCalledWith(cell, jaqlPanelItem, mockDataOption, mockId);
      expect(cell.content).toBe('formatted header');
      expect(cell.style).toEqual({ fontWeight: 'bold' });
    });

    it('should handle undefined jaqlPanelItem', () => {
      getPivotDataOptionByJaqlIndexMock.mockReturnValue(undefined);
      getPivotDataOptionIdByJaqlIndexMock.mockReturnValue(undefined);

      const customFormatter: CustomHeaderCellFormatter = vi.fn().mockReturnValue({
        content: 'formatted header',
      });

      const unifiedFormatter = createUnifiedHeaderCellFormatter(customFormatter, mockDataOptions);

      const cell = { content: 'original header' } as PivotTreeNode;

      unifiedFormatter(cell, undefined);

      expect(customFormatter).toHaveBeenCalledWith(cell, undefined, undefined, undefined);
      expect(cell.content).toBe('formatted header');
    });

    it('should not apply formatting when custom formatter returns void', () => {
      const customFormatter: CustomHeaderCellFormatter = vi.fn().mockReturnValue(undefined);
      const unifiedFormatter = createUnifiedHeaderCellFormatter(customFormatter, mockDataOptions);

      const cell = { content: 'original header' } as PivotTreeNode;
      const jaqlPanelItem = { field: { index: 0 } } as JaqlPanel;

      unifiedFormatter(cell, jaqlPanelItem);

      expect(customFormatter).toHaveBeenCalled();
      expect(cell.content).toBe('original header');
    });

    it('should not apply formatting when result is not an object', () => {
      const customFormatter: CustomHeaderCellFormatter = vi
        .fn()
        .mockReturnValue('string result' as any);
      const unifiedFormatter = createUnifiedHeaderCellFormatter(customFormatter, mockDataOptions);

      const cell = { content: 'original header' } as PivotTreeNode;
      const jaqlPanelItem = { field: { index: 0 } } as JaqlPanel;

      unifiedFormatter(cell, jaqlPanelItem);

      expect(customFormatter).toHaveBeenCalled();
      expect(cell.content).toBe('original header');
    });
  });
});
