import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { ModalContext, useModalContext, ModalOptions, ModalInstance } from './modal-context';
import { Popover } from '@/common/components/popover';

export interface ModalProviderProps {
  children?: React.ReactNode;
}

// Generate unique modal IDs
let modalIdCounter = 0;
const generateModalId = () => `modal-${++modalIdCounter}`;

// Track anchor elements for cleanup
const anchorElementsToCleanup = new Set<HTMLElement>();

/**
 * The root-level provider component for managing and displaying modals.
 * This component provides the modal API for controlling modal components.
 */
const ModalTreeRootProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalStack, setModalStack] = useState<ModalInstance[]>([]);
  // Keep a ref for synchronous modal stack reads
  const modalStackRef = useRef<ModalInstance[]>([]);

  // Clean up anchor elements when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup all anchor elements on unmount
      anchorElementsToCleanup.forEach((anchorEl) => {
        try {
          if (
            anchorEl &&
            anchorEl.parentNode &&
            anchorEl.parentNode === document.body &&
            document.body.contains(anchorEl)
          ) {
            document.body.removeChild(anchorEl);
          }
        } catch (e) {
          // Silently ignore cleanup errors - element may already be removed
        }
      });
      anchorElementsToCleanup.clear();
    };
  }, []);

  const openModal = useCallback((options: ModalOptions): Promise<string> => {
    return new Promise<string>((resolve) => {
      const modalId = generateModalId();

      // Create a temporary anchor element at the center of the screen
      let anchorEl: HTMLElement;
      try {
        anchorEl = document.createElement('div');
        anchorEl.style.position = 'fixed';
        anchorEl.style.top = '50%';
        anchorEl.style.left = '50%';
        anchorEl.style.transform = 'translate(-50%, -50%)';
        anchorEl.style.width = '1px';
        anchorEl.style.height = '1px';
        anchorEl.style.pointerEvents = 'none';
        anchorEl.style.visibility = 'hidden'; // Make it truly invisible
        anchorEl.setAttribute('data-modal-anchor', modalId); // Add identifier for debugging

        // Only add to DOM if document.body exists and is available
        if (document.body && typeof document.body.appendChild === 'function') {
          document.body.appendChild(anchorEl);
          // Track for cleanup only if successfully added
          anchorElementsToCleanup.add(anchorEl);
        } else {
          // If we can't add to body, create a detached element
          console.warn('Modal: Unable to append anchor element to document body');
        }
      } catch (e) {
        // Fallback: create a simple detached div if DOM manipulation fails
        console.warn('Modal: Failed to create anchor element:', e);
        anchorEl = document.createElement('div');
        anchorEl.setAttribute('data-modal-anchor', modalId);
      }

      const modalInstance: ModalInstance = {
        id: modalId,
        options,
        anchorEl,
        resolve: () => resolve(modalId),
      };

      setModalStack((prev) => {
        const newStack = [...prev, modalInstance];
        modalStackRef.current = newStack;
        return newStack;
      });

      // Resolve immediately with the modal ID
      resolve(modalId);
    });
  }, []);

  const closeModal = useCallback((modalId?: string) => {
    setModalStack((prevStack) => {
      if (!modalId) {
        // Close the top modal if no specific ID provided
        const newStack = prevStack.slice(0, -1);
        modalStackRef.current = newStack;
        // Clean up anchor element for the closed modal
        const closedModal = prevStack[prevStack.length - 1];
        if (closedModal?.anchorEl) {
          // Defer cleanup to avoid React lifecycle conflicts
          setTimeout(() => {
            try {
              if (
                closedModal.anchorEl &&
                closedModal.anchorEl.parentNode &&
                closedModal.anchorEl.parentNode === document.body &&
                document.body.contains(closedModal.anchorEl)
              ) {
                document.body.removeChild(closedModal.anchorEl);
                anchorElementsToCleanup.delete(closedModal.anchorEl);
              }
            } catch (e) {
              // Silently ignore cleanup errors - element may already be removed
            }
          }, 0);
        }
        if (closedModal) {
          closedModal.resolve();
        }
        return newStack;
      }

      // Find and clean up the specific modal
      const modalToClose = prevStack.find((modal) => modal.id === modalId);
      if (modalToClose?.anchorEl) {
        // Defer cleanup to avoid React lifecycle conflicts
        setTimeout(() => {
          try {
            if (
              modalToClose.anchorEl &&
              modalToClose.anchorEl.parentNode &&
              modalToClose.anchorEl.parentNode === document.body &&
              document.body.contains(modalToClose.anchorEl)
            ) {
              document.body.removeChild(modalToClose.anchorEl);
              anchorElementsToCleanup.delete(modalToClose.anchorEl);
            }
          } catch (e) {
            // Silently ignore cleanup errors - element may already be removed
          }
        }, 0);
      }
      if (modalToClose) {
        modalToClose.resolve();
      }

      const newStack = prevStack.filter((modal) => modal.id !== modalId);
      modalStackRef.current = newStack;
      return newStack;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack((prevStack) => {
      // Clean up all anchor elements
      prevStack.forEach((modal) => {
        if (modal.anchorEl) {
          // Defer cleanup to avoid React lifecycle conflicts
          setTimeout(() => {
            try {
              if (
                modal.anchorEl &&
                modal.anchorEl.parentNode &&
                modal.anchorEl.parentNode === document.body &&
                document.body.contains(modal.anchorEl)
              ) {
                document.body.removeChild(modal.anchorEl);
                anchorElementsToCleanup.delete(modal.anchorEl);
              }
            } catch (e) {
              // Silently ignore cleanup errors - element may already be removed
            }
          }, 0);
        }
        modal.resolve();
      });
      modalStackRef.current = [];
      return [];
    });
  }, []);

  const getModalStack = useCallback(() => modalStackRef.current, []);

  const isModalOpen = useCallback(
    (modalId: string) => {
      return modalStack.some((modal) => modal.id === modalId);
    },
    [modalStack],
  );

  const handleBackdropClick = useCallback(
    (modalId: string) => {
      closeModal(modalId);
    },
    [closeModal],
  );

  // Note: should have memoization to prevent redundant context update due to component state change
  const modalApi = useMemo(() => {
    return {
      openModal,
      closeModal,
      closeAllModals,
      getModalStack,
      isModalOpen,
    };
  }, [openModal, closeModal, closeAllModals, getModalStack, isModalOpen]);

  return (
    <ModalContext.Provider value={modalApi}>
      {/* Render all modals in the stack */}
      {modalStack.map((modal, index) => {
        const { options } = modal;

        // Default Popover-based modal
        const modalWidth =
          options.measurement === '%' ? `${options.width || 80}%` : `${options.width || 1200}px`;
        const modalHeight =
          options.measurement === '%' ? `${options.height || 80}%` : `${options.height || 800}px`;

        return (
          <div key={modal.id}>
            <div
              // Wrapper div to handle clicks outside the modal
              data-testid="modal-backdrop"
              onClick={(e: React.MouseEvent) => {
                // Check if click is outside the modal content
                const target = e.target as HTMLElement;
                const paper = target.closest('.MuiPaper-root');
                if (!paper) {
                  handleBackdropClick(modal.id);
                }
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200 + index, // Backdrop layer - below menu z-index
              }}
            >
              <Popover
                open={true}
                position={{
                  anchorEl: modal.anchorEl,
                  anchorOrigin: { vertical: 'center', horizontal: 'center' },
                  contentOrigin: { vertical: 'center', horizontal: 'center' },
                }}
                onClose={() => closeModal(modal.id)}
                // Use Popover's own backdrop with proper styling
                BackdropProps={{
                  style: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  },
                }}
                style={{
                  zIndex: 1200 + index + 10, // Modal content layer - above backdrop but below menus
                }}
                slotProps={{
                  paper: {
                    sx: {
                      display: 'flex',
                      width: modalWidth,
                      height: modalHeight,
                      maxWidth: '95vw',
                      maxHeight: '95vh',
                      position: 'relative',
                      zIndex: 1200 + index + 10, // Modal paper - above backdrop but below menus
                    },
                  },
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Dashboard Content */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>{options.content}</div>
                </div>
              </Popover>
            </div>
          </div>
        );
      })}
      {children}
    </ModalContext.Provider>
  );
};

/**
 * The node-level provider component for managing and displaying modals.
 * This component provides the proxy access to the root modal API.
 */
const ModalTreeNodeProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const modalSettings = useModalContext();

  const openModal = useCallback(
    (options: ModalOptions) => {
      return modalSettings?.openModal(options) || Promise.resolve('');
    },
    [modalSettings],
  );

  const closeModal = useCallback(
    (modalId?: string) => {
      modalSettings?.closeModal(modalId);
    },
    [modalSettings],
  );

  const closeAllModals = useCallback(() => {
    modalSettings?.closeAllModals();
  }, [modalSettings]);

  const getModalStack = useCallback(() => {
    return modalSettings?.getModalStack() || [];
  }, [modalSettings]);

  const isModalOpen = useCallback(
    (modalId: string) => {
      return modalSettings?.isModalOpen(modalId) || false;
    },
    [modalSettings],
  );

  const modalApi = {
    openModal,
    closeModal,
    closeAllModals,
    getModalStack,
    isModalOpen,
  };

  return <ModalContext.Provider value={modalApi}>{children}</ModalContext.Provider>;
};

/**
 * The general modal provider component that decides whether to use the root or node-level modal provider.
 */
export const ModalProvider = ({ children }: ModalProviderProps) => {
  const modalSettings = useModalContext();

  if (!modalSettings) {
    return <ModalTreeRootProvider>{children}</ModalTreeRootProvider>;
  }

  return <ModalTreeNodeProvider>{children}</ModalTreeNodeProvider>;
};

// Export the individual providers for direct use
export { ModalTreeRootProvider, ModalTreeNodeProvider };
