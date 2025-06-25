import { MenuPosition, MenuItemSection, MenuAlignment } from '@/types';

export type MenuOptions = {
  /** @internal */
  readonly id?: string;
  position: MenuPosition;
  itemSections: MenuItemSection[];
  onClose?: () => void;
  /** @internal */
  alignment?: MenuAlignment;
};

/** @internal */
export type BeforeMenuOpenHandler = (options: MenuOptions) => MenuOptions | null;
export type OpenMenuFn = (options: MenuOptions) => void;
