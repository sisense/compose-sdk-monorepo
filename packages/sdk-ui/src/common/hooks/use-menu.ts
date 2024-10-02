import { TranslatableError } from '@/translation/translatable-error.js';
import { useMenuContext } from '../components/menu/menu-context.js';

/**
 * Hook to access menu API.
 *
 * Throws an error if used outside the menu context.
 *
 * @internal
 */
export const useMenu = () => {
  const menuSettings = useMenuContext();

  if (!menuSettings) {
    throw new TranslatableError('errors.missingMenuRoot');
  }

  const { openMenu, closeMenu } = menuSettings;

  return {
    openMenu,
    closeMenu,
  };
};
