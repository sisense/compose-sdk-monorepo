/* eslint-disable @typescript-eslint/unbound-method */

/** @vitest-environment jsdom */
import { ChangeDetectorRef, ComponentRef, reflectComponentType } from '@angular/core';
import { Mock, Mocked } from 'vitest';

import { AngularComponentAdapter } from './angular-component-adapter';
import { DynamicRenderer, RenderedComponent } from './dynamic-renderer.service';

// Mock reflectComponentType to avoid JIT compilation requirement
vi.mock('@angular/core', async () => {
  const actual = await vi.importActual('@angular/core');
  return {
    ...actual,
    reflectComponentType: vi.fn(),
  };
});

const reflectComponentTypeMock = reflectComponentType as Mock;

// Mock component type (doesn't need real @Component decorator for tests)
class TestComponent {
  testInput?: string;

  aliasedProp?: number;

  regularProp?: string;

  callback?: () => void;
}

// Mock component without inputs
class SimpleComponent {
  regularProp?: string;
}

describe('AngularComponentAdapter', () => {
  let adapter: AngularComponentAdapter<any>;
  let dynamicRendererMock: Mocked<DynamicRenderer>;
  let componentRefMock: Mocked<ComponentRef<any>>;
  let changeDetectorRefMock: Mocked<ChangeDetectorRef>;
  let containerElement: HTMLElement;
  let renderedElement: HTMLElement;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock reflectComponentType to return input metadata for TestComponent
    reflectComponentTypeMock.mockImplementation((componentClass: any) => {
      if (componentClass === TestComponent) {
        return {
          inputs: [
            { propName: 'testInput', templateName: 'testInput' },
            { propName: 'aliasedProp', templateName: 'aliasedInput' },
          ],
        };
      }
      if (componentClass === SimpleComponent) {
        return { inputs: [] };
      }
      return null;
    });

    // Create DOM elements
    containerElement = document.createElement('div');
    renderedElement = document.createElement('div');
    renderedElement.textContent = 'Rendered Component';

    // Create mock change detector
    changeDetectorRefMock = {
      detectChanges: vi.fn(),
      markForCheck: vi.fn(),
      detach: vi.fn(),
      reattach: vi.fn(),
      checkNoChanges: vi.fn(),
    } as unknown as Mocked<ChangeDetectorRef>;

    // Create mock component ref
    componentRefMock = {
      instance: {},
      hostView: {},
      changeDetectorRef: changeDetectorRefMock,
      setInput: vi.fn(),
      destroy: vi.fn(),
      location: {
        nativeElement: renderedElement,
      },
    } as unknown as Mocked<ComponentRef<any>>;

    // Create mock rendered component result
    const renderedComponentMock: RenderedComponent = {
      element: renderedElement,
      componentRef: componentRefMock,
      destroy: vi.fn(),
    };

    // Create mock dynamic renderer
    dynamicRendererMock = {
      renderComponent: vi.fn().mockReturnValue(renderedComponentMock),
    } as unknown as Mocked<DynamicRenderer>;
  });

  describe('constructor', () => {
    it('should create adapter with input names extracted from component metadata', () => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);

      expect(adapter).toBeTruthy();
    });

    it('should handle components without inputs', () => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, SimpleComponent);

      expect(adapter).toBeTruthy();
    });

    it('should handle components with null reflection metadata', () => {
      // Mock reflectComponentType to return null (edge case)
      reflectComponentTypeMock.mockReturnValueOnce(null);

      // Create a dummy component class
      class UnknownComponent {}

      adapter = new AngularComponentAdapter(dynamicRendererMock, UnknownComponent as any);

      expect(adapter).toBeTruthy();
      // Should initialize with empty input names
      adapter.mount(containerElement, {});
      adapter.update({ someProp: 'value' });
      // All props should be treated as non-inputs (direct assignment)
      expect(componentRefMock.instance.someProp).toBe('value');
      expect(changeDetectorRefMock.detectChanges).toHaveBeenCalled();
    });

    it('should extract both property names and aliases from @Input decorators', () => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);

      // Verify by mounting and then updating with both prop name and alias
      adapter.mount(containerElement, {});

      const props = {
        testInput: 'value1',
        aliasedInput: 42,
        aliasedProp: 99, // should also work with property name
      };

      adapter.update(props);
      expect(componentRefMock.setInput).toHaveBeenCalledWith('testInput', 'value1');
      expect(componentRefMock.setInput).toHaveBeenCalledWith('aliasedInput', 42);
      expect(componentRefMock.setInput).toHaveBeenCalledWith('aliasedProp', 99);
    });
  });

  describe('mount', () => {
    beforeEach(() => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);
    });

    it('should render component and append to container', () => {
      const props = { testInput: 'test-value' };

      adapter.mount(containerElement, props);

      expect(dynamicRendererMock.renderComponent).toHaveBeenCalledWith(TestComponent, props);
      expect(containerElement.children).toHaveLength(1);
      expect(containerElement.firstChild).toBe(renderedElement);
    });

    it('should not mount if component is already mounted', () => {
      const props = { testInput: 'test-value' };

      adapter.mount(containerElement, props);
      adapter.mount(containerElement, props);

      expect(dynamicRendererMock.renderComponent).toHaveBeenCalledTimes(1);
      expect(containerElement.children).toHaveLength(1);
    });

    it('should not mount if adapter is destroyed', () => {
      adapter.destroy();
      adapter.mount(containerElement, { testInput: 'test' });

      expect(dynamicRendererMock.renderComponent).not.toHaveBeenCalled();
      expect(containerElement.children).toHaveLength(0);
    });

    it('should mount with empty props', () => {
      adapter.mount(containerElement, {});

      expect(dynamicRendererMock.renderComponent).toHaveBeenCalledWith(TestComponent, {});
      expect(containerElement.firstChild).toBe(renderedElement);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);
      adapter.mount(containerElement, {});
    });

    it('should update @Input properties using setInput', () => {
      const props = {
        testInput: 'updated-value',
        aliasedInput: 123,
      };

      adapter.update(props);

      expect(componentRefMock.setInput).toHaveBeenCalledWith('testInput', 'updated-value');
      expect(componentRefMock.setInput).toHaveBeenCalledWith('aliasedInput', 123);
    });

    it('should update non-input properties via direct assignment', () => {
      const callbackFn = vi.fn();
      const props = {
        regularProp: 'regular-value',
        callback: callbackFn,
      };

      adapter.update(props);

      expect(componentRefMock.instance.regularProp).toBe('regular-value');
      expect(componentRefMock.instance.callback).toBe(callbackFn);
    });

    it('should trigger change detection when non-input properties are updated', () => {
      const props = {
        regularProp: 'value',
      };

      adapter.update(props);

      expect(changeDetectorRefMock.detectChanges).toHaveBeenCalledTimes(1);
    });

    it('should not trigger change detection when only @Input properties are updated', () => {
      const props = {
        testInput: 'value',
      };

      adapter.update(props);

      // setInput already marks component for check, no need for manual detectChanges
      expect(changeDetectorRefMock.detectChanges).not.toHaveBeenCalled();
    });

    it('should handle mixed input and non-input properties correctly', () => {
      const callbackFn = vi.fn();
      const props = {
        testInput: 'input-value',
        regularProp: 'regular-value',
        callback: callbackFn,
      };

      adapter.update(props);

      expect(componentRefMock.setInput).toHaveBeenCalledWith('testInput', 'input-value');
      expect(componentRefMock.instance.regularProp).toBe('regular-value');
      expect(componentRefMock.instance.callback).toBe(callbackFn);
      expect(changeDetectorRefMock.detectChanges).toHaveBeenCalledTimes(1);
    });

    it('should not update if component is not mounted', () => {
      const unmountedAdapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);
      const props = { testInput: 'value' };

      unmountedAdapter.update(props);

      expect(componentRefMock.setInput).not.toHaveBeenCalled();
      expect(changeDetectorRefMock.detectChanges).not.toHaveBeenCalled();
    });

    it('should not update if adapter is destroyed', () => {
      adapter.destroy();
      const props = { testInput: 'value' };

      adapter.update(props);

      expect(componentRefMock.setInput).not.toHaveBeenCalled();
      expect(changeDetectorRefMock.detectChanges).not.toHaveBeenCalled();
    });

    it('should handle empty props object', () => {
      adapter.update({});

      expect(componentRefMock.setInput).not.toHaveBeenCalled();
      expect(changeDetectorRefMock.detectChanges).not.toHaveBeenCalled();
    });

    it('should correctly distinguish between aliased and non-aliased inputs', () => {
      const props = {
        aliasedInput: 42, // template name (alias)
        aliasedProp: 99, // property name
      };

      adapter.update(props);

      // Both should be recognized as inputs and use setInput
      expect(componentRefMock.setInput).toHaveBeenCalledWith('aliasedInput', 42);
      expect(componentRefMock.setInput).toHaveBeenCalledWith('aliasedProp', 99);
      expect(changeDetectorRefMock.detectChanges).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);
      adapter.mount(containerElement, {});
    });

    it('should destroy component ref and remove element from DOM', () => {
      adapter.destroy();

      expect(componentRefMock.destroy).toHaveBeenCalledTimes(1);
      expect(containerElement.children).toHaveLength(0);
    });

    it('should mark adapter as destroyed', () => {
      adapter.destroy();

      expect(adapter.isActive()).toBe(false);
    });

    it('should be idempotent - multiple destroy calls should be safe', () => {
      adapter.destroy();
      adapter.destroy();
      adapter.destroy();

      expect(componentRefMock.destroy).toHaveBeenCalledTimes(1);
    });

    it('should handle destroy when component is not mounted', () => {
      const unmountedAdapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);

      expect(() => unmountedAdapter.destroy()).not.toThrow();
      expect(unmountedAdapter.isActive()).toBe(false);
    });

    it('should prevent mount after destroy', () => {
      adapter.destroy();
      adapter.mount(containerElement, { testInput: 'value' });

      // Should not render again
      expect(dynamicRendererMock.renderComponent).toHaveBeenCalledTimes(1); // Only from initial mount
    });

    it('should prevent update after destroy', () => {
      adapter.destroy();

      const prevSetInputCalls = (componentRefMock.setInput as Mock).mock.calls.length;
      adapter.update({ testInput: 'value' });

      expect(componentRefMock.setInput).toHaveBeenCalledTimes(prevSetInputCalls);
    });

    it('should handle element without parent node', () => {
      // Remove element from container before destroy
      containerElement.removeChild(renderedElement);

      expect(() => adapter.destroy()).not.toThrow();
      expect(componentRefMock.destroy).toHaveBeenCalledTimes(1);
    });

    it('should clean up all internal references', () => {
      adapter.destroy();

      // After destroy, internal state should be cleared
      expect(adapter.isActive()).toBe(false);

      // Attempting operations should be no-ops
      adapter.mount(containerElement, {});
      adapter.update({});

      // No additional render calls
      expect(dynamicRendererMock.renderComponent).toHaveBeenCalledTimes(1);
    });
  });

  describe('isActive', () => {
    beforeEach(() => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);
    });

    it('should return false before mounting', () => {
      expect(adapter.isActive()).toBe(false);
    });

    it('should return true after mounting', () => {
      adapter.mount(containerElement, {});

      expect(adapter.isActive()).toBe(true);
    });

    it('should return false after destroy', () => {
      adapter.mount(containerElement, {});
      adapter.destroy();

      expect(adapter.isActive()).toBe(false);
    });

    it('should return true during update operations', () => {
      adapter.mount(containerElement, {});
      adapter.update({ testInput: 'value' });

      expect(adapter.isActive()).toBe(true);
    });

    it('should return false if never mounted and destroyed', () => {
      adapter.destroy();

      expect(adapter.isActive()).toBe(false);
    });
  });

  describe('component lifecycle integration', () => {
    beforeEach(() => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);
    });

    it('should support full lifecycle: mount -> update -> destroy', () => {
      // Mount
      adapter.mount(containerElement, { testInput: 'initial' });
      expect(adapter.isActive()).toBe(true);

      // Update
      adapter.update({ testInput: 'updated' });
      expect(componentRefMock.setInput).toHaveBeenCalledWith('testInput', 'updated');

      // Destroy
      adapter.destroy();
      expect(adapter.isActive()).toBe(false);
      expect(componentRefMock.destroy).toHaveBeenCalledTimes(1);
    });

    it('should support multiple update cycles', () => {
      adapter.mount(containerElement, { testInput: 'v1' });

      adapter.update({ testInput: 'v2' });
      adapter.update({ testInput: 'v3' });
      adapter.update({ testInput: 'v4' });

      // Only the update calls should use setInput (not the initial mount)
      expect(componentRefMock.setInput).toHaveBeenCalledTimes(3);
      expect(adapter.isActive()).toBe(true);
    });

    it('should handle rapid mount attempts gracefully', () => {
      const props = { testInput: 'value' };

      adapter.mount(containerElement, props);
      adapter.mount(containerElement, props);
      adapter.mount(containerElement, props);

      expect(dynamicRendererMock.renderComponent).toHaveBeenCalledTimes(1);
      expect(containerElement.children).toHaveLength(1);
    });

    it('should handle props with undefined values', () => {
      adapter.mount(containerElement, {});
      adapter.update({ testInput: undefined, regularProp: undefined });

      expect(componentRefMock.setInput).toHaveBeenCalledWith('testInput', undefined);
      expect(componentRefMock.instance.regularProp).toBeUndefined();
    });

    it('should handle props with null values', () => {
      adapter.mount(containerElement, {});
      adapter.update({ testInput: null, regularProp: null });

      expect(componentRefMock.setInput).toHaveBeenCalledWith('testInput', null);
      expect(componentRefMock.instance.regularProp).toBeNull();
    });

    it('should handle complex object props', () => {
      const complexProp = { nested: { data: [1, 2, 3] } };
      adapter.mount(containerElement, {});
      adapter.update({ testInput: complexProp });

      expect(componentRefMock.setInput).toHaveBeenCalledWith('testInput', complexProp);
    });

    it('should handle function props (callbacks)', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      adapter.mount(containerElement, { callback: callback1 });
      adapter.update({ callback: callback2 });

      expect(componentRefMock.instance.callback).toBe(callback2);
      expect(changeDetectorRefMock.detectChanges).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle component with only non-input properties', () => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, SimpleComponent);
      adapter.mount(containerElement, {});
      adapter.update({ regularProp: 'value' });

      expect(componentRefMock.instance.regularProp).toBe('value');
      expect(changeDetectorRefMock.detectChanges).toHaveBeenCalledTimes(1);
    });

    it('should handle updating same props multiple times', () => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);
      adapter.mount(containerElement, {});

      adapter.update({ testInput: 'value1' });
      adapter.update({ testInput: 'value1' }); // Same value
      adapter.update({ testInput: 'value2' });

      expect(componentRefMock.setInput).toHaveBeenCalledTimes(3);
    });

    it('should handle destroying already destroyed adapter', () => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);
      adapter.mount(containerElement, {});

      adapter.destroy();
      const firstDestroyCallCount = (componentRefMock.destroy as Mock).mock.calls.length;

      adapter.destroy();

      expect(componentRefMock.destroy).toHaveBeenCalledTimes(firstDestroyCallCount);
    });

    it('should handle mount with many props', () => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);

      const manyProps = {
        testInput: 'value',
        aliasedInput: 42,
        prop1: 'a',
        prop2: 'b',
        prop3: 'c',
        callback1: vi.fn(),
        callback2: vi.fn(),
      };

      adapter.mount(containerElement, manyProps);

      expect(dynamicRendererMock.renderComponent).toHaveBeenCalledWith(TestComponent, manyProps);
    });

    it('should properly differentiate inputs by checking input names set', () => {
      adapter = new AngularComponentAdapter(dynamicRendererMock, TestComponent);
      adapter.mount(containerElement, {});

      // Mix of inputs and non-inputs with similar naming
      adapter.update({
        testInput: 'input-value', // is @Input
        testProp: 'regular-value', // not @Input
      });

      expect(componentRefMock.setInput).toHaveBeenCalledWith('testInput', 'input-value');
      expect(componentRefMock.instance.testProp).toBe('regular-value');
      expect(changeDetectorRefMock.detectChanges).toHaveBeenCalledTimes(1);
    });
  });
});
