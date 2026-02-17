/* eslint-disable @typescript-eslint/unbound-method */

/** @vitest-environment jsdom */
import {
  type ClientApplication,
  getWidgetModel,
  HookAdapter,
  type JumpToDashboardConfig,
  useJtdWidget as useJtdWidgetPreact,
} from '@sisense/sdk-ui-preact';
import { BehaviorSubject } from 'rxjs';
import { Mock, Mocked } from 'vitest';

import { type WidgetProps } from '../components/widgets/widget.component';
import { toPreactWidgetProps, toWidgetProps } from '../helpers/widget-props-preact-translator';
import { type WidgetModel } from '../sdk-ui-core-exports';
import { SisenseContextService } from './sisense-context.service';
import { ThemeService } from './theme.service';
import { WidgetService } from './widget.service';

vi.mock('../decorators/trackable.decorator', () => ({
  TrackableService: (_target: any, _key: string, descriptor: PropertyDescriptor) => descriptor,
}));

vi.mock('@sisense/sdk-ui-preact', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sisense/sdk-ui-preact')>();
  return {
    ...actual,
    getWidgetModel: vi.fn(),
    useJtdWidget: vi.fn(),
    HookAdapter: vi.fn().mockImplementation(() => ({
      subscribe: vi.fn(),
      run: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

vi.mock('../helpers/widget-props-preact-translator', () => ({
  toPreactWidgetProps: vi.fn((props) => props),
  toWidgetProps: vi.fn((props) => props),
}));

vi.mock('../component-wrapper-helpers', () => ({
  createSisenseContextConnector: vi.fn(() => ({})),
  createThemeContextConnector: vi.fn(() => ({})),
}));

const getWidgetModelMock = getWidgetModel as Mock<typeof getWidgetModel>;
const MockHookAdapter = vi.mocked(HookAdapter);
const toPreactWidgetPropsMock = vi.mocked(toPreactWidgetProps);
const toWidgetPropsMock = vi.mocked(toWidgetProps);

describe('WidgetService', () => {
  let sisenseContextService: Mocked<SisenseContextService>;
  let themeService: Mocked<ThemeService>;

  beforeEach(() => {
    getWidgetModelMock.mockClear();
    vi.clearAllMocks();
    sisenseContextService = {
      getApp: vi.fn().mockResolvedValue({}),
    } as unknown as Mocked<SisenseContextService>;
    themeService = {} as unknown as Mocked<ThemeService>;
  });

  it('should be created', () => {
    const widgetService = new WidgetService(sisenseContextService, themeService);
    expect(widgetService).toBeTruthy();
  });

  describe('getWidgetModel', () => {
    it('should retrieve an existing widget model', async () => {
      const dashboardOid = 'dashboard-oid';
      const widgetOid = 'widget-oid';
      const expectedWidgetModel = {
        oid: widgetOid,
        title: 'test-widget',
      } as WidgetModel;

      sisenseContextService.getApp.mockResolvedValue({ httpClient: {} } as ClientApplication);
      getWidgetModelMock.mockResolvedValue(expectedWidgetModel);

      const widgetService = new WidgetService(sisenseContextService, themeService);
      const result = await widgetService.getWidgetModel({ dashboardOid, widgetOid });

      expect(result).toEqual(expectedWidgetModel);
      expect(sisenseContextService.getApp).toHaveBeenCalled();
      expect(getWidgetModelMock).toHaveBeenCalledWith({}, dashboardOid, widgetOid);
    });
  });

  describe('createJtdWidget', () => {
    const mockWidgetProps: WidgetProps = {
      id: 'widget-1',
      widgetType: 'chart',
      chartType: 'bar',
      dataSource: 'Sample ECommerce',
      dataOptions: {},
      title: 'Test Widget',
    } as WidgetProps;

    const mockJtdConfig: JumpToDashboardConfig = {
      targets: [{ id: 'target-dashboard-id', caption: 'Details' }],
      interaction: { triggerMethod: 'rightclick' },
    };

    it('should return object with widget$ and destroy when widgetProps is null', () => {
      const widgetService = new WidgetService(sisenseContextService, themeService);
      const result = widgetService.createJtdWidget(null, mockJtdConfig);

      expect(result).toHaveProperty('widget$');
      expect(result).toHaveProperty('destroy');
      expect(result.widget$).toBeInstanceOf(BehaviorSubject);
      expect(result.widget$.value).toBeNull();
      expect(typeof result.destroy).toBe('function');
      expect(MockHookAdapter).not.toHaveBeenCalled();
    });

    it('should create HookAdapter and subscribe when widgetProps is provided', () => {
      const mockSubscribe = vi.fn(() => ({ unsubscribe: vi.fn() }));
      const mockRun = vi.fn();
      const mockDestroy = vi.fn();

      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: mockSubscribe,
            run: mockRun,
            destroy: mockDestroy,
          } as any),
      );

      toPreactWidgetPropsMock.mockReturnValue(mockWidgetProps);
      toWidgetPropsMock.mockReturnValue(mockWidgetProps);

      const widgetService = new WidgetService(sisenseContextService, themeService);
      const result = widgetService.createJtdWidget(mockWidgetProps, mockJtdConfig);

      expect(result).toHaveProperty('widget$');
      expect(result).toHaveProperty('destroy');
      expect(result.widget$).toBeInstanceOf(BehaviorSubject);
      expect(result.widget$.value).toEqual(mockWidgetProps);
      expect(typeof result.destroy).toBe('function');
      expect(MockHookAdapter).toHaveBeenCalledWith(useJtdWidgetPreact, expect.any(Array));
      expect(mockSubscribe).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalled();
    });

    it('should translate props to preact format before running hook', () => {
      const mockPreactProps = { ...mockWidgetProps, preact: true };
      const mockSubscribe = vi.fn(() => ({ unsubscribe: vi.fn() }));
      const mockRun = vi.fn();

      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: mockSubscribe,
            run: mockRun,
            destroy: vi.fn(),
          } as any),
      );

      toPreactWidgetPropsMock.mockReturnValue(mockPreactProps);

      const widgetService = new WidgetService(sisenseContextService, themeService);
      widgetService.createJtdWidget(mockWidgetProps, mockJtdConfig);

      expect(toPreactWidgetPropsMock).toHaveBeenCalledWith(mockWidgetProps);
      expect(mockRun).toHaveBeenCalledWith(mockPreactProps, mockJtdConfig);
    });

    it('should update BehaviorSubject when hook adapter emits enhanced props', async () => {
      const enhancedPreactProps = {
        ...mockWidgetProps,
        dataPointClick: vi.fn(),
        dataPointContextMenu: vi.fn(),
      };
      const enhancedAngularProps = {
        ...mockWidgetProps,
        dataPointClick: vi.fn(),
        dataPointContextMenu: vi.fn(),
      } as WidgetProps;

      let subscribeCallback: ((props: any) => void) | null = null;

      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              subscribeCallback = callback;
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(() => {
              // Simulate async hook execution
              setTimeout(() => {
                if (subscribeCallback) {
                  subscribeCallback(enhancedPreactProps);
                }
              }, 0);
            }),
            destroy: vi.fn(),
          } as any),
      );

      toPreactWidgetPropsMock.mockReturnValue(mockWidgetProps);
      toWidgetPropsMock.mockReturnValue(enhancedAngularProps);

      const widgetService = new WidgetService(sisenseContextService, themeService);
      const result = widgetService.createJtdWidget(mockWidgetProps, mockJtdConfig);

      // Initially should have base props
      expect(result.widget$.value).toEqual(mockWidgetProps);

      // Wait for async update
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(result.widget$.value).toEqual(enhancedAngularProps);
      expect(toWidgetPropsMock).toHaveBeenCalledWith(enhancedPreactProps);
    });

    it('should handle null enhanced props from hook adapter', async () => {
      let subscribeCallback: ((props: any) => void) | null = null;

      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              subscribeCallback = callback;
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(() => {
              setTimeout(() => {
                if (subscribeCallback) {
                  subscribeCallback(null);
                }
              }, 0);
            }),
            destroy: vi.fn(),
          } as any),
      );

      toPreactWidgetPropsMock.mockReturnValue(mockWidgetProps);

      const widgetService = new WidgetService(sisenseContextService, themeService);
      const result = widgetService.createJtdWidget(mockWidgetProps, mockJtdConfig);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(result.widget$.value).toBeNull();
    });

    it('should initialize BehaviorSubject with base props', () => {
      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
            run: vi.fn(),
            destroy: vi.fn(),
          } as any),
      );

      toPreactWidgetPropsMock.mockReturnValue(mockWidgetProps);

      const widgetService = new WidgetService(sisenseContextService, themeService);
      const result = widgetService.createJtdWidget(mockWidgetProps, mockJtdConfig);

      // BehaviorSubject should be initialized with base props immediately
      expect(result.widget$.value).toEqual(mockWidgetProps);
    });

    it('should destroy resources correctly', () => {
      const mockUnsubscribe = vi.fn();
      const mockDestroy = vi.fn();

      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn(() => ({ unsubscribe: mockUnsubscribe })),
            run: vi.fn(),
            destroy: mockDestroy,
          } as any),
      );

      toPreactWidgetPropsMock.mockReturnValue(mockWidgetProps);

      const widgetService = new WidgetService(sisenseContextService, themeService);
      const result = widgetService.createJtdWidget(mockWidgetProps, mockJtdConfig);

      // Verify destroy function exists
      expect(typeof result.destroy).toBe('function');

      // Call destroy
      result.destroy();

      // Verify cleanup was performed
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      expect(mockDestroy).toHaveBeenCalledTimes(1);

      // Verify widget$ is completed by subscribing and checking completion
      let completed = false;
      result.widget$.subscribe({
        complete: () => {
          completed = true;
        },
      });
      expect(completed).toBe(true);
    });
  });
});
