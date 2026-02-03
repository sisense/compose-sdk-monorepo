import { useModalContext } from '@/infra/contexts/modal-provider';
import { TranslatableError } from '@/infra/translation/translatable-error.js';

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
