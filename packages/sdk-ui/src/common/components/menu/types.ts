import { MenuPosition, MenuItemSection } from '@/types';

export type MenuOptions = {
  position: MenuPosition;
  itemSections: MenuItemSection[];
};

export type BeforeMenuOpenHandler = (options: MenuOptions) => MenuOptions | null;
export type OpenMenuFn = (options: MenuOptions) => void;
