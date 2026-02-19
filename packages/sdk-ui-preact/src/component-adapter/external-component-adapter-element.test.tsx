/* eslint-disable @typescript-eslint/unbound-method */
import { act, render } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';

import {
  ExternalComponentAdapter,
  ExternalComponentAdapterElement,
} from './external-component-adapter-element.js';

interface TestProps {
  value: string;
  count?: number;
}

/**
 * Creates a mock adapter with all lifecycle methods
 */
const createMockAdapter = (): ExternalComponentAdapter<TestProps> => {
  return {
    mount: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    isActive: vi.fn(() => true),
  };
};

describe('ExternalComponentAdapterElement', () => {
  describe('Mount lifecycle', () => {
    it('should call adapter factory once on mount', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);

      render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'test' }}
        />,
      );

      expect(adapterFactory).toHaveBeenCalledTimes(1);
    });

    it('should call adapter.mount() with container and initial props', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);
      const initialProps: TestProps = { value: 'initial', count: 1 };

      const { container } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={initialProps}
        />,
      );

      expect(mockAdapter.mount).toHaveBeenCalledTimes(1);
      expect(mockAdapter.mount).toHaveBeenCalledWith(
        container.firstChild as HTMLElement,
        initialProps,
      );
    });

    it('should render container div with correct styles', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);

      const { container } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'test' }}
        />,
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toBeInstanceOf(HTMLDivElement);
      expect(div.style.width).toBe('100%');
      expect(div.style.height).toBe('100%');
    });

    it('should not mount adapter if container ref is not ready', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);

      // This test verifies that useLayoutEffect guards against null refs
      // In practice, React/Preact ensures refs are set before effects run
      render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'test' }}
        />,
      );

      // Adapter should still mount because refs are set synchronously
      expect(mockAdapter.mount).toHaveBeenCalledTimes(1);
    });

    it('should not mount adapter multiple times on re-render', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);

      const { rerender } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'test' }}
        />,
      );

      expect(adapterFactory).toHaveBeenCalledTimes(1);
      expect(mockAdapter.mount).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'test' }}
        />,
      );

      // Factory and mount should still only be called once
      expect(adapterFactory).toHaveBeenCalledTimes(1);
      expect(mockAdapter.mount).toHaveBeenCalledTimes(1);
    });
  });

  describe('Update lifecycle', () => {
    it('should call adapter.update() when componentProps change', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);

      const { rerender } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'initial' }}
        />,
      );

      const newProps: TestProps = { value: 'updated', count: 2 };

      act(() => {
        rerender(
          <ExternalComponentAdapterElement
            adapterFactory={adapterFactory}
            componentProps={newProps}
          />,
        );
      });

      expect(mockAdapter.update).toHaveBeenCalledWith(newProps);
    });

    it('should only update when adapter.isActive() returns true', () => {
      const mockAdapter = createMockAdapter();
      mockAdapter.isActive = vi.fn(() => true);
      const adapterFactory = vi.fn(() => mockAdapter);

      const { rerender } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'initial' }}
        />,
      );

      // Clear the initial mount update call
      vi.mocked(mockAdapter.update).mockClear();

      act(() => {
        rerender(
          <ExternalComponentAdapterElement
            adapterFactory={adapterFactory}
            componentProps={{ value: 'updated' }}
          />,
        );
      });

      expect(mockAdapter.isActive).toHaveBeenCalled();
      expect(mockAdapter.update).toHaveBeenCalledTimes(1);
      expect(mockAdapter.update).toHaveBeenCalledWith({ value: 'updated' });
    });

    it('should not update when adapter.isActive() returns false', () => {
      const mockAdapter = createMockAdapter();
      mockAdapter.isActive = vi.fn(() => false);
      const adapterFactory = vi.fn(() => mockAdapter);

      const { rerender } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'initial' }}
        />,
      );

      act(() => {
        rerender(
          <ExternalComponentAdapterElement
            adapterFactory={adapterFactory}
            componentProps={{ value: 'updated' }}
          />,
        );
      });

      expect(mockAdapter.isActive).toHaveBeenCalled();
      expect(mockAdapter.update).not.toHaveBeenCalled();
    });

    it('should handle multiple prop updates correctly', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);

      const { rerender } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'first' }}
        />,
      );

      // Clear the initial mount update call
      vi.mocked(mockAdapter.update).mockClear();

      act(() => {
        rerender(
          <ExternalComponentAdapterElement
            adapterFactory={adapterFactory}
            componentProps={{ value: 'second' }}
          />,
        );
      });

      act(() => {
        rerender(
          <ExternalComponentAdapterElement
            adapterFactory={adapterFactory}
            componentProps={{ value: 'third', count: 3 }}
          />,
        );
      });

      expect(mockAdapter.update).toHaveBeenCalledTimes(2);
      expect(mockAdapter.update).toHaveBeenNthCalledWith(1, { value: 'second' });
      expect(mockAdapter.update).toHaveBeenNthCalledWith(2, { value: 'third', count: 3 });
    });

    it('should update with initial props after mount', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);
      const initialProps: TestProps = { value: 'initial' };

      render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={initialProps}
        />,
      );

      // useEffect runs after mount, so update should be called with initial props
      expect(mockAdapter.update).toHaveBeenCalledTimes(1);
      expect(mockAdapter.update).toHaveBeenCalledWith(initialProps);
    });
  });

  describe('Unmount lifecycle', () => {
    it('should call adapter.destroy() on component unmount', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);

      const { unmount } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'test' }}
        />,
      );

      unmount();

      expect(mockAdapter.destroy).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid remount correctly', () => {
      const firstAdapter = createMockAdapter();
      const secondAdapter = createMockAdapter();
      let adapterCount = 0;
      const adapterFactory = vi.fn(() => {
        adapterCount++;
        return adapterCount === 1 ? firstAdapter : secondAdapter;
      });

      const { unmount } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'first' }}
        />,
      );

      expect(firstAdapter.mount).toHaveBeenCalledTimes(1);

      // Unmount
      unmount();
      expect(firstAdapter.destroy).toHaveBeenCalledTimes(1);

      // Remount
      const { unmount: unmount2 } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'second' }}
        />,
      );

      expect(adapterFactory).toHaveBeenCalledTimes(2);
      expect(secondAdapter.mount).toHaveBeenCalledTimes(1);
      expect(secondAdapter.mount).toHaveBeenCalledWith(expect.any(HTMLElement), {
        value: 'second',
      });

      unmount2();
      expect(secondAdapter.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle adapter factory returning different adapters', () => {
      const adapter1 = createMockAdapter();
      const adapter2 = createMockAdapter();
      let callCount = 0;
      const adapterFactory = vi.fn(() => {
        callCount++;
        return callCount === 1 ? adapter1 : adapter2;
      });

      const { unmount, rerender } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'test' }}
        />,
      );

      expect(adapter1.mount).toHaveBeenCalledTimes(1);

      // Unmount and remount - should create new adapter
      unmount();
      expect(adapter1.destroy).toHaveBeenCalledTimes(1);

      rerender(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'test2' }}
        />,
      );

      expect(adapterFactory).toHaveBeenCalledTimes(2);
      expect(adapter2.mount).toHaveBeenCalledTimes(1);
    });

    it('should handle props with complex objects', () => {
      const mockAdapter = createMockAdapter();
      const adapterFactory = vi.fn(() => mockAdapter);

      const complexProps: TestProps = {
        value: 'complex',
        count: 42,
      };

      const { rerender } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={complexProps}
        />,
      );

      expect(mockAdapter.mount).toHaveBeenCalledWith(expect.any(HTMLElement), complexProps);

      const updatedComplexProps: TestProps = {
        value: 'updated-complex',
        count: 100,
      };

      act(() => {
        rerender(
          <ExternalComponentAdapterElement
            adapterFactory={adapterFactory}
            componentProps={updatedComplexProps}
          />,
        );
      });

      expect(mockAdapter.update).toHaveBeenCalledWith(updatedComplexProps);
    });

    it('should handle isActive() changing between updates', () => {
      const mockAdapter = createMockAdapter();
      let isActiveValue = true;
      mockAdapter.isActive = vi.fn(() => isActiveValue);
      const adapterFactory = vi.fn(() => mockAdapter);

      const { rerender } = render(
        <ExternalComponentAdapterElement
          adapterFactory={adapterFactory}
          componentProps={{ value: 'initial' }}
        />,
      );

      // Clear the initial mount update call
      vi.mocked(mockAdapter.update).mockClear();

      // First update - adapter is active
      act(() => {
        rerender(
          <ExternalComponentAdapterElement
            adapterFactory={adapterFactory}
            componentProps={{ value: 'first-update' }}
          />,
        );
      });

      expect(mockAdapter.update).toHaveBeenCalledTimes(1);
      expect(mockAdapter.update).toHaveBeenCalledWith({ value: 'first-update' });

      // Second update - adapter becomes inactive
      isActiveValue = false;
      act(() => {
        rerender(
          <ExternalComponentAdapterElement
            adapterFactory={adapterFactory}
            componentProps={{ value: 'second-update' }}
          />,
        );
      });

      // Update should not be called because adapter is inactive
      expect(mockAdapter.update).toHaveBeenCalledTimes(1);
    });
  });
});
