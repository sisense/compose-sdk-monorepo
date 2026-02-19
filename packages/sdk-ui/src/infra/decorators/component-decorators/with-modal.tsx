import { useModalContext } from '@/infra/contexts/modal-provider/modal-context';
import { ModalProvider } from '@/infra/contexts/modal-provider/modal-provider';

import { ComponentDecorator } from './as-sisense-component';

type ModalConfig = {
  shouldHaveOwnModalRoot?: boolean;
};

export const withModal: ComponentDecorator<ModalConfig> = ({ shouldHaveOwnModalRoot } = {}) => {
  return (Component) => {
    return function ModalRoot(props) {
      const modalContext = useModalContext();
      const hasParentModalRoot = !!modalContext;
      const shouldInitializeModalRoot = shouldHaveOwnModalRoot && !hasParentModalRoot;

      if (shouldInitializeModalRoot) {
        return (
          <ModalProvider>
            <Component {...props} />
          </ModalProvider>
        );
      }

      return <Component {...props} />;
    };
  };
};
