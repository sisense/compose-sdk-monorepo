import { TranslatableError } from '@/infra/translation/translatable-error.js';

import { useMenuContext } from '../menu-context';

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
