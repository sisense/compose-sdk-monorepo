import { act, renderHook } from '@testing-library/react';

import {
  LS_KEY_FILTERS_PANEL_COLLAPSED,
  useFiltersPanelCollapsedState,
} from './use-filters-panel-collapsed-state.js';

describe('useFiltersPanelCollapsedState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns initial state as false when no initialState is provided', () => {
    const { result } = renderHook(() => useFiltersPanelCollapsedState());
    const [isCollapsed] = result.current;
    expect(isCollapsed).toBe(false);
  });

  it('returns initial state as true when initialState is true', () => {
    const { result } = renderHook(() => useFiltersPanelCollapsedState(true));
    const [isCollapsed] = result.current;
    expect(isCollapsed).toBe(true);
  });

  it('updates state without storing in localStorage when shouldStoreInLS is false', () => {
    const { result } = renderHook(() => useFiltersPanelCollapsedState(false, false));
    const [, setCollapsed] = result.current;

    act(() => {
      setCollapsed(true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem(LS_KEY_FILTERS_PANEL_COLLAPSED)).toBeNull();
  });

  it('stores state in localStorage when shouldStoreInLS is true', () => {
    const { result } = renderHook(() => useFiltersPanelCollapsedState(false, true));
    const [, setCollapsed] = result.current;

    act(() => {
      setCollapsed(true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem(LS_KEY_FILTERS_PANEL_COLLAPSED)).toBe('true');
  });

  it('retrieves initial state from localStorage if available and shouldStoreInLS is true', () => {
    localStorage.setItem(LS_KEY_FILTERS_PANEL_COLLAPSED, 'true');
    const { result } = renderHook(() => useFiltersPanelCollapsedState(false, true));
    const [isCollapsed] = result.current;

    expect(isCollapsed).toBe(true);
  });

  it('uses provided initial state if localStorage is empty and shouldStoreInLS is true', () => {
    const { result } = renderHook(() => useFiltersPanelCollapsedState(true, true));
    const [isCollapsed] = result.current;

    expect(isCollapsed).toBe(true);
  });

  it('clears stored state when set to false with shouldStoreInLS true', () => {
    localStorage.setItem(LS_KEY_FILTERS_PANEL_COLLAPSED, 'true');
    const { result } = renderHook(() => useFiltersPanelCollapsedState(false, true));
    const [, setCollapsed] = result.current;

    act(() => {
      setCollapsed(false);
    });

    expect(result.current[0]).toBe(false);
    expect(localStorage.getItem(LS_KEY_FILTERS_PANEL_COLLAPSED)).toBe('false');
  });
});
