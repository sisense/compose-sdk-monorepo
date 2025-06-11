import { TranslatableError } from '@/translation/translatable-error.js';
import { useModalContext } from '../components/modal/modal-context.js';

/**
 * Hook to access modal API.
 *
 * Throws an error if used outside the modal context.
 *
 * @internal
 */
export const useModal = () => {
  const modalSettings = useModalContext();

  if (!modalSettings) {
    throw new TranslatableError('errors.missingModalRoot');
  }

  const { openModal, closeModal } = modalSettings;

  return {
    openModal,
    closeModal,
  };
};
