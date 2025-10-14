import { fireEvent, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { WidgetsPanelLayout } from '@/models';
import { WidgetProps } from '@/props';

import * as DM from '../../../__test-helpers__/sample-ecommerce';
import { EditableLayout, EditableLayoutProps } from './editable-layout';

// Mock dependencies
vi.mock('@/widgets/widget', () => ({
  Widget: ({ id, widgetType }: { id: string; widgetType: string }) => (
    <div data-testid={`widget-${id}`} data-widget-type={widgetType}>
      {widgetType} Widget
    </div>
  ),
}));

vi.mock('./components/resizable-row', () => ({
  ResizableRow: ({ children, id, height, onHeightChange }: any) => (
    <div data-testid={`resizable-row-${id}`} data-height={height}>
      <button data-testid={`resize-row-${id}`} onClick={() => onHeightChange?.(200)}>
        Resize Row
      </button>
      {children}
    </div>
  ),
}));

vi.mock('./components/resizable-columns', () => ({
  ResizableColumns: ({ children, widths, onWidthsChange }: any) => (
    <div data-testid="resizable-columns" data-widths={widths.join(',')}>
      <button data-testid="resize-columns" onClick={() => onWidthsChange?.([60, 40])}>
        Resize Columns
      </button>
      {children}
    </div>
  ),
}));

vi.mock('./components/draggable-widget-wrapper', () => ({
  DraggableWidgetWrapper: ({ children, id, dragHandleOptions }: any) => {
    // Handle render prop pattern where children is a function
    const withDragHandle = (content: any) => content;
    const renderedChildren = typeof children === 'function' ? children(withDragHandle) : children;

    return (
      <div
        data-testid={`draggable-widget-${id}`}
        data-drag-handle-visible={dragHandleOptions?.icon?.visible}
      >
        <button data-testid={`drag-handle-${id}`}>Drag Handle</button>
        <div data-testid={`widget-content-${id}`}>{renderedChildren}</div>
      </div>
    );
  },
}));

vi.mock('./components/cell-drop-overlay', () => ({
  CellDropOverlay: ({ id, widgetId }: any) => (
    <div data-testid={`cell-drop-overlay-${id}`} data-widget-id={widgetId}>
      Cell Drop Zone
    </div>
  ),
}));

vi.mock('./components/row-drop-overlay', () => ({
  RowDropOverlay: ({ id, columnIndex, rowIndex }: any) => (
    <div data-testid={`row-drop-overlay-${id}`} data-column={columnIndex} data-row={rowIndex}>
      Row Drop Zone
    </div>
  ),
}));

vi.mock('@/common/hooks/use-synced-state', () => ({
  useSyncedState: (initialValue: any) => {
    const setValue = vi.fn();
    return [initialValue, setValue];
  },
}));

vi.mock('@/theme-provider', () => ({
  useThemeContext: () => ({
    themeSettings: {
      widget: {
        header: {
          titleTextColor: '#333333',
        },
      },
    },
  }),
}));

vi.mock('@/common/hooks/use-menu', () => ({
  useMenu: () => ({
    openMenu: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/common/components/menu/menu-button', () => ({
  MenuButton: ({ onClick, ariaLabel }: any) => (
    <button data-testid="menu-button" onClick={onClick} aria-label={ariaLabel}>
      Menu
    </button>
  ),
}));

// Mock setTimeout
vi.useFakeTimers();

describe('EditableLayout', () => {
  // Save the original dispatchEvent
  const originalDispatchEvent = window.dispatchEvent;

  beforeAll(() => {
    Object.defineProperty(window, 'dispatchEvent', {
      value: vi.fn(),
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'dispatchEvent', {
      value: originalDispatchEvent,
      writable: true,
    });
  });

  const mockLayout: WidgetsPanelLayout = {
    columns: [
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget1',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget2',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
    ],
  };

  const mockWidgets: WidgetProps[] = [
    {
      id: 'widget1',
      widgetType: 'chart',
      chartType: 'column',
      dataSource: DM.DataSource,
      dataOptions: {
        category: [DM.Commerce.AgeRange],
        value: [DM.Commerce.Revenue],
      },
    },
    {
      id: 'widget2',
      widgetType: 'text',
      styleOptions: {
        html: 'Sample text widget',
        vAlign: 'valign-middle',
        bgColor: '#ffffff',
      },
    },
  ];

  const defaultProps: EditableLayoutProps = {
    layout: mockLayout,
    widgets: mockWidgets,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Rendering', () => {
    it('should render the layout structure correctly', () => {
      render(<EditableLayout {...defaultProps} />);

      // Check that the main layout structure is rendered
      const columns = screen.getAllByTestId('resizable-columns');
      expect(columns.length).toBeGreaterThan(0);
      expect(screen.getByTestId('resizable-row-0,0')).toBeInTheDocument();
      expect(screen.getByTestId('resizable-row-1,0')).toBeInTheDocument();
    });

    it('should render draggable widget wrappers', () => {
      render(<EditableLayout {...defaultProps} />);

      expect(screen.getByTestId('draggable-widget-widget1')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-widget-widget2')).toBeInTheDocument();
    });

    it('should render with correct column widths', () => {
      render(<EditableLayout {...defaultProps} />);

      const resizableColumns = screen.getAllByTestId('resizable-columns')[0];
      expect(resizableColumns).toHaveAttribute('data-widths', '50,50');
    });

    it('should render with correct row heights', () => {
      render(<EditableLayout {...defaultProps} />);

      const row1 = screen.getByTestId('resizable-row-0,0');
      const row2 = screen.getByTestId('resizable-row-1,0');

      expect(row1).toHaveAttribute('data-height', '232'); // 200 + 32 (WIDGET_HEADER_HEIGHT)
      expect(row2).toHaveAttribute('data-height', '232');
    });

    it('should render drag handles for widgets', () => {
      render(<EditableLayout {...defaultProps} />);

      const chartWidgetWrapper = screen.getByTestId('draggable-widget-widget1');
      const textWidgetWrapper = screen.getByTestId('draggable-widget-widget2');

      expect(chartWidgetWrapper).toHaveAttribute('data-drag-handle-visible', 'true');
      expect(textWidgetWrapper).toHaveAttribute('data-drag-handle-visible', 'true');
    });
  });

  describe('Configuration', () => {
    it('should hide drag handle icon when config.showDragHandleIcon is false', () => {
      render(<EditableLayout {...defaultProps} config={{ showDragHandleIcon: false }} />);

      const chartWidgetWrapper = screen.getByTestId('draggable-widget-widget1');
      expect(chartWidgetWrapper).toHaveAttribute('data-drag-handle-visible', 'false');
    });

    it('should show drag handle icon by default', () => {
      render(<EditableLayout {...defaultProps} />);

      const chartWidgetWrapper = screen.getByTestId('draggable-widget-widget1');
      expect(chartWidgetWrapper).toHaveAttribute('data-drag-handle-visible', 'true');
    });

    it('should handle undefined config gracefully', () => {
      render(<EditableLayout {...defaultProps} config={undefined} />);

      const chartWidgetWrapper = screen.getByTestId('draggable-widget-widget1');
      expect(chartWidgetWrapper).toHaveAttribute('data-drag-handle-visible', 'true');
    });
  });

  describe('Layout Changes', () => {
    it('should call onLayoutChange when column widths change', () => {
      const onLayoutChange = vi.fn();
      render(<EditableLayout {...defaultProps} onLayoutChange={onLayoutChange} />);

      // Use getAllByTestId to get the first resize-columns button
      const resizeButtons = screen.getAllByTestId('resize-columns');
      fireEvent.click(resizeButtons[0]);

      expect(onLayoutChange).toHaveBeenCalled();
    });

    it('should call onLayoutChange when row height changes', () => {
      const onLayoutChange = vi.fn();
      render(<EditableLayout {...defaultProps} onLayoutChange={onLayoutChange} />);

      fireEvent.click(screen.getByTestId('resize-row-0,0'));

      expect(onLayoutChange).toHaveBeenCalled();
    });

    it('should not call onLayoutChange when callback is not provided', () => {
      render(<EditableLayout {...defaultProps} />);

      const resizeButtons = screen.getAllByTestId('resize-columns');
      fireEvent.click(resizeButtons[0]);
      fireEvent.click(screen.getByTestId('resize-row-0,0'));

      // Should not throw any errors
      expect(true).toBe(true);
    });
  });

  describe('Empty Layout', () => {
    it('should handle empty layout gracefully', () => {
      const emptyLayout: WidgetsPanelLayout = {
        columns: [],
      };

      render(<EditableLayout layout={emptyLayout} widgets={[]} />);

      // Should render without errors
      expect(screen.getByTestId('resizable-columns')).toBeInTheDocument();
    });

    it('should handle layout with empty columns', () => {
      const emptyColumnsLayout: WidgetsPanelLayout = {
        columns: [
          {
            widthPercentage: 100,
            rows: [],
          },
        ],
      };

      render(<EditableLayout layout={emptyColumnsLayout} widgets={[]} />);

      // Should render without errors
      expect(screen.getByTestId('resizable-columns')).toBeInTheDocument();
    });
  });

  describe('Widget Not Found', () => {
    it('should handle widgets that are not found in layout', () => {
      const layoutWithMissingWidget: WidgetsPanelLayout = {
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  {
                    widgetId: 'missing-widget',
                    widthPercentage: 100,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
      };

      render(<EditableLayout layout={layoutWithMissingWidget} widgets={mockWidgets} />);

      // Should render without errors, but the missing widget should not be rendered
      expect(screen.queryByTestId('draggable-widget-missing-widget')).not.toBeInTheDocument();
    });
  });

  describe('Complex Layout', () => {
    it('should handle complex layout with multiple rows and cells', () => {
      const complexLayout: WidgetsPanelLayout = {
        columns: [
          {
            widthPercentage: 60,
            rows: [
              {
                cells: [
                  {
                    widgetId: 'widget1',
                    widthPercentage: 50,
                    height: 200,
                  },
                  {
                    widgetId: 'widget2',
                    widthPercentage: 50,
                    height: 200,
                  },
                ],
              },
              {
                cells: [
                  {
                    widgetId: 'widget3',
                    widthPercentage: 100,
                    height: 150,
                  },
                ],
              },
            ],
          },
          {
            widthPercentage: 40,
            rows: [
              {
                cells: [
                  {
                    widgetId: 'widget4',
                    widthPercentage: 100,
                    height: 300,
                  },
                ],
              },
            ],
          },
        ],
      };

      const complexWidgets: WidgetProps[] = [
        ...mockWidgets,
        {
          id: 'widget3',
          widgetType: 'pivot',
          dataSource: DM.DataSource,
          dataOptions: {},
        },
        {
          id: 'widget4',
          widgetType: 'chart',
          chartType: 'line',
          dataSource: DM.DataSource,
          dataOptions: {
            category: [DM.Commerce.AgeRange],
            value: [DM.Commerce.Revenue],
          },
        },
      ];

      render(<EditableLayout layout={complexLayout} widgets={complexWidgets} />);

      // Should render all draggable widget wrappers
      expect(screen.getByTestId('draggable-widget-widget1')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-widget-widget2')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-widget-widget3')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-widget-widget4')).toBeInTheDocument();

      // Should render all rows
      expect(screen.getByTestId('resizable-row-0,0')).toBeInTheDocument();
      expect(screen.getByTestId('resizable-row-0,1')).toBeInTheDocument();
      expect(screen.getByTestId('resizable-row-1,0')).toBeInTheDocument();
    });
  });
});
