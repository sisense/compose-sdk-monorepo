/** @vitest-environment jsdom */
import { Type } from '@angular/core';
import { createElement } from '@sisense/sdk-ui-preact';
import type {
  CustomWidgetComponent as CustomWidgetComponentPreact,
  CustomWidgetComponentProps,
  ExternalComponentAdapterElementProps,
} from '@sisense/sdk-ui-preact';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { AngularComponentAdapter } from './angular-component-adapter';
import { CustomWidgetsService } from './custom-widgets.service';
import { DynamicRenderer } from './dynamic-renderer.service';

// Mock the Preact dependencies
vi.mock('@sisense/sdk-ui-preact', async () => {
  const actual = await vi.importActual('@sisense/sdk-ui-preact');
  return {
    ...actual,
    createElement: vi.fn(),
  };
});

// Mock the AngularComponentAdapter
vi.mock('./angular-component-adapter');

const createElementMock = createElement as Mock;

// Test component classes (partial implementation for testing)
class TestCustomWidget {
  dataOptions: any;

  filters?: any;
}

class AnotherCustomWidget {
  dataOptions: any;

  filters?: any;
}

describe('CustomWidgetsService', () => {
  let service: CustomWidgetsService;
  let dynamicRendererMock: DynamicRenderer;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock dynamic renderer
    dynamicRendererMock = {
      renderComponent: vi.fn(),
    } as unknown as DynamicRenderer;

    // Create service instance
    service = new CustomWidgetsService(dynamicRendererMock);
  });

  describe('constructor', () => {
    it('should initialize with customWidgetsMap$ BehaviorSubject', () => {
      expect(service.customWidgetsMap$).toBeDefined();
      expect(service.customWidgetsMap$.value).toBeInstanceOf(Map);
    });

    it('should initialize with TabberButtonsWidget pre-registered', () => {
      const initialMap = service.customWidgetsMap$.value;

      expect(initialMap.has('tabber-buttons')).toBe(true);
      expect(initialMap.get('tabber-buttons')).toBeDefined();
    });

    it('should have only one widget registered initially', () => {
      const initialMap = service.customWidgetsMap$.value;

      expect(initialMap.size).toBe(1);
    });
  });

  describe('registerCustomWidget', () => {
    it('should register a new custom widget', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      expect(service.customWidgetsMap$.value.has(widgetType)).toBe(true);
      expect(service.customWidgetsMap$.value.size).toBe(2); // tabber-buttons + test-widget
    });

    it('should not register duplicate widget types', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);
      const mapAfterFirst = service.customWidgetsMap$.value;
      const firstSize = mapAfterFirst.size;

      // Try to register again
      service.registerCustomWidget(widgetType, widgetComponent);
      const mapAfterSecond = service.customWidgetsMap$.value;

      expect(mapAfterSecond.size).toBe(firstSize);
      expect(mapAfterFirst).toBe(mapAfterSecond); // Same map instance
    });

    it('should emit new map value after registration', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      const emitSpy = vi.fn();
      service.customWidgetsMap$.subscribe(emitSpy);

      // Clear initial emission
      emitSpy.mockClear();

      service.registerCustomWidget(widgetType, widgetComponent);

      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(expect.any(Map));
    });

    it('should register multiple different widget types', () => {
      const widgetType1 = 'widget-1';
      const widgetType2 = 'widget-2';
      const widgetComponent1 = TestCustomWidget as Type<CustomWidgetComponentProps>;
      const widgetComponent2 = AnotherCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType1, widgetComponent1);
      service.registerCustomWidget(widgetType2, widgetComponent2);

      expect(service.customWidgetsMap$.value.has(widgetType1)).toBe(true);
      expect(service.customWidgetsMap$.value.has(widgetType2)).toBe(true);
      expect(service.customWidgetsMap$.value.size).toBe(3); // tabber-buttons + 2 custom
    });

    it('should create wrapper component that uses ExternalComponentAdapterElement', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      const registeredComponent = service.customWidgetsMap$.value.get(widgetType);
      expect(registeredComponent).toBeDefined();

      // Call the wrapper component
      const testProps: CustomWidgetComponentProps = {
        dataOptions: {},
        filters: [],
      };

      registeredComponent!(testProps);

      // Verify createElement was called with correct arguments
      expect(createElementMock).toHaveBeenCalledTimes(1);
      expect(createElementMock).toHaveBeenCalledWith(
        expect.anything(), // ExternalComponentAdapterElement
        expect.objectContaining({
          adapterFactory: expect.any(Function),
          componentProps: testProps,
        }),
      );
    });

    it('should create adapter factory that returns AngularComponentAdapter', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      const registeredComponent = service.customWidgetsMap$.value.get(widgetType);
      expect(registeredComponent).toBeDefined();

      const testProps: CustomWidgetComponentProps = {
        dataOptions: {},
        filters: [],
      };

      registeredComponent!(testProps);

      // Extract the adapter factory from createElement call
      const createElementCall = createElementMock.mock.calls[0];
      const adapterElementProps =
        createElementCall[1] as ExternalComponentAdapterElementProps<CustomWidgetComponentProps>;

      // Call the adapter factory
      const adapter = adapterElementProps.adapterFactory();

      expect(adapter).toBeInstanceOf(AngularComponentAdapter);
    });

    it('should pass correct component props through wrapper', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      const registeredComponent = service.customWidgetsMap$.value.get(widgetType);
      expect(registeredComponent).toBeDefined();

      const testProps: CustomWidgetComponentProps = {
        dataOptions: {},
        filters: [],
      };

      registeredComponent!(testProps);

      const createElementCall = createElementMock.mock.calls[0];
      const adapterElementProps =
        createElementCall[1] as ExternalComponentAdapterElementProps<CustomWidgetComponentProps>;

      expect(adapterElementProps.componentProps).toBe(testProps);
    });

    it('should create new adapter instance for each factory call', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      const registeredComponent = service.customWidgetsMap$.value.get(widgetType);
      expect(registeredComponent).toBeDefined();

      registeredComponent!({ dataOptions: {}, filters: [] });

      const createElementCall = createElementMock.mock.calls[0];
      const adapterElementProps =
        createElementCall[1] as ExternalComponentAdapterElementProps<CustomWidgetComponentProps>;

      const adapter1 = adapterElementProps.adapterFactory();
      const adapter2 = adapterElementProps.adapterFactory();

      expect(adapter1).not.toBe(adapter2);
      expect(adapter1).toBeInstanceOf(AngularComponentAdapter);
      expect(adapter2).toBeInstanceOf(AngularComponentAdapter);
    });

    it('should pass dynamic renderer to adapter', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      const registeredComponent = service.customWidgetsMap$.value.get(widgetType);
      expect(registeredComponent).toBeDefined();

      registeredComponent!({ dataOptions: {}, filters: [] });

      const createElementCall = createElementMock.mock.calls[0];
      const adapterElementProps =
        createElementCall[1] as ExternalComponentAdapterElementProps<CustomWidgetComponentProps>;

      adapterElementProps.adapterFactory();

      // Verify AngularComponentAdapter was constructed with correct arguments
      expect(AngularComponentAdapter).toHaveBeenCalledWith(dynamicRendererMock, widgetComponent);
    });

    it('should handle registration with generic type parameter', () => {
      interface CustomProps extends CustomWidgetComponentProps {
        customField: string;
      }

      class CustomTypedWidget {
        customField!: string;

        dataOptions: any;

        filters?: any;
      }

      const widgetType = 'typed-widget';
      const widgetComponent = CustomTypedWidget as Type<CustomProps>;

      service.registerCustomWidget<CustomProps>(widgetType, widgetComponent);

      expect(service.customWidgetsMap$.value.has(widgetType)).toBe(true);

      const registeredComponent = service.customWidgetsMap$.value.get(widgetType);
      expect(registeredComponent).toBeDefined();

      const props: CustomProps = {
        customField: 'test',
        dataOptions: {},
        filters: [],
      };

      registeredComponent!(props);

      expect(createElementMock).toHaveBeenCalled();
    });
  });

  describe('hasCustomWidget', () => {
    it('should return true for registered widget', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      expect(service.hasCustomWidget(widgetType)).toBe(true);
    });

    it('should return false for unregistered widget', () => {
      expect(service.hasCustomWidget('non-existent-widget')).toBe(false);
    });

    it('should return true for pre-registered TabberButtonsWidget', () => {
      expect(service.hasCustomWidget('tabber-buttons')).toBe(true);
    });

    it('should return false after checking multiple non-existent widgets', () => {
      expect(service.hasCustomWidget('widget-1')).toBe(false);
      expect(service.hasCustomWidget('widget-2')).toBe(false);
      expect(service.hasCustomWidget('widget-3')).toBe(false);
    });

    it('should return correct status after multiple registrations', () => {
      const widgetType1 = 'widget-1';
      const widgetType2 = 'widget-2';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      expect(service.hasCustomWidget(widgetType1)).toBe(false);

      service.registerCustomWidget(widgetType1, widgetComponent);
      expect(service.hasCustomWidget(widgetType1)).toBe(true);
      expect(service.hasCustomWidget(widgetType2)).toBe(false);

      service.registerCustomWidget(widgetType2, widgetComponent);
      expect(service.hasCustomWidget(widgetType1)).toBe(true);
      expect(service.hasCustomWidget(widgetType2)).toBe(true);
    });

    it('should handle empty string widget type', () => {
      expect(service.hasCustomWidget('')).toBe(false);
    });

    it('should handle special characters in widget type', () => {
      const widgetType = 'widget-with-special_chars.123';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      expect(service.hasCustomWidget(widgetType)).toBe(true);
    });

    it('should be case-sensitive', () => {
      const widgetType = 'TestWidget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      expect(service.hasCustomWidget(widgetType)).toBe(true);
      expect(service.hasCustomWidget('testwidget')).toBe(false);
      expect(service.hasCustomWidget('TESTWIDGET')).toBe(false);
    });
  });

  describe('customWidgetsMap$ observable', () => {
    it('should emit current map to new subscribers', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      const subscriber = vi.fn();
      service.customWidgetsMap$.subscribe(subscriber);

      expect(subscriber).toHaveBeenCalledWith(service.customWidgetsMap$.value);
      expect(subscriber.mock.calls[0][0].has(widgetType)).toBe(true);
    });

    it('should emit updates when new widgets are registered', () => {
      const emissions: Map<string, CustomWidgetComponentPreact<any>>[] = [];
      service.customWidgetsMap$.subscribe((map) => emissions.push(map));

      const initialEmissions = emissions.length;

      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;
      service.registerCustomWidget('widget-1', widgetComponent);

      expect(emissions.length).toBe(initialEmissions + 1);
      expect(emissions[emissions.length - 1].has('widget-1')).toBe(true);
    });

    it('should not emit when trying to register duplicate widget', () => {
      const widgetType = 'test-widget';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      const emissions: Map<string, CustomWidgetComponentPreact<any>>[] = [];
      service.customWidgetsMap$.subscribe((map) => emissions.push(map));

      const initialEmissions = emissions.length;

      // Try to register duplicate
      service.registerCustomWidget(widgetType, widgetComponent);

      // Should only have initial emission, no new emission
      expect(emissions.length).toBe(initialEmissions);
    });

    it('should maintain reference to same map across operations', () => {
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      const mapBefore = service.customWidgetsMap$.value;
      service.registerCustomWidget('widget-1', widgetComponent);
      const mapAfter = service.customWidgetsMap$.value;

      // Map reference should be the same (mutation approach)
      expect(mapAfter).toBe(mapBefore);
    });
  });

  describe('integration scenarios', () => {
    it('should support registering and checking multiple widgets in sequence', () => {
      const widgets = [
        { type: 'chart-widget', component: TestCustomWidget },
        { type: 'table-widget', component: AnotherCustomWidget },
        { type: 'custom-widget', component: TestCustomWidget },
      ];

      widgets.forEach(({ type, component }) => {
        service.registerCustomWidget(type, component as Type<CustomWidgetComponentProps>);
      });

      widgets.forEach(({ type }) => {
        expect(service.hasCustomWidget(type)).toBe(true);
      });

      expect(service.customWidgetsMap$.value.size).toBe(4); // 3 custom + tabber-buttons
    });

    it('should properly wrap widgets with different prop types', () => {
      interface ExtendedProps extends CustomWidgetComponentProps {
        customProp: string;
        onCustomEvent?: () => void;
      }

      class ExtendedWidget {
        customProp!: string;

        onCustomEvent?: () => void;

        dataOptions: any;

        filters?: any;
      }

      service.registerCustomWidget<ExtendedProps>(
        'extended-widget',
        ExtendedWidget as Type<ExtendedProps>,
      );

      const registeredComponent = service.customWidgetsMap$.value.get('extended-widget');
      expect(registeredComponent).toBeDefined();

      const props: ExtendedProps = {
        customProp: 'test',
        onCustomEvent: vi.fn(),
        dataOptions: {},
        filters: [],
      };

      registeredComponent!(props);

      const createElementCall = createElementMock.mock.calls[0];
      const adapterElementProps =
        createElementCall[1] as ExternalComponentAdapterElementProps<ExtendedProps>;

      expect(adapterElementProps.componentProps).toEqual(props);
    });

    it('should handle rapid sequential registrations', () => {
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      for (let i = 0; i < 10; i++) {
        service.registerCustomWidget(`widget-${i}`, widgetComponent);
      }

      expect(service.customWidgetsMap$.value.size).toBe(11); // 10 custom + tabber-buttons

      for (let i = 0; i < 10; i++) {
        expect(service.hasCustomWidget(`widget-${i}`)).toBe(true);
      }
    });

    it('should maintain service state across multiple operations', () => {
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      // Register
      service.registerCustomWidget('widget-1', widgetComponent);
      expect(service.hasCustomWidget('widget-1')).toBe(true);

      // Try duplicate
      service.registerCustomWidget('widget-1', widgetComponent);
      expect(service.customWidgetsMap$.value.size).toBe(2);

      // Register another
      service.registerCustomWidget('widget-2', widgetComponent);
      expect(service.hasCustomWidget('widget-2')).toBe(true);
      expect(service.customWidgetsMap$.value.size).toBe(3);

      // Check non-existent
      expect(service.hasCustomWidget('widget-3')).toBe(false);

      // Verify all registered widgets are still present
      expect(service.hasCustomWidget('tabber-buttons')).toBe(true);
      expect(service.hasCustomWidget('widget-1')).toBe(true);
      expect(service.hasCustomWidget('widget-2')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle widget registration with minimal props', () => {
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget('minimal-widget', widgetComponent);
      const registeredComponent = service.customWidgetsMap$.value.get('minimal-widget');
      expect(registeredComponent).toBeDefined();

      registeredComponent!({});

      expect(createElementMock).toHaveBeenCalled();
    });

    it('should handle widget type with Unicode characters', () => {
      const widgetType = 'widget-测试-🎨';
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget(widgetType, widgetComponent);

      expect(service.hasCustomWidget(widgetType)).toBe(true);
    });

    it('should not throw when accessing map directly', () => {
      const widgetComponent = TestCustomWidget as Type<CustomWidgetComponentProps>;

      service.registerCustomWidget('test-widget', widgetComponent);

      expect(() => {
        const map = service.customWidgetsMap$.value;
        map.forEach((component, key) => {
          expect(key).toBeDefined();
          expect(component).toBeDefined();
        });
      }).not.toThrow();
    });

    it('should handle widgets with complex prop structures', () => {
      interface ComplexProps extends CustomWidgetComponentProps {
        nested: {
          deep: {
            value: number;
          };
        };
        array: string[];
        callback: (data: any) => void;
      }

      class ComplexWidget {
        nested!: { deep: { value: number } };

        array!: string[];

        callback!: (data: any) => void;

        dataOptions: any;

        filters?: any;
      }

      service.registerCustomWidget<ComplexProps>(
        'complex-widget',
        ComplexWidget as Type<ComplexProps>,
      );

      const registeredComponent = service.customWidgetsMap$.value.get('complex-widget');
      const complexProps: ComplexProps = {
        nested: { deep: { value: 42 } },
        array: ['a', 'b', 'c'],
        callback: vi.fn(),
        dataOptions: {},
        filters: [],
      };

      registeredComponent!(complexProps);

      const createElementCall = createElementMock.mock.calls[0];
      const adapterElementProps =
        createElementCall[1] as ExternalComponentAdapterElementProps<ComplexProps>;

      expect(adapterElementProps.componentProps).toEqual(complexProps);
    });
  });
});
