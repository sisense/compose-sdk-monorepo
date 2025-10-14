import { renderHook } from '@testing-library/react';
import { describe, expect, it, Mock } from 'vitest';

import { TranslatableError } from '@/translation/translatable-error.js';

import { useMenuContext } from '../components/menu/menu-context';
import { useMenu } from './use-menu';

vi.mock('../components/menu/menu-context');

describe('useMenu', () => {
  it('should throw an error if used outside the menu context', () => {
    (useMenuContext as Mock).mockReturnValue(null);
    let thrownError: TranslatableError | null = null;
    try {
      renderHook(() => useMenu());
    } catch (error) {
      thrownError = error as TranslatableError;
    }

    expect(thrownError).toBeInstanceOf(TranslatableError);
    expect(thrownError && thrownError.key).toBe('errors.missingMenuRoot');
  });

  it('should return openMenu and closeMenu functions when used inside the menu context', () => {
    const mockOpenMenu = vi.fn();
    const mockCloseMenu = vi.fn();
    (useMenuContext as Mock).mockReturnValue({
      openMenu: mockOpenMenu,
      closeMenu: mockCloseMenu,
    });

    const { result } = renderHook(() => useMenu());

    expect(result.current.openMenu).toBe(mockOpenMenu);
    expect(result.current.closeMenu).toBe(mockCloseMenu);
  });
});
