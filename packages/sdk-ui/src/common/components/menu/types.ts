import { MenuPosition, MenuItemSection } from '@/types';

export type MenuOptions = {
  position: MenuPosition;
  itemSections: MenuItemSection[];
  onClose?: () => void;
};

/** @internal */
export type BeforeMenuOpenHandler = (options: MenuOptions) => MenuOptions | null;
export type OpenMenuFn = (options: MenuOptions) => void;
