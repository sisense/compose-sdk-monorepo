import { renderHook, act } from '@testing-library/react';
import { useEditModeToolbar } from './use-edit-mode-toolbar';
import { WidgetsPanelLayout } from '@/models';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock functions
const mockOnApply = vi.fn();
const mockOnCancel = vi.fn();

describe('useEditModeToolbar', () => {
  const mockInitialLayout: WidgetsPanelLayout = {
    columns: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with the provided layout', () => {
    const { result } = renderHook(() =>
      useEditModeToolbar({
        initialLayout: mockInitialLayout,
      }),
    );

    expect(result.current.layout).toEqual(mockInitialLayout);
    expect(result.current.hasChanges).toBe(false);
  });

  it('should update layout and track changes', () => {
    const { result } = renderHook(() =>
      useEditModeToolbar({
        initialLayout: mockInitialLayout,
      }),
    );

    const newLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  widgetId: '1',
                },
              ],
            },
          ],
        },
      ],
    };

    act(() => {
      result.current.setLayout(newLayout);
    });

    expect(result.current.layout).toEqual(newLayout);
    expect(result.current.hasChanges).toBe(true);
  });

  it('should handle undo/redo operations', () => {
    const { result } = renderHook(() =>
      useEditModeToolbar({
        initialLayout: mockInitialLayout,
      }),
    );

    const newLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  widgetId: '1',
                },
              ],
            },
          ],
        },
      ],
    };

    act(() => {
      result.current.setLayout(newLayout);
    });

    expect(result.current.hasChanges).toBe(true);

    act(() => {
      result.current.toolbar().props.children[0].props.onClick();
    });

    expect(result.current.layout).toEqual(mockInitialLayout);
    expect(result.current.hasChanges).toBe(false);

    act(() => {
      result.current.toolbar().props.children[1].props.onClick();
    });

    expect(result.current.layout).toEqual(newLayout);
    expect(result.current.hasChanges).toBe(true);
  });

  it('should call onApply when applying changes', () => {
    const { result } = renderHook(() =>
      useEditModeToolbar({
        initialLayout: mockInitialLayout,
        onApply: mockOnApply,
      }),
    );

    const newLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  widgetId: '1',
                },
              ],
            },
          ],
        },
      ],
    };

    act(() => {
      result.current.setLayout(newLayout);
    });

    act(() => {
      result.current.toolbar().props.children[3].props.onClick();
    });

    expect(mockOnApply).toHaveBeenCalledWith(newLayout);
    expect(result.current.hasChanges).toBe(false);
  });

  it('should call onCancel and reset layout when canceling', () => {
    const { result } = renderHook(() =>
      useEditModeToolbar({
        initialLayout: mockInitialLayout,
        onCancel: mockOnCancel,
      }),
    );

    const newLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  widgetId: '1',
                },
              ],
            },
          ],
        },
      ],
    };

    act(() => {
      result.current.setLayout(newLayout);
    });

    act(() => {
      result.current.toolbar().props.children[2].props.onClick();
    });

    expect(mockOnCancel).toHaveBeenCalled();
    expect(result.current.layout).toEqual(mockInitialLayout);
    expect(result.current.hasChanges).toBe(false);
  });

  it('should reset layout when initialLayout changes', () => {
    const { result, rerender } = renderHook(
      ({ layout }) =>
        useEditModeToolbar({
          initialLayout: layout,
        }),
      { initialProps: { layout: mockInitialLayout } },
    );

    const newLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  widgetId: '1',
                },
              ],
            },
          ],
        },
      ],
    };

    act(() => {
      result.current.setLayout(newLayout);
    });

    const updatedInitialLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  widgetId: '2',
                },
              ],
            },
          ],
        },
      ],
    };

    rerender({ layout: updatedInitialLayout });

    expect(result.current.layout).toEqual(updatedInitialLayout);
    expect(result.current.hasChanges).toBe(false);
  });
});
