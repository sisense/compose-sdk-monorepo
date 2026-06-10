import { filterFactory } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { WidgetsPanelColumnLayout } from '@/domains/dashboarding/types.js';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';
import { AppSettings } from '@/infra/app/settings/settings';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';

import { sampleEcommerceDashboard } from '../../__mocks__/sample-ecommerce-dashboard.js';
import { createWidgetModel, dashboardOid } from '../../__test-helpers__/create-dashboard-model.js';
import { persistDashboardModelMiddleware } from './persist-dashboard-model-middleware.js';
import { UseDashboardModelActionType, UseDashboardModelActionTypeInternal } from './types.js';

describe('persistDashboardModelMiddleware', () => {
  const testThemeSettings = getDefaultThemeSettings();
  const testAppSettings = {
    serverFeatures: {
      widgetDesignStyle: {
        key: 'widgetDesignStyle',
        active: false,
      },
    },
  } as AppSettings;

  it('should throw when dashboardOid is undefined', async () => {
    const restApi = {
      patchDashboard: vi.fn(),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn(),
    };

    await expect(
      persistDashboardModelMiddleware({
        dashboardOid: undefined,
        action: { type: UseDashboardModelActionType.FILTERS_UPDATE, payload: [] },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
      }),
    ).rejects.toThrow('Dashboard model is not initialized');
  });

  it('should patch dashboard for FILTERS_UPDATE', async () => {
    const restApi = {
      patchDashboard: vi.fn().mockResolvedValue(undefined),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn(),
    };
    const filters = [filterFactory.members(DM.Commerce.Date, ['01/01/2021'])];

    const result = await persistDashboardModelMiddleware({
      dashboardOid,
      action: { type: UseDashboardModelActionType.FILTERS_UPDATE, payload: filters },
      restApi: restApi as never,
      sharedMode: false,
      appSettings: testAppSettings,
      themeSettings: testThemeSettings,
    });

    expect(restApi.patchDashboard).toHaveBeenCalledWith(
      dashboardOid,
      expect.objectContaining({ filters: expect.any(Array) }),
      false,
    );
    expect(result).toEqual({ type: UseDashboardModelActionType.FILTERS_UPDATE, payload: filters });
  });

  it('should include partialDtoOptions in the WidgetDto sent to the server on ADD_WIDGET', async () => {
    const serverWidget = {
      ...sampleEcommerceDashboard.widgets![0]!,
      oid: 'server-assigned-oid',
    };
    const restApi = {
      patchDashboard: vi.fn(),
      addWidgetToDashboard: vi.fn().mockResolvedValue(serverWidget),
      deleteWidgetFromDashboard: vi.fn(),
    };
    const newWidget = widgetModelTranslator.fromWidgetDto(sampleEcommerceDashboard.widgets![0]!);

    await persistDashboardModelMiddleware({
      dashboardOid,
      action: {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: {
          widget: newWidget,
          widgetOptions: {
            partialDtoOptions: {
              options: {
                dashboardFiltersMode: 'filter',
                selector: false,
                disableExportToCSV: true,
                hideFromWidgetList: true,
              },
            },
          },
        },
      },
      restApi: restApi as never,
      sharedMode: false,
      appSettings: testAppSettings,
      themeSettings: testThemeSettings,
    });

    const sentWidgetDto = restApi.addWidgetToDashboard.mock.calls[0][1];
    expect(sentWidgetDto.options?.disableExportToCSV).toBe(true);
    expect(sentWidgetDto.options?.hideFromWidgetList).toBe(true);
  });

  it('should add widget and return transformed payload for ADD_WIDGET', async () => {
    const serverWidget = {
      ...sampleEcommerceDashboard.widgets![0]!,
      oid: 'server-assigned-oid',
    };
    const restApi = {
      patchDashboard: vi.fn(),
      addWidgetToDashboard: vi.fn().mockResolvedValue(serverWidget),
      deleteWidgetFromDashboard: vi.fn(),
    };
    const newWidget = widgetModelTranslator.fromWidgetDto(sampleEcommerceDashboard.widgets![0]!);

    const result = await persistDashboardModelMiddleware({
      dashboardOid,
      action: { type: UseDashboardModelActionType.ADD_WIDGET, payload: newWidget },
      restApi: restApi as never,
      sharedMode: false,
      appSettings: testAppSettings,
      themeSettings: testThemeSettings,
    });

    expect(restApi.addWidgetToDashboard).toHaveBeenCalledWith(
      dashboardOid,
      expect.any(Object),
      false,
    );
    expect(result).toEqual({
      type: UseDashboardModelActionType.ADD_WIDGET,
      payload: expect.objectContaining({
        widget: expect.objectContaining({ oid: 'server-assigned-oid' }),
        widgetOptions: undefined,
      }),
    });
  });

  it('should throw when addWidgetToDashboard returns null', async () => {
    const restApi = {
      patchDashboard: vi.fn(),
      addWidgetToDashboard: vi.fn().mockResolvedValue(null),
      deleteWidgetFromDashboard: vi.fn(),
    };
    const newWidget = widgetModelTranslator.fromWidgetDto(sampleEcommerceDashboard.widgets![0]!);

    await expect(
      persistDashboardModelMiddleware({
        dashboardOid,
        action: { type: UseDashboardModelActionType.ADD_WIDGET, payload: newWidget },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
      }),
    ).rejects.toThrow('Failed to add widget to dashboard');
  });

  it('should add widget with custom layout, patch layout with server OID, and return widget and fixed layout for ADD_WIDGET', async () => {
    const tempOid = 'temp-duplicate-123';
    const serverOid = 'server-assigned-oid';
    const serverWidgetDto = {
      ...sampleEcommerceDashboard.widgets![0]!,
      oid: serverOid,
    };
    const restApi = {
      patchDashboard: vi.fn().mockResolvedValue(undefined),
      addWidgetToDashboard: vi.fn().mockResolvedValue(serverWidgetDto),
      deleteWidgetFromDashboard: vi.fn(),
    };
    const inputWidget = createWidgetModel(tempOid);
    const customLayout: WidgetsPanelColumnLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                { widgetId: 'existing', widthPercentage: 50 },
                { widgetId: tempOid, widthPercentage: 50 },
              ],
            },
          ],
        },
      ],
    };

    const result = await persistDashboardModelMiddleware({
      dashboardOid,
      action: {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: { widget: inputWidget, widgetsPanelLayout: customLayout },
      },
      restApi: restApi as never,
      sharedMode: false,
      appSettings: testAppSettings,
      themeSettings: testThemeSettings,
    });

    expect(restApi.addWidgetToDashboard).toHaveBeenCalledWith(
      dashboardOid,
      expect.any(Object),
      false,
    );
    expect(restApi.patchDashboard).toHaveBeenCalledWith(
      dashboardOid,
      expect.objectContaining({ layout: expect.any(Object) }),
      false,
    );
    const patchCall = restApi.patchDashboard.mock.calls[0];
    expect(JSON.stringify(patchCall[1])).toContain(serverOid);
    expect(result).toEqual({
      type: UseDashboardModelActionType.ADD_WIDGET,
      payload: {
        widget: expect.objectContaining({ oid: serverOid }),
        widgetsPanelLayout: expect.objectContaining({
          columns: expect.arrayContaining([
            expect.objectContaining({
              rows: expect.arrayContaining([
                expect.objectContaining({
                  cells: expect.arrayContaining([
                    expect.objectContaining({ widgetId: 'existing', widthPercentage: 50 }),
                    expect.objectContaining({ widgetId: serverOid, widthPercentage: 50 }),
                  ]),
                }),
              ]),
            }),
          ]),
        }),
      },
    });
  });

  it('should patch dashboard for WIDGETS_PANEL_LAYOUT_UPDATE', async () => {
    const restApi = {
      patchDashboard: vi.fn().mockResolvedValue(undefined),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn(),
    };
    const layout: WidgetsPanelColumnLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [{ cells: [{ widgetId: 'w1', widthPercentage: 100 }] }],
        },
      ],
    };

    const result = await persistDashboardModelMiddleware({
      dashboardOid,
      action: { type: UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE, payload: layout },
      restApi: restApi as never,
      sharedMode: false,
      appSettings: testAppSettings,
      themeSettings: testThemeSettings,
    });

    expect(restApi.patchDashboard).toHaveBeenCalledWith(
      dashboardOid,
      expect.objectContaining({ layout: expect.any(Object) }),
      false,
    );
    expect(result).toEqual({
      type: UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE,
      payload: layout,
    });
  });

  it('should patch widget for PATCH_WIDGET', async () => {
    const restApi = {
      patchDashboard: vi.fn(),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn(),
      patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
    };

    const result = await persistDashboardModelMiddleware({
      dashboardOid,
      action: {
        type: UseDashboardModelActionType.PATCH_WIDGET,
        payload: { widgetOid: 'widget-123', patch: { title: 'New Title' } },
      },
      restApi: restApi as never,
      sharedMode: false,
      appSettings: testAppSettings,
      themeSettings: testThemeSettings,
    });

    expect(restApi.patchWidgetInDashboard).toHaveBeenCalledWith(
      dashboardOid,
      'widget-123',
      { title: 'New Title' },
      false,
    );
    expect(result).toEqual({
      type: UseDashboardModelActionType.PATCH_WIDGET,
      payload: { widgetOid: 'widget-123', patch: { title: 'New Title' } },
    });
  });

  it('should patch widget scroller location for PATCH_WIDGET with options', async () => {
    const restApi = {
      patchDashboard: vi.fn(),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn(),
      patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
    };
    const scrollerPatch = { options: { previousScrollerLocation: { min: 10, max: 90 } } };

    const result = await persistDashboardModelMiddleware({
      dashboardOid,
      action: {
        type: UseDashboardModelActionType.PATCH_WIDGET,
        payload: { widgetOid: 'widget-456', patch: scrollerPatch },
      },
      restApi: restApi as never,
      sharedMode: false,
      appSettings: testAppSettings,
      themeSettings: testThemeSettings,
    });

    expect(restApi.patchWidgetInDashboard).toHaveBeenCalledWith(
      dashboardOid,
      'widget-456',
      scrollerPatch,
      false,
    );
    expect(result).toEqual({
      type: UseDashboardModelActionType.PATCH_WIDGET,
      payload: { widgetOid: 'widget-456', patch: scrollerPatch },
    });
  });

  it('should delete widgets for WIDGETS_DELETE', async () => {
    const restApi = {
      patchDashboard: vi.fn(),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn().mockResolvedValue(undefined),
    };

    const result = await persistDashboardModelMiddleware({
      dashboardOid,
      action: { type: UseDashboardModelActionType.WIDGETS_DELETE, payload: ['w1', 'w2'] },
      restApi: restApi as never,
      sharedMode: false,
      appSettings: testAppSettings,
      themeSettings: testThemeSettings,
    });

    expect(restApi.deleteWidgetFromDashboard).toHaveBeenCalledTimes(2);
    expect(restApi.deleteWidgetFromDashboard).toHaveBeenCalledWith(dashboardOid, 'w1', false);
    expect(restApi.deleteWidgetFromDashboard).toHaveBeenCalledWith(dashboardOid, 'w2', false);
    expect(result).toEqual({
      type: UseDashboardModelActionType.WIDGETS_DELETE,
      payload: ['w1', 'w2'],
    });
  });

  it('should patch layout and delete widgets for UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE', async () => {
    const restApi = {
      patchDashboard: vi.fn().mockResolvedValue(undefined),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn().mockResolvedValue(undefined),
    };
    const layout: WidgetsPanelColumnLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [{ cells: [{ widgetId: 'remaining', widthPercentage: 100 }] }],
        },
      ],
    };

    const result = await persistDashboardModelMiddleware({
      dashboardOid,
      action: {
        type: UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE,
        payload: { widgetsPanel: layout, widgets: ['w1', 'w2'] },
      },
      restApi: restApi as never,
      sharedMode: true,
      appSettings: testAppSettings,
      themeSettings: testThemeSettings,
    });

    expect(restApi.patchDashboard).toHaveBeenCalledWith(
      dashboardOid,
      expect.objectContaining({ layout: expect.any(Object) }),
      true,
    );
    expect(restApi.deleteWidgetFromDashboard).toHaveBeenCalledWith(dashboardOid, 'w1', true);
    expect(restApi.deleteWidgetFromDashboard).toHaveBeenCalledWith(dashboardOid, 'w2', true);
    expect(result).toEqual({
      type: UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE,
      payload: { widgetsPanel: layout, widgets: ['w1', 'w2'] },
    });
  });

  describe('UPDATE_WIDGET', () => {
    it('maps scrollerLocation update to options.previousScrollerLocation PATCH', async () => {
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: {
            widgetOid: 'w-a',
            update: { styleOptions: { navigator: { scrollerLocation: { min: 10, max: 90 } } } },
          },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
      });

      expect(restApi.patchWidgetInDashboard).toHaveBeenCalledWith(
        dashboardOid,
        'w-a',
        { options: { previousScrollerLocation: { min: 10, max: 90 } } },
        false,
      );
    });

    it('spreads partialDtoOptions.options so Fusion does not drop existing option fields', async () => {
      const existingOptions = { dashboardFiltersMode: 'select', selector: true } as const;
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };
      const modelWithOptions = {
        oid: dashboardOid,
        widgetsOptions: {
          'w-a': { partialDtoOptions: { options: existingOptions } },
        },
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: {
            widgetOid: 'w-a',
            update: { styleOptions: { navigator: { scrollerLocation: { min: 5, max: 95 } } } },
          },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
        model: modelWithOptions as never,
      });

      expect(restApi.patchWidgetInDashboard).toHaveBeenCalledWith(
        dashboardOid,
        'w-a',
        { options: { ...existingOptions, previousScrollerLocation: { min: 5, max: 95 } } },
        false,
      );
    });

    it('logs error and skips REST when the update has no DTO mapping', async () => {
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn(),
      };
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: { widgetOid: 'w-a', update: {} },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
      });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE_WIDGET has no DTO mapping'),
        expect.anything(),
      );
      expect(restApi.patchWidgetInDashboard).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('roundtrip: patch emitted by middleware restores scrollerLocation via fromWidgetDto → toWidgetProps', async () => {
      // Widget at index 7 (chart/line) has navigator enabled in its style
      const baseWidgetDto = sampleEcommerceDashboard.widgets![7]!;
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: {
            widgetOid: baseWidgetDto.oid,
            update: { styleOptions: { navigator: { scrollerLocation: { min: 10, max: 90 } } } },
          },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
      });

      const [, , sentPatch] = restApi.patchWidgetInDashboard.mock.calls[0] as [
        string,
        string,
        { options: unknown },
      ];

      const patchedDto = { ...baseWidgetDto, options: sentPatch.options };
      const model = widgetModelTranslator.fromWidgetDto(patchedDto as never);
      const props = widgetModelTranslator.toWidgetProps(model);

      const navigator = (props as { styleOptions?: { navigator?: { scrollerLocation?: unknown } } })
        .styleOptions?.navigator;
      expect(navigator?.scrollerLocation).toEqual({ min: 10, max: 90 });
    });

    it('maps a customOptions update to a customOptions PATCH', async () => {
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: { widgetOid: 'cw-a', update: { customOptions: { lastPage: 3 } } },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
      });

      expect(restApi.patchWidgetInDashboard).toHaveBeenCalledWith(
        dashboardOid,
        'cw-a',
        { customOptions: { lastPage: 3 } },
        false,
      );
    });

    it('merges customOptions into the current bag so other keys are not dropped', async () => {
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };
      const modelWithWidget = {
        oid: dashboardOid,
        widgets: [{ oid: 'cw-a', customOptions: { lastPage: 0, theme: 'dark' } }],
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: { widgetOid: 'cw-a', update: { customOptions: { lastPage: 7 } } },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
        model: modelWithWidget as never,
      });

      expect(restApi.patchWidgetInDashboard).toHaveBeenCalledWith(
        dashboardOid,
        'cw-a',
        { customOptions: { lastPage: 7, theme: 'dark' } },
        false,
      );
    });

    it('deep-merges a nested customOptions update into the current bag', async () => {
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };
      const modelWithWidget = {
        oid: dashboardOid,
        widgets: [{ oid: 'cw-a', customOptions: { view: { zoom: 1, center: 'auto' } } }],
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: { widgetOid: 'cw-a', update: { customOptions: { view: { zoom: 2 } } } },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
        model: modelWithWidget as never,
      });

      // Nested sibling keys (`center`) survive a partial nested update.
      expect(restApi.patchWidgetInDashboard).toHaveBeenCalledWith(
        dashboardOid,
        'cw-a',
        { customOptions: { view: { zoom: 2, center: 'auto' } } },
        false,
      );
    });

    it('roundtrip: customOptions PATCH restores via fromWidgetDto → toWidgetProps', async () => {
      const baseDto = sampleEcommerceDashboard.widgets![0]!;
      const customWidgetDto = {
        ...baseDto,
        oid: 'cw-1',
        type: 'my-plugin',
        style: {},
        customOptions: { lastPage: 0, theme: 'dark' },
      };
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: { widgetOid: 'cw-1', update: { customOptions: { lastPage: 3 } } },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
        model: {
          oid: dashboardOid,
          widgets: [{ oid: 'cw-1', customOptions: customWidgetDto.customOptions }],
        } as never,
      });

      const [, , sentPatch] = restApi.patchWidgetInDashboard.mock.calls[0] as [
        string,
        string,
        { customOptions: Record<string, unknown> },
      ];

      const patchedDto = { ...customWidgetDto, customOptions: sentPatch.customOptions };
      const model = widgetModelTranslator.fromWidgetDto(patchedDto as never);
      const props = widgetModelTranslator.toWidgetProps(model);

      expect((props as { customOptions?: Record<string, unknown> }).customOptions).toEqual({
        lastPage: 3,
        theme: 'dark',
      });
    });

    it('maps a custom-widget styleOptions update to a style PATCH, merging current style', async () => {
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: { widgetOid: 'cw-a', update: { styleOptions: { rowsPerPage: 20 } } },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
        model: {
          oid: dashboardOid,
          widgets: [{ oid: 'cw-a', widgetType: 'custom', styleOptions: { theme: 'dark' } }],
        } as never,
      });

      expect(restApi.patchWidgetInDashboard).toHaveBeenCalledWith(
        dashboardOid,
        'cw-a',
        { style: { theme: 'dark', rowsPerPage: 20 } },
        false,
      );
    });

    it('deep-merges a nested custom-widget styleOptions update into the current style', async () => {
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: {
            widgetOid: 'cw-a',
            update: { styleOptions: { pagination: { currentPage: 3 } } },
          },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
        model: {
          oid: dashboardOid,
          widgets: [
            {
              oid: 'cw-a',
              widgetType: 'custom',
              styleOptions: { pagination: { currentPage: 1, location: 'left' } },
            },
          ],
        } as never,
      });

      // Nested sibling keys (`location`) survive a partial nested update.
      expect(restApi.patchWidgetInDashboard).toHaveBeenCalledWith(
        dashboardOid,
        'cw-a',
        { style: { pagination: { currentPage: 3, location: 'left' } } },
        false,
      );
    });

    it('does not produce a style PATCH for non-custom widgets', async () => {
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn(),
      };
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: { widgetOid: 'chart-a', update: { styleOptions: { rowsPerPage: 20 } } },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
        model: {
          oid: dashboardOid,
          widgets: [{ oid: 'chart-a', widgetType: 'chart', styleOptions: {} }],
        } as never,
      });

      expect(restApi.patchWidgetInDashboard).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE_WIDGET has no DTO mapping'),
        expect.anything(),
      );
      errorSpy.mockRestore();
    });

    it('roundtrip: styleOptions PATCH restores via fromWidgetDto → toWidgetProps', async () => {
      const baseDto = sampleEcommerceDashboard.widgets![0]!;
      const customWidgetDto = {
        ...baseDto,
        oid: 'cw-1',
        type: 'my-plugin',
        style: { theme: 'dark' },
      };
      const restApi = {
        patchDashboard: vi.fn(),
        addWidgetToDashboard: vi.fn(),
        deleteWidgetFromDashboard: vi.fn(),
        patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
      };

      await persistDashboardModelMiddleware({
        dashboardOid,
        action: {
          type: UseDashboardModelActionType.UPDATE_WIDGET,
          payload: { widgetOid: 'cw-1', update: { styleOptions: { rowsPerPage: 20 } } },
        },
        restApi: restApi as never,
        sharedMode: false,
        appSettings: testAppSettings,
        themeSettings: testThemeSettings,
        model: {
          oid: dashboardOid,
          widgets: [{ oid: 'cw-1', widgetType: 'custom', styleOptions: { theme: 'dark' } }],
        } as never,
      });

      const [, , sentPatch] = restApi.patchWidgetInDashboard.mock.calls[0] as [
        string,
        string,
        { style: Record<string, unknown> },
      ];

      const patchedDto = { ...customWidgetDto, style: sentPatch.style };
      const model = widgetModelTranslator.fromWidgetDto(patchedDto as never);
      const props = widgetModelTranslator.toWidgetProps(model);

      expect((props as { styleOptions?: Record<string, unknown> }).styleOptions).toMatchObject({
        theme: 'dark',
        rowsPerPage: 20,
      });
    });
  });
});
