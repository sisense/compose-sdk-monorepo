import { createContext, useContext } from 'react';

import { OpenMenuFn } from './types.js';

type MenuSettings = {
  openMenu: OpenMenuFn;
  closeMenu: () => void;
};

export const MenuContext = createContext<MenuSettings | null>(null);

/**
 * Hook to get the menu context (menu API)
 *
 * @returns The menu context
 * @internal
 */
export const useMenuContext = () => useContext(MenuContext);
