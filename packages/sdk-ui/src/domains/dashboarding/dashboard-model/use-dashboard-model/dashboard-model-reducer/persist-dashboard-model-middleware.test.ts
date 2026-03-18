import { filterFactory } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { WidgetsPanelColumnLayout } from '@/domains/dashboarding/types.js';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';

import { sampleEcommerceDashboard } from '../../__mocks__/sample-ecommerce-dashboard.js';
import { createWidgetModel, dashboardOid } from '../../__test-helpers__/create-dashboard-model.js';
import { persistDashboardModelMiddleware } from './persist-dashboard-model-middleware.js';
import { UseDashboardModelActionType, UseDashboardModelActionTypeInternal } from './types.js';

describe('persistDashboardModelMiddleware', () => {
  it('should throw when dashboardOid is undefined', async () => {
    const restApi = {
      patchDashboard: vi.fn(),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn(),
    };

    await expect(
      persistDashboardModelMiddleware(
        undefined,
        { type: UseDashboardModelActionType.FILTERS_UPDATE, payload: [] },
        restApi as never,
        false,
      ),
    ).rejects.toThrow('Dashboard model is not initialized');
  });

  it('should patch dashboard for FILTERS_UPDATE', async () => {
    const restApi = {
      patchDashboard: vi.fn().mockResolvedValue(undefined),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn(),
    };
    const filters = [filterFactory.members(DM.Commerce.Date, ['01/01/2021'])];

    const result = await persistDashboardModelMiddleware(
      dashboardOid,
      { type: UseDashboardModelActionType.FILTERS_UPDATE, payload: filters },
      restApi as never,
      false,
    );

    expect(restApi.patchDashboard).toHaveBeenCalledWith(
      dashboardOid,
      expect.objectContaining({ filters: expect.any(Array) }),
      false,
    );
    expect(result).toEqual({ type: UseDashboardModelActionType.FILTERS_UPDATE, payload: filters });
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

    const result = await persistDashboardModelMiddleware(
      dashboardOid,
      { type: UseDashboardModelActionType.ADD_WIDGET, payload: newWidget },
      restApi as never,
      false,
    );

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
      persistDashboardModelMiddleware(
        dashboardOid,
        { type: UseDashboardModelActionType.ADD_WIDGET, payload: newWidget },
        restApi as never,
        false,
      ),
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

    const result = await persistDashboardModelMiddleware(
      dashboardOid,
      {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: { widget: inputWidget, widgetsPanelLayout: customLayout },
      },
      restApi as never,
      false,
    );

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

    const result = await persistDashboardModelMiddleware(
      dashboardOid,
      { type: UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE, payload: layout },
      restApi as never,
      false,
    );

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

    const result = await persistDashboardModelMiddleware(
      dashboardOid,
      {
        type: UseDashboardModelActionType.PATCH_WIDGET,
        payload: { widgetOid: 'widget-123', patch: { title: 'New Title' } },
      },
      restApi as never,
      false,
    );

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

  it('should delete widgets for WIDGETS_DELETE', async () => {
    const restApi = {
      patchDashboard: vi.fn(),
      addWidgetToDashboard: vi.fn(),
      deleteWidgetFromDashboard: vi.fn().mockResolvedValue(undefined),
    };

    const result = await persistDashboardModelMiddleware(
      dashboardOid,
      { type: UseDashboardModelActionType.WIDGETS_DELETE, payload: ['w1', 'w2'] },
      restApi as never,
      false,
    );

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

    const result = await persistDashboardModelMiddleware(
      dashboardOid,
      {
        type: UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE,
        payload: { widgetsPanel: layout, widgets: ['w1', 'w2'] },
      },
      restApi as never,
      true,
    );

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
});
