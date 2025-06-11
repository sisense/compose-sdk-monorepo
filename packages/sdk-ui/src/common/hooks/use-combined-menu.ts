import { useCallback, useRef } from 'react';
import { MenuOptions } from '../components/menu/types.js';
import { useMenu } from './use-menu.js';

export type CombineMenusFn = (menusOptions: MenuOptions[]) => MenuOptions;

export interface CombinedMenuParams {
  /** Function to combine the current menu options with the captured menu options */
  combineMenus: CombineMenusFn;
}

/**
 * Custom hook to manage a combined menu flow,
 * allowing to combine multiple menus options opened one after the other.
 *
 * @internal
 */
export const useCombinedMenu = ({ combineMenus }: CombinedMenuParams) => {
  const capturedMenusOptions = useRef<MenuOptions[]>([]);
  const menuApi = useMenu();

  const openCombinedMenu = useCallback(() => {
    const combinedMenusOptions =
      capturedMenusOptions.current.length === 1
        ? capturedMenusOptions.current[0]
        : combineMenus(capturedMenusOptions.current);

    menuApi.openMenu({
      ...combinedMenusOptions,
      onClose: () => {
        capturedMenusOptions.current = [];
      },
    });
  }, [menuApi, combineMenus]);

  const openMenu = useCallback(
    (options: MenuOptions) => {
      capturedMenusOptions.current.push(options);

      openCombinedMenu();
    },
    [openCombinedMenu],
  );

  return {
    openMenu,
  };
};
