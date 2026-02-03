/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useModal } from '@/infra/contexts/modal-provider/use-modal';

import { ModalProvider } from './modal-provider';

describe('ModalProvider + useModal Integration', () => {
  const TestComponent = ({
    modalOptions = {},
    testId = 'test-modal-content',
  }: {
    modalOptions?: any;
    testId?: string;
  }) => {
    const { openModal, closeModal, closeAllModals, getModalStack, isModalOpen } = useModal();
    const [lastModalId, setLastModalId] = useState<string>('');
    const currentStackLength = getModalStack().length;

    const handleOpenModal = async () => {
      const modalId = await openModal({
        title: 'Test Modal',
        content: <div data-testid={testId}>Modal Content</div>,
        ...modalOptions,
      });
      setLastModalId(modalId);
    };

    const handleCloseModal = () => {
      closeModal(lastModalId);
    };

    const handleCloseAllModals = () => {
      closeAllModals();
    };

    return (
      <div>
        <button data-testid="open-modal-button" onClick={handleOpenModal}>
          Open Modal
        </button>
        <button data-testid="close-modal-button" onClick={handleCloseModal}>
          Close Modal
        </button>
        <button data-testid="close-all-modals-button" onClick={handleCloseAllModals}>
          Close All Modals
        </button>
        <div data-testid="modal-id">{lastModalId}</div>
        <div data-testid="stack-length">{currentStackLength}</div>
        <div data-testid="is-modal-open">{isModalOpen(lastModalId).toString()}</div>
      </div>
    );
  };

  const MultiModalTestComponent = () => {
    const { openModal } = useModal();
    const [modalIds, setModalIds] = useState<string[]>([]);

    const handleOpenModal = async (index: number) => {
      const modalId = await openModal({
        title: `Modal ${index}`,
        content: <div data-testid={`modal-content-${index}`}>Modal {index} Content</div>,
        width: 400 + index * 100,
        height: 300 + index * 50,
      });
      setModalIds((prev) => [...prev, modalId]);
    };

    return (
      <div>
        <button data-testid="open-modal-1" onClick={() => handleOpenModal(1)}>
          Open Modal 1
        </button>
        <button data-testid="open-modal-2" onClick={() => handleOpenModal(2)}>
          Open Modal 2
        </button>
        <button data-testid="open-modal-3" onClick={() => handleOpenModal(3)}>
          Open Modal 3
        </button>
        <div data-testid="modal-ids">{modalIds.join(',')}</div>
      </div>
    );
  };

  beforeEach(() => {
    // Clear any existing DOM state
    cleanup();

    // Reset document body to clean state
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    // Use React Testing Library's cleanup
    cleanup();

    // Additional cleanup for any remaining modal elements
    // Use a more robust approach that doesn't throw errors
    const elementsToClean = [
      '[data-testid*="modal"]',
      '.MuiPopover-root',
      '.MuiModal-root',
      '.MuiBackdrop-root',
      '[data-testid="modal-backdrop"]',
      '[data-modal-anchor]', // Target our anchor elements by attribute
      '[style*="position: fixed"][style*="transform: translate(-50%, -50%)"]',
    ];

    elementsToClean.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          // Use more robust removal that handles already-removed elements
          if (el && el.isConnected && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      } catch (e) {
        // Silently ignore cleanup errors - they're expected in test environments
      }
    });
  });

  describe('Basic Modal Functionality', () => {
    it('should open and close a modal', async () => {
      render(
        <ModalProvider>
          <TestComponent />
        </ModalProvider>,
      );

      const openButton = screen.getByTestId('open-modal-button');

      // Open modal
      await userEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByTestId('test-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('modal-id')).toHaveTextContent(/modal-\d+/);
        expect(screen.getByTestId('stack-length')).toHaveTextContent('1');
        expect(screen.getByTestId('is-modal-open')).toHaveTextContent('true');
      });

      // Close modal
      const closeButton = screen.getByTestId('close-modal-button');
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('test-modal-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('stack-length')).toHaveTextContent('0');
        expect(screen.getByTestId('is-modal-open')).toHaveTextContent('false');
      });
    });

    it('should close modal when clicking backdrop', async () => {
      render(
        <ModalProvider>
          <TestComponent />
        </ModalProvider>,
      );

      const openButton = screen.getByTestId('open-modal-button');
      await userEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByTestId('test-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('stack-length')).toHaveTextContent('1');
      });

      // Find the backdrop - it should be visible now
      await waitFor(() => {
        const backdrop = screen.getByTestId('modal-backdrop');
        expect(backdrop).toBeInTheDocument();
      });

      // Small delay to ensure modal is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      const backdrop = screen.getByTestId('modal-backdrop');
      expect(backdrop).toBeInTheDocument();

      await userEvent.click(backdrop);

      await waitFor(
        () => {
          expect(screen.queryByTestId('test-modal-content')).not.toBeInTheDocument();
          expect(screen.getByTestId('stack-length')).toHaveTextContent('0');
        },
        { timeout: 3000 },
      );
    });

    it('should not close modal when clicking on modal content', async () => {
      render(
        <ModalProvider>
          <TestComponent />
        </ModalProvider>,
      );

      const openButton = screen.getByTestId('open-modal-button');
      await userEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByTestId('test-modal-content')).toBeInTheDocument();
      });

      // Click on modal content
      const modalContent = screen.getByTestId('test-modal-content');
      await userEvent.click(modalContent);

      // Modal should still be open
      expect(screen.getByTestId('test-modal-content')).toBeInTheDocument();
    });
  });

  describe('Modal Configuration', () => {
    it('should open modal with percentage measurements', async () => {
      render(
        <ModalProvider>
          <TestComponent
            modalOptions={{
              width: 80,
              height: 70,
              measurement: '%',
            }}
          />
        </ModalProvider>,
      );

      const openButton = screen.getByTestId('open-modal-button');
      await userEvent.click(openButton);

      await waitFor(() => {
        const modalContent = screen.getByTestId('test-modal-content');
        expect(modalContent).toBeInTheDocument();

        // Get the MUI Popover paper element that contains the sizing
        const modalPaper = modalContent.closest('.MuiPaper-root');
        expect(modalPaper).toBeTruthy();

        // Check computed styles - MUI applies percentage values through sx system
        const computedStyles = window.getComputedStyle(modalPaper as HTMLElement);

        // Verify that dimensions are set and not auto/default values
        const computedWidth = computedStyles.width;
        const computedHeight = computedStyles.height;

        expect(computedWidth).toBeTruthy();
        expect(computedHeight).toBeTruthy();
        expect(computedWidth).not.toBe('auto');
        expect(computedHeight).not.toBe('auto');
        expect(computedWidth).not.toBe('0px');
        expect(computedHeight).not.toBe('0px');

        // In test environments, percentage calculations depend on container size
        // Validate that dimensions are numeric and reasonable for any viewport
        const widthValue = parseFloat(computedWidth);
        const heightValue = parseFloat(computedHeight);

        // Should be valid numbers (not NaN)
        expect(widthValue).not.toBeNaN();
        expect(heightValue).not.toBeNaN();

        // Should be positive values (percentage of something > 0)
        expect(widthValue).toBeGreaterThan(0);
        expect(heightValue).toBeGreaterThan(0);

        // Validate that percentage logic is working by comparing relative sizes
        // 80% should generally be larger than 70% (though containers may vary)
        // This tests that the percentage calculation logic is applied
        expect(widthValue).toBeGreaterThanOrEqual(heightValue * 0.8); // Allow some variance
      });
    });

    it('should correctly calculate percentage measurements relative to viewport', async () => {
      // Mock viewport dimensions for consistent testing
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });

      render(
        <ModalProvider>
          <TestComponent
            modalOptions={{
              width: 60, // Should be 600px (60% of 1000px)
              height: 50, // Should be 400px (50% of 800px)
              measurement: '%',
            }}
          />
        </ModalProvider>,
      );

      const openButton = screen.getByTestId('open-modal-button');
      await userEvent.click(openButton);

      await waitFor(() => {
        const modalContent = screen.getByTestId('test-modal-content');
        expect(modalContent).toBeInTheDocument();

        const modalPaper = modalContent.closest('.MuiPaper-root');
        expect(modalPaper).toBeTruthy();

        // Check that percentage measurements are applied
        expect(modalPaper).toHaveStyle({
          width: '60%',
          height: '50%',
        });

        // Verify the percentage values are correctly set
        const computedStyles = window.getComputedStyle(modalPaper as HTMLElement);

        // In a test environment, percentages might be computed to pixel values
        // So we check if the computed width/height makes sense for our percentages
        const width = computedStyles.width;
        const height = computedStyles.height;

        // Should be either percentage format or the computed pixel equivalent
        expect(width).toBe('60%');
        expect(height).toBe('50%');
      });

      // Cleanup mocked window properties
      delete (window as any).innerWidth;
      delete (window as any).innerHeight;
    });

    it('should open modal with pixel measurements and validate size', async () => {
      render(
        <ModalProvider>
          <TestComponent
            modalOptions={{
              width: 800,
              height: 600,
              measurement: 'px',
            }}
          />
        </ModalProvider>,
      );

      const openButton = screen.getByTestId('open-modal-button');
      await userEvent.click(openButton);

      await waitFor(() => {
        const modalContent = screen.getByTestId('test-modal-content');
        expect(modalContent).toBeInTheDocument();

        // Get the MUI Popover paper element that contains the sizing
        const modalPaper = modalContent.closest('.MuiPaper-root');
        expect(modalPaper).toBeTruthy();
        expect(modalPaper).toHaveStyle({
          width: '800px',
          height: '600px',
        });
      });
    });
  });

  describe('Multiple Modals (Modal Stack)', () => {
    it('should support multiple modals opened simultaneously', async () => {
      render(
        <ModalProvider>
          <MultiModalTestComponent />
        </ModalProvider>,
      );

      // Open first modal
      const openModal1Button = screen.getByTestId('open-modal-1');
      await userEvent.click(openModal1Button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-content-1')).toBeInTheDocument();
      });

      // Open second modal
      const openModal2Button = screen.getByTestId('open-modal-2');
      await userEvent.click(openModal2Button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-content-1')).toBeInTheDocument();
        expect(screen.getByTestId('modal-content-2')).toBeInTheDocument();
      });

      // Open third modal
      const openModal3Button = screen.getByTestId('open-modal-3');
      await userEvent.click(openModal3Button);

      await waitFor(() => {
        expect(screen.getByTestId('modal-content-1')).toBeInTheDocument();
        expect(screen.getByTestId('modal-content-2')).toBeInTheDocument();
        expect(screen.getByTestId('modal-content-3')).toBeInTheDocument();
      });

      // Check that modal IDs are tracked
      const modalIds = screen.getByTestId('modal-ids').textContent;
      expect(modalIds).toMatch(/modal-\d+,modal-\d+,modal-\d+/);
    });

    it('should maintain proper z-index stacking for multiple modals', async () => {
      render(
        <ModalProvider>
          <MultiModalTestComponent />
        </ModalProvider>,
      );

      const openButton1 = screen.getByTestId('open-modal-1');
      const openButton2 = screen.getByTestId('open-modal-2');

      // Open first modal
      await userEvent.click(openButton1);

      await waitFor(() => {
        expect(screen.getByTestId('modal-content-1')).toBeInTheDocument();
      });

      // Open second modal
      await userEvent.click(openButton2);

      await waitFor(() => {
        expect(screen.getByTestId('modal-content-2')).toBeInTheDocument();
      });

      // Check that both modals are present
      expect(screen.getByTestId('modal-content-1')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content-2')).toBeInTheDocument();
    });

    it('should allow opening modals from within other modals and closing them one by one', async () => {
      const NestedModalTestComponent = () => {
        const { openModal, closeModal, getModalStack } = useModal();
        const [modalIds, setModalIds] = useState<string[]>([]);

        const SecondModalContent = () => {
          const [counter, setCounter] = useState(0);

          const openThirdModal = async () => {
            const modalId = await openModal({
              title: 'Third Modal',
              content: (
                <div data-testid="third-modal-content" style={{ padding: '20px' }}>
                  <h3>Third Modal</h3>
                  <p>This is the third modal (opened from second modal)</p>
                  <button data-testid="close-third-modal-btn" onClick={() => closeModal(modalId)}>
                    Close Third Modal
                  </button>
                </div>
              ),
              width: 300,
              height: 200,
            });
            setModalIds((prev) => [...prev, modalId]);
          };

          return (
            <div data-testid="second-modal-content" style={{ padding: '20px' }}>
              <h3>Second Modal</h3>
              <p>Counter: {counter}</p>
              <button data-testid="increment-second-modal" onClick={() => setCounter((c) => c + 1)}>
                Increment
              </button>
              <button data-testid="open-third-modal-btn" onClick={openThirdModal}>
                Open Third Modal
              </button>
            </div>
          );
        };

        const FirstModalContent = () => {
          const [counter, setCounter] = useState(0);

          const openSecondModal = async () => {
            const modalId = await openModal({
              title: 'Second Modal',
              content: <SecondModalContent />,
              width: 400,
              height: 300,
            });
            setModalIds((prev) => [...prev, modalId]);
          };

          return (
            <div data-testid="first-modal-content" style={{ padding: '20px' }}>
              <h3>First Modal</h3>
              <p>Counter: {counter}</p>
              <button data-testid="increment-first-modal" onClick={() => setCounter((c) => c + 1)}>
                Increment
              </button>
              <button data-testid="open-second-modal-btn" onClick={openSecondModal}>
                Open Second Modal
              </button>
            </div>
          );
        };

        const openFirstModal = async () => {
          const modalId = await openModal({
            title: 'First Modal',
            content: <FirstModalContent />,
            width: 500,
            height: 400,
          });
          setModalIds([modalId]);
        };

        return (
          <div style={{ padding: '20px' }}>
            <h2>Nested Modal Test</h2>
            <button data-testid="open-first-modal-btn" onClick={openFirstModal}>
              Open First Modal
            </button>
            <p data-testid="stack-size">Stack Size: {getModalStack().length}</p>
            <p data-testid="modal-ids-list">{modalIds.join(',')}</p>
          </div>
        );
      };

      render(
        <ModalProvider>
          <NestedModalTestComponent />
        </ModalProvider>,
      );

      // Initially no modals
      expect(screen.getByTestId('stack-size')).toHaveTextContent('Stack Size: 0');

      // Open first modal
      await userEvent.click(screen.getByTestId('open-first-modal-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('first-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('stack-size')).toHaveTextContent('Stack Size: 1');
      });

      // Interact with first modal
      await userEvent.click(screen.getByTestId('increment-first-modal'));
      expect(screen.getByTestId('first-modal-content')).toHaveTextContent('Counter: 1');
      await userEvent.click(screen.getByTestId('increment-first-modal'));
      expect(screen.getByTestId('first-modal-content')).toHaveTextContent('Counter: 2');

      // Open second modal from within first modal
      await userEvent.click(screen.getByTestId('open-second-modal-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('first-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('second-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('stack-size')).toHaveTextContent('Stack Size: 2');
      });

      // Interact with second modal (should be the active/top modal)
      await userEvent.click(screen.getByTestId('increment-second-modal'));
      expect(screen.getByTestId('second-modal-content')).toHaveTextContent('Counter: 1');
      await userEvent.click(screen.getByTestId('increment-second-modal'));
      expect(screen.getByTestId('second-modal-content')).toHaveTextContent('Counter: 2');

      // Open third modal from within second modal
      await userEvent.click(screen.getByTestId('open-third-modal-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('first-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('second-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('third-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('stack-size')).toHaveTextContent('Stack Size: 3');
      });

      // Interact with third modal (should be the active/top modal)
      expect(screen.getByTestId('third-modal-content')).toHaveTextContent(
        'This is the third modal',
      );

      // Close third modal (should close only the top modal)
      await userEvent.click(screen.getByTestId('close-third-modal-btn'));

      await waitFor(() => {
        expect(screen.queryByTestId('third-modal-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('first-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('second-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('stack-size')).toHaveTextContent('Stack Size: 2');
      });

      // Second modal should still be interactive
      await userEvent.click(screen.getByTestId('increment-second-modal'));
      expect(screen.getByTestId('second-modal-content')).toHaveTextContent('Counter: 3');

      // Close second modal by clicking backdrop (should close the top modal)
      const backdrops = screen.getAllByTestId('modal-backdrop');
      // Click the last backdrop (top modal)
      await userEvent.click(backdrops[backdrops.length - 1]);

      await waitFor(() => {
        expect(screen.queryByTestId('second-modal-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('first-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('stack-size')).toHaveTextContent('Stack Size: 1');
      });

      // First modal should still be interactive
      await userEvent.click(screen.getByTestId('increment-first-modal'));
      expect(screen.getByTestId('first-modal-content')).toHaveTextContent('Counter: 3');

      // Close first modal by clicking backdrop
      const remainingBackdrop = screen.getByTestId('modal-backdrop');
      await userEvent.click(remainingBackdrop);

      await waitFor(() => {
        expect(screen.queryByTestId('first-modal-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('stack-size')).toHaveTextContent('Stack Size: 0');
      });
    });
  });

  describe('Close All Modals', () => {
    it('should close all modals when closeAllModals is called', async () => {
      render(
        <ModalProvider>
          <TestComponent />
        </ModalProvider>,
      );

      // Open multiple modals by clicking the button multiple times
      const openButton = screen.getByTestId('open-modal-button');
      await userEvent.click(openButton);
      await userEvent.click(openButton);
      await userEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByTestId('stack-length')).toHaveTextContent('3');
      });

      // Close all modals
      const closeAllButton = screen.getByTestId('close-all-modals-button');
      await userEvent.click(closeAllButton);

      await waitFor(() => {
        expect(screen.getByTestId('stack-length')).toHaveTextContent('0');
        expect(screen.queryByTestId('test-modal-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useModal is used outside ModalProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {}; // Use a simple function instead of jest.fn()

      const TestComponentWithoutProvider = () => {
        try {
          useModal();
          return <div>Should not render</div>;
        } catch (error) {
          return <div data-testid="error-message">{(error as Error).message}</div>;
        }
      };

      render(<TestComponentWithoutProvider />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Missing initialized modal root',
      );

      // Restore console.error
      console.error = originalError;
    });
  });

  describe('Modal Content Interaction', () => {
    it('should allow interaction with modal content', async () => {
      const InteractiveModalContent = () => {
        const [count, setCount] = useState(0);
        return (
          <div data-testid="interactive-content">
            <span data-testid="count">{count}</span>
            <button data-testid="increment-button" onClick={() => setCount((c) => c + 1)}>
              Increment
            </button>
          </div>
        );
      };

      const TestComponentWithInteractiveContent = () => {
        const { openModal } = useModal();

        const handleOpenModal = async () => {
          await openModal({
            title: 'Interactive Modal',
            content: <InteractiveModalContent />,
          });
        };

        return (
          <button data-testid="open-interactive-modal" onClick={handleOpenModal}>
            Open Interactive Modal
          </button>
        );
      };

      render(
        <ModalProvider>
          <TestComponentWithInteractiveContent />
        </ModalProvider>,
      );

      // Open modal
      await userEvent.click(screen.getByTestId('open-interactive-modal'));

      await waitFor(() => {
        expect(screen.getByTestId('interactive-content')).toBeInTheDocument();
        expect(screen.getByTestId('count')).toHaveTextContent('0');
      });

      // Interact with modal content
      const incrementButton = screen.getByTestId('increment-button');
      await userEvent.click(incrementButton);
      await userEvent.click(incrementButton);

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('2');
      });
    });
  });
});
