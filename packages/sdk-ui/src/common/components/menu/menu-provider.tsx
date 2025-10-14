import { useCallback, useMemo, useState } from 'react';

import { ContextMenu } from '@/common/components/menu/context-menu';

import { MenuContext, useMenuContext } from './menu-context';
import { BeforeMenuOpenHandler, MenuOptions } from './types';

export interface MenuProviderProps {
  /** Optional handler function to process menu options before opening the menu. */
  onBeforeMenuOpen?: BeforeMenuOpenHandler;
  children?: React.ReactNode;
}

/**
 * The root-level provider component for managing and displaying the context menu.
 * This component provides the menu API for controlling a single UI menu component for the entire menu tree.
 * It also offers a middleware-like `onBeforeMenuOpen` property, which allows to intercept
 * and adjust menu options before the context menu is displayed.
 */
const MenuTreeRootProvider: React.FC<MenuProviderProps> = ({ children, onBeforeMenuOpen }) => {
  const [menuOptions, setMenuOptions] = useState<null | MenuOptions>(null);

  const openMenu = useCallback(
    (options: MenuOptions) => {
      const finalOptions = onBeforeMenuOpen ? onBeforeMenuOpen(options) : options;

      if (!finalOptions) {
        return;
      }

      setMenuOptions(finalOptions);
    },
    [onBeforeMenuOpen],
  );

  const closeMenu = useCallback(() => {
    setMenuOptions(null);
  }, []);

  const onMenuClose = useCallback(() => {
    menuOptions?.onClose?.();
    closeMenu();
  }, [closeMenu, menuOptions]);

  // Note: should have memoization to prevent redundant context update due to component state change
  const menuApi = useMemo(() => {
    return {
      openMenu,
      closeMenu,
    };
  }, [openMenu, closeMenu]);

  return (
    <MenuContext.Provider value={menuApi}>
      <ContextMenu
        position={menuOptions?.position}
        itemSections={menuOptions?.itemSections}
        closeContextMenu={onMenuClose}
        alignment={menuOptions?.alignment}
      />
      {children}
    </MenuContext.Provider>
  );
};

/**
 * The node-level provider component for managing and displaying the context menu.
 * This component provides the proxy access to the root menu API together with a possibility to set
 * a middleware-like `onBeforeMenuOpen` property which allows to intercept the nested menu sub-tree.
 */
const MenuTreeNodeProvider: React.FC<MenuProviderProps> = ({ children, onBeforeMenuOpen }) => {
  const menuSettings = useMenuContext();

  const openMenu = useCallback(
    (options: MenuOptions) => {
      const finalOptions = onBeforeMenuOpen ? onBeforeMenuOpen(options) : options;

      if (!finalOptions) {
        return;
      }

      menuSettings?.openMenu(finalOptions);
    },
    [onBeforeMenuOpen, menuSettings],
  );

  const closeMenu = useCallback(() => {
    menuSettings?.closeMenu();
  }, [menuSettings]);

  const menuApi = {
    openMenu,
    closeMenu,
  };

  return <MenuContext.Provider value={menuApi}>{children}</MenuContext.Provider>;
};

/**
 * The general menu provider component that decides whether to use the root or node-level menu provider.
 */
export const MenuProvider = ({ children, onBeforeMenuOpen }: MenuProviderProps) => {
  const menuSettings = useMenuContext();

  if (!menuSettings) {
    return (
      <MenuTreeRootProvider onBeforeMenuOpen={onBeforeMenuOpen}>{children}</MenuTreeRootProvider>
    );
  }

  if (onBeforeMenuOpen) {
    return (
      <MenuTreeNodeProvider onBeforeMenuOpen={onBeforeMenuOpen}>{children}</MenuTreeNodeProvider>
    );
  }

  return <>{children}</>;
};
