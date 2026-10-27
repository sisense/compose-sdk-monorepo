import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { TranslatableError } from '@/infra/translation/translatable-error';

import { useWidgetContextGate } from './use-widget-context-gate';

vi.mock('@/infra/contexts/sisense-context/sisense-context', () => ({
  useSisenseContext: vi.fn(),
}));

const mockContext = (context: { app?: object; isInitialized: boolean }) =>
  vi.mocked(useSisenseContext).mockReturnValue(context as ReturnType<typeof useSisenseContext>);

describe('useWidgetContextGate', () => {
  it('is ready only once the Sisense app exists', () => {
    mockContext({ app: undefined, isInitialized: true });
    const { result, rerender } = renderHook(() => useWidgetContextGate());
    expect(result.current.isContextReady).toBe(false);

    mockContext({ app: {}, isInitialized: true });
    rerender();
    expect(result.current.isContextReady).toBe(true);
  });

  it('throws when the Sisense context is not initialized', () => {
    mockContext({ app: undefined, isInitialized: false });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useWidgetContextGate())).toThrow(TranslatableError);
    consoleError.mockRestore();
  });
});
