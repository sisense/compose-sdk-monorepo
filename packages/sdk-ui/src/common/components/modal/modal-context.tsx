import { createContext, useContext } from 'react';
import { SizeMeasurement } from '@/types';

export interface ModalOptions {
  title?: string;
  content: React.ReactNode;
  width?: number;
  height?: number;
  measurement?: SizeMeasurement;
}

export type ModalInstance = {
  id: string;
  options: ModalOptions;
  anchorEl: HTMLElement;
  resolve: () => void;
};

export type OpenModalFn = (options: ModalOptions) => Promise<string>; // Returns modal ID
export type CloseModalFn = (modalId?: string) => void; // Close specific modal or top modal

type ModalSettings = {
  openModal: OpenModalFn;
  closeModal: CloseModalFn;
  closeAllModals: () => void;
  getModalStack: () => ModalInstance[];
  isModalOpen: (modalId: string) => boolean;
};

export const ModalContext = createContext<ModalSettings | null>(null);

/**
 * Hook to get the modal context (modal API)
 *
 * @returns The modal context
 * @internal
 */
export const useModalContext = () => useContext(ModalContext);
