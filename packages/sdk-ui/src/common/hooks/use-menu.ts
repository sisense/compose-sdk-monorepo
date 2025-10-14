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
  const menuApi = useMenuContext();

  if (!menuApi) {
    throw new TranslatableError('errors.missingMenuRoot');
  }

  return menuApi;
};
