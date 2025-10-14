import { useModalContext } from '@/common/components/modal';
import { TranslatableError } from '@/translation/translatable-error.js';

/**
 * Hook to access modal API.
 *
 * Throws an error if used outside the modal context.
 *
 * @internal
 */
export const useModal = () => {
  const modalContext = useModalContext();

  if (!modalContext) {
    throw new TranslatableError('errors.missingModalRoot');
  }

  return modalContext;
};
