import { renderHook, act } from '@testing-library/react';
import { useSyncedState } from './use-synced-state';

describe('useSyncedState', () => {
  it('should initialize state with the syncValue', () => {
    const initialValue = { someProp: 'some value' };
    const { result } = renderHook(() => useSyncedState(initialValue));

    const [state] = result.current;
    expect(state).toBe(initialValue);
  });

  it('should update state when syncValue changes', () => {
    const initialValue = { someProp: 'some value' };
    const modifiedValue = { someProp: 'some modified value' };
    const { result, rerender } = renderHook((syncValue) => useSyncedState(syncValue), {
      initialProps: initialValue,
    });

    let [state] = result.current;
    expect(state).toBe(initialValue);

    // Rerender with new syncValue
    rerender(modifiedValue);

    [state] = result.current;
    expect(state).toBe(modifiedValue);
  });

  it('should not update state when syncValue is the same object (deep equality)', () => {
    const initialValue = { someProp: 'some value' };
    const { result, rerender } = renderHook((syncValue) => useSyncedState(syncValue), {
      initialProps: initialValue,
    });

    let [state] = result.current;
    expect(state).toEqual(initialValue);

    // Rerender with a different, but deeply equal object
    rerender({ ...initialValue });

    [state] = result.current;
    expect(state).toBe(initialValue); // State should not change
  });

  it('should trigger onLocalStateChange when local state is changed', () => {
    const initialValue = { someProp: 'some value' };
    const modifiedValue = { someProp: 'some modified value' };
    const mockOnLocalStateChange = vi.fn();

    const { result } = renderHook(() =>
      useSyncedState(initialValue, { onLocalStateChange: mockOnLocalStateChange }),
    );

    const [, setState] = result.current;

    act(() => {
      setState(modifiedValue);
    });

    const [state] = result.current;
    expect(state).toBe(modifiedValue);
    expect(mockOnLocalStateChange).toHaveBeenCalledWith(modifiedValue);
  });

  it('should allow functional updates to state', () => {
    const initialValue = { someProp: 'some value' };
    const { result } = renderHook(() => useSyncedState(initialValue));

    const [, setState] = result.current;

    act(() => {
      setState((prev) => ({ ...prev, someProp: `${prev.someProp} (modified)` }));
    });

    const [state] = result.current;
    expect(state).toEqual({ someProp: 'some value (modified)' });
  });

  it('should use custom syncCompareFn for synchronization', () => {
    const initialValue = { someProp: 'some value' };
    const modifiedValue = { someProp: 'some value', someAnotherProps: 'some another value' };
    const customCompareFn = vi.fn((prev, next) => prev.someProp === next.someProp);

    const { result, rerender } = renderHook(
      (syncValue) => useSyncedState(syncValue, { syncCompareFn: customCompareFn }),
      { initialProps: initialValue },
    );

    let [state] = result.current;
    expect(state).toEqual(initialValue);

    // Rerender with the same `someProp` value but different object with more props
    rerender(modifiedValue);

    [state] = result.current;
    expect(state).toBe(initialValue); // State should not change due to custom comparison

    expect(customCompareFn).toHaveBeenCalledWith(initialValue, modifiedValue);
  });

  it('should not trigger onLocalStateChange when state is updated via syncValue', () => {
    const initialValue = { someProp: 'some value' };
    const modifiedValue = { someProp: 'some modified value' };
    const mockOnLocalStateChange = vi.fn();

    const { result, rerender } = renderHook(
      (syncValue) => useSyncedState(syncValue, { onLocalStateChange: mockOnLocalStateChange }),
      { initialProps: initialValue },
    );

    rerender(modifiedValue);

    const [state] = result.current;
    expect(state).toBe(modifiedValue);
    expect(mockOnLocalStateChange).not.toHaveBeenCalled();
  });
});
