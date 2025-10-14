import { act, renderHook } from '@testing-library/react';

import { useStateWithHistory } from './use-state-with-history';

describe('useStateWithHistory', () => {
  it('should initialize with the provided initial state', () => {
    const { result } = renderHook(() => useStateWithHistory(42));

    expect(result.current.state).toBe(42);
    expect(result.current.history).toEqual([42]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should initialize with provided initial history', () => {
    const initialHistory = [1, 2, 3];
    const { result } = renderHook(() => useStateWithHistory(4, { initialHistory }));

    expect(result.current.history).toEqual([1, 2, 3, 4]);
    expect(result.current.currentIndex).toBe(3);
  });

  it('should respect capacity limit', () => {
    const { result } = renderHook(() => useStateWithHistory(1, { capacity: 3 }));

    act(() => {
      result.current.setState(2);
      result.current.setState(3);
      result.current.setState(4);
      result.current.setState(5);
    });

    expect(result.current.history).toEqual([3, 4, 5]);
    expect(result.current.history.length).toBe(3);
  });

  it('should update state and add to history', () => {
    const { result } = renderHook(() => useStateWithHistory(1));

    act(() => {
      result.current.setState(2);
    });

    expect(result.current.state).toBe(2);
    expect(result.current.history).toEqual([1, 2]);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should support functional updates', () => {
    const { result } = renderHook(() => useStateWithHistory({ count: 1 }));

    act(() => {
      result.current.setState((prev) => ({ count: prev.count + 1 }));
    });

    expect(result.current.state).toEqual({ count: 2 });
  });

  it('should handle undo operation', () => {
    const { result } = renderHook(() => useStateWithHistory(1));

    act(() => {
      result.current.setState(2);
      result.current.setState(3);
      result.current.undo();
    });

    expect(result.current.state).toBe(2);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  it('should handle redo operation', () => {
    const { result } = renderHook(() => useStateWithHistory(1));

    act(() => {
      result.current.setState(2);
      result.current.setState(3);
      result.current.undo();
      result.current.redo();
    });

    expect(result.current.state).toBe(3);
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should handle goTo operation', () => {
    const { result } = renderHook(() => useStateWithHistory(1));

    act(() => {
      result.current.setState(2);
      result.current.setState(3);
      result.current.goTo(1);
    });

    expect(result.current.state).toBe(2);
    expect(result.current.currentIndex).toBe(1);
  });

  it('should not allow goTo with invalid index', () => {
    const { result } = renderHook(() => useStateWithHistory(1));

    act(() => {
      result.current.setState(2);
      result.current.goTo(-1); // Invalid index
      result.current.goTo(2); // Invalid index
    });

    expect(result.current.state).toBe(2);
    expect(result.current.currentIndex).toBe(1);
  });

  it('should clear history except current state', () => {
    const { result } = renderHook(() => useStateWithHistory(1));

    act(() => {
      result.current.setState(2);
      result.current.setState(3);
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([3]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should handle complex objects in state', () => {
    const initialState = { name: 'John', age: 30 };
    const { result } = renderHook(() => useStateWithHistory(initialState));

    act(() => {
      result.current.setState({ name: 'Jane', age: 31 });
    });

    expect(result.current.state).toEqual({ name: 'Jane', age: 31 });
    expect(result.current.history).toEqual([
      { name: 'John', age: 30 },
      { name: 'Jane', age: 31 },
    ]);
  });
});
