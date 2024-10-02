import { ComponentDecorator } from './as-sisense-component';
import { useMenuContext } from '@/common/components/menu/menu-context';
import { MenuProvider } from '@/common/components/menu/menu-provider';

type MenuConfig = {
  shouldHaveOwnMenuRoot?: boolean;
};

export const withMenu: ComponentDecorator<MenuConfig> = ({ shouldHaveOwnMenuRoot } = {}) => {
  return (Component) => {
    return function MenuRoot(props) {
      const menuContext = useMenuContext();
      const hasParentMenuRoot = !!menuContext;
      const shouldInitializeMenuRoot = shouldHaveOwnMenuRoot && !hasParentMenuRoot;

      if (shouldInitializeMenuRoot) {
        return (
          <MenuProvider>
            <Component {...props} />
          </MenuProvider>
        );
      }

      return <Component {...props} />;
    };
  };
};
