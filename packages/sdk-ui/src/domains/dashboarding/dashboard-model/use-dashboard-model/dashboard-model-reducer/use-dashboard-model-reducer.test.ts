import { filterFactory } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import {
  dashboardReducer,
  UseDashboardModelActionType,
  UseDashboardModelActionTypeInternal,
  WidgetsPanelColumnLayout,
} from '@/domains/dashboarding/dashboard-model';

import {
  createDashboardWithLayout,
  createMinimalDashboardModel,
  createWidgetModel,
} from '../../__test-helpers__/create-dashboard-model.js';

describe('dashboardReducer', () => {
  const baseModel = createMinimalDashboardModel();

  describe('DASHBOARD_INIT', () => {
    it('should merge payload into state', () => {
      const payload = {
        ...baseModel,
        title: 'Initialized Dashboard',
        oid: 'new-oid',
      };

      const result = dashboardReducer(null, {
        type: UseDashboardModelActionTypeInternal.DASHBOARD_INIT,
        payload,
      });

      expect(result).toEqual(payload);
    });
  });

  describe('FILTERS_UPDATE', () => {
    it('should update filters', () => {
      const newFilters = [filterFactory.members(DM.Commerce.Date, ['01/01/2021'])];

      const result = dashboardReducer(baseModel, {
        type: UseDashboardModelActionType.FILTERS_UPDATE,
        payload: newFilters,
      });

      expect(result).toEqual({ ...baseModel, filters: newFilters });
    });
  });

  describe('PATCH_WIDGET', () => {
    it('should merge patch into matching widget', () => {
      const widget1 = createWidgetModel('w1');
      const widget2 = createWidgetModel('w2');
      const model = { ...baseModel, widgets: [widget1, widget2] };

      const result = dashboardReducer(model, {
        type: UseDashboardModelActionType.PATCH_WIDGET,
        payload: { widgetOid: 'w2', patch: { title: 'Updated Title' } },
      });

      expect(result?.widgets).toHaveLength(2);
      expect(result?.widgets[0]).toEqual(widget1);
      expect(result?.widgets[1]).toEqual({ ...widget2, title: 'Updated Title' });
    });

    it('should not mutate non-matching widgets', () => {
      const widget1 = createWidgetModel('w1');
      const model = { ...baseModel, widgets: [widget1] };

      const result = dashboardReducer(model, {
        type: UseDashboardModelActionType.PATCH_WIDGET,
        payload: { widgetOid: 'non-existent', patch: { title: 'No Effect' } },
      });

      expect(result?.widgets).toEqual([widget1]);
    });
  });

  describe('WIDGETS_PANEL_LAYOUT_UPDATE', () => {
    it('should update layout', () => {
      const newLayout: WidgetsPanelColumnLayout = {
        columns: [
          {
            widthPercentage: 100,
            rows: [{ cells: [{ widgetId: 'w1', widthPercentage: 100 }] }],
          },
        ],
      };

      const result = dashboardReducer(baseModel, {
        type: UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE,
        payload: newLayout,
      });

      expect(result).toEqual({
        ...baseModel,
        layoutOptions: { ...baseModel.layoutOptions, widgetsPanel: newLayout },
      });
    });
  });

  describe('WIDGETS_DELETE', () => {
    it('should remove widgets by oid', () => {
      const widget1 = createWidgetModel('w1');
      const widget2 = createWidgetModel('w2');
      const widget3 = createWidgetModel('w3');
      const model = { ...baseModel, widgets: [widget1, widget2, widget3] };

      const result = dashboardReducer(model, {
        type: UseDashboardModelActionType.WIDGETS_DELETE,
        payload: ['w2'],
      });

      expect(result?.widgets).toEqual([widget1, widget3]);
    });

    it('should remove multiple widgets', () => {
      const widgets = [createWidgetModel('w1'), createWidgetModel('w2'), createWidgetModel('w3')];
      const model = { ...baseModel, widgets };

      const result = dashboardReducer(model, {
        type: UseDashboardModelActionType.WIDGETS_DELETE,
        payload: ['w1', 'w3'],
      });

      expect(result?.widgets).toEqual([widgets[1]]);
    });
  });

  describe('UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE', () => {
    it('should update layout and remove widgets atomically', () => {
      const widgets = [createWidgetModel('w1'), createWidgetModel('w2'), createWidgetModel('w3')];
      const model = { ...baseModel, widgets };
      const newLayout: WidgetsPanelColumnLayout = {
        columns: [
          {
            widthPercentage: 100,
            rows: [{ cells: [{ widgetId: 'w1', widthPercentage: 100 }] }],
          },
        ],
      };

      const result = dashboardReducer(model, {
        type: UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE,
        payload: { widgetsPanel: newLayout, widgets: ['w2', 'w3'] },
      });

      expect(result?.widgets).toEqual([widgets[0]]);
      expect(result?.layoutOptions?.widgetsPanel).toEqual(newLayout);
    });
  });

  describe('ADD_WIDGET', () => {
    it('should add widget with plain payload when no layout exists', () => {
      const newWidget = createWidgetModel('new-widget');
      const modelWithoutLayout = {
        ...baseModel,
        layoutOptions: {} as typeof baseModel.layoutOptions,
      };

      const result = dashboardReducer(modelWithoutLayout, {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: newWidget,
      });

      expect(result?.widgets).toHaveLength(1);
      expect(result?.widgets[0]).toEqual(newWidget);
    });

    it('should add widget and append to first cell when layout exists', () => {
      const layout: WidgetsPanelColumnLayout = {
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [{ widgetId: 'existing-widget', widthPercentage: 50 }],
              },
            ],
          },
        ],
      };
      const model = createDashboardWithLayout(layout);
      const newWidget = createWidgetModel('new-widget');

      const result = dashboardReducer(model, {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: newWidget,
      });

      expect(result?.widgets).toHaveLength(1);
      expect(result?.widgets[0]).toEqual(newWidget);
      expect(result?.layoutOptions?.widgetsPanel?.columns[0]?.rows[0]?.cells).toHaveLength(2);
      expect(result?.layoutOptions?.widgetsPanel?.columns[0]?.rows[0]?.cells).toContainEqual({
        widgetId: 'new-widget',
        widthPercentage: 100,
      });
    });

    it('should add widget and create first row when column has no rows', () => {
      const layout: WidgetsPanelColumnLayout = {
        columns: [
          {
            widthPercentage: 100,
            rows: [],
          },
        ],
      };
      const model = createDashboardWithLayout(layout);
      const newWidget = createWidgetModel('new-widget');

      const result = dashboardReducer(model, {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: newWidget,
      });

      expect(result?.widgets).toHaveLength(1);
      expect(result?.layoutOptions?.widgetsPanel?.columns[0]?.rows).toHaveLength(1);
      expect(result?.layoutOptions?.widgetsPanel?.columns[0]?.rows[0]?.cells).toEqual([
        { widgetId: 'new-widget', widthPercentage: 100 },
      ]);
    });

    it('should use custom layout when payload includes widgetsPanelLayout', () => {
      const model = createDashboardWithLayout({
        columns: [
          {
            widthPercentage: 100,
            rows: [{ cells: [{ widgetId: 'old', widthPercentage: 100 }] }],
          },
        ],
      });
      const newWidget = createWidgetModel('new-widget');
      const customLayout: WidgetsPanelColumnLayout = {
        columns: [
          {
            widthPercentage: 50,
            rows: [{ cells: [{ widgetId: 'new-widget', widthPercentage: 100 }] }],
          },
          {
            widthPercentage: 50,
            rows: [{ cells: [{ widgetId: 'old', widthPercentage: 100 }] }],
          },
        ],
      };

      const result = dashboardReducer(model, {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: { widget: newWidget, widgetsPanelLayout: customLayout },
      });

      expect(result?.widgets).toHaveLength(1);
      expect(result?.layoutOptions?.widgetsPanel).toEqual(customLayout);
    });

    it('should not mutate original layout when appending widget', () => {
      const originalCells = [{ widgetId: 'existing', widthPercentage: 100 }];
      const layout: WidgetsPanelColumnLayout = {
        columns: [
          {
            widthPercentage: 100,
            rows: [{ cells: originalCells }],
          },
        ],
      };
      const model = createDashboardWithLayout(layout);
      const newWidget = createWidgetModel('new-widget');

      dashboardReducer(model, {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: newWidget,
      });

      expect(originalCells).toHaveLength(1);
      expect(layout.columns[0]!.rows[0]!.cells).toHaveLength(1);
    });
  });

  describe('default', () => {
    it('should return state unchanged for unknown action', () => {
      const result = dashboardReducer(baseModel, {
        type: 'UNKNOWN' as UseDashboardModelActionType,
        payload: {},
      } as never);

      expect(result).toBe(baseModel);
    });
  });
});
