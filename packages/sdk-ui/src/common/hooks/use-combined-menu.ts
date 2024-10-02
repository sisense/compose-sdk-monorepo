import { useCallback, useRef } from 'react';
import { MenuOptions } from '../components/menu/types.js';
import { useMenu } from './use-menu.js';

type IsTargetMenuFn = (menuOptions: MenuOptions) => boolean;
type CombineMenusFn = (
  currentMenuOptions: MenuOptions,
  capturedMenuOptions: MenuOptions,
) => MenuOptions;

interface CombinedMenuParams {
  /** Function to determine if the captured menu is the target menu */
  isTargetMenu: IsTargetMenuFn;
  /** Function to combine the current menu options with the captured menu options */
  combineMenus: CombineMenusFn;
}

/**
 * Custom hook to manage a combined menu, allowing you to capture
 * other menu before openning and combine it with the current one.
 *
 * @internal
 */
export const useCombinedMenu = ({ isTargetMenu, combineMenus }: CombinedMenuParams) => {
  const currentMenuOptions = useRef<MenuOptions | null>(null);
  const capturedMenuOptions = useRef<MenuOptions | null>(null);
  const menuApi = useMenu();

  const openCombinedMenu = useCallback(() => {
    if (currentMenuOptions.current) {
      const finalMenuOptions = capturedMenuOptions.current
        ? combineMenus(currentMenuOptions.current, capturedMenuOptions.current)
        : currentMenuOptions.current;

      menuApi.openMenu(finalMenuOptions);
    }
  }, [menuApi, combineMenus]);

  const openMenu = useCallback(
    (options: MenuOptions) => {
      currentMenuOptions.current = options;

      openCombinedMenu();
    },
    [openCombinedMenu],
  );

  const onBeforeMenuOpen = useCallback(
    (options: MenuOptions) => {
      if (isTargetMenu(options)) {
        capturedMenuOptions.current = options;

        openCombinedMenu();

        return null;
      }
      return options;
    },
    [isTargetMenu, openCombinedMenu],
  );

  return {
    openMenu,
    onBeforeMenuOpen,
  };
};
