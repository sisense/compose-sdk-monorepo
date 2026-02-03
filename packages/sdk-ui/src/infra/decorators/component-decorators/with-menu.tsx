import { useMenuContext } from '@/infra/contexts/menu-provider/menu-context';
import { MenuProvider } from '@/infra/contexts/menu-provider/menu-provider';

import { ComponentDecorator } from './as-sisense-component';

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
