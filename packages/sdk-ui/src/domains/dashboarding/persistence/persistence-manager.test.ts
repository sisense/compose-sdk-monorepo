import { filterFactory } from '@sisense/sdk-data';

import { Commerce } from '@/__test-helpers__/sample-ecommerce';
import type { UseDashboardModelResult } from '@/domains/dashboarding/dashboard-model';
import { UseDashboardModelActionType } from '@/domains/dashboarding/dashboard-model/use-dashboard-model/dashboard-model-reducer/types.js';
import type { FilterWidgetProps } from '@/domains/widgets/components/filter-widget/types';
import type { WidgetModel } from '@/domains/widgets/widget-model';

import { createDashboardPersistenceManager } from './persistence-manager.js';

describe('createDashboardPersistenceManager', () => {
  describe('addWidget', () => {
    it('resolves with the persisted widget props for a filter widget', async () => {
      // Echo the dispatched action, standing in for the persisting middleware, with a server oid.
      const dispatchChanges = vi.fn((action: { type: string; payload: unknown }) => {
        const payload = action.payload as { widget: WidgetModel };
        return Promise.resolve({
          ...action,
          payload: { ...payload, widget: { ...payload.widget, oid: 'server-oid' } },
        });
      }) as unknown as UseDashboardModelResult['dispatchChanges'];
      const persistence = createDashboardPersistenceManager(dispatchChanges);
      const dimensionFilters = [filterFactory.members(Commerce.Condition, ['New'])];

      const { widget } = await persistence.addWidget(
        {
          id: 'temp-filter',
          widgetType: 'filter',
          attribute: Commerce.AgeRange,
          title: 'Age Range',
          filterType: 'condition',
          isMultiselect: false,
          dimensionFilters,
          parentFilters: dimensionFilters,
        },
        { columns: [] },
      );

      expect(dispatchChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          type: UseDashboardModelActionType.ADD_WIDGET,
          payload: expect.objectContaining({
            widget: expect.objectContaining({ oid: 'temp-filter', widgetType: 'filter' }),
          }),
        }),
      );
      expect(widget.id).toBe('server-oid');
      expect(widget.widgetType).toBe('filter');
      const filterProps = widget as FilterWidgetProps;
      expect(filterProps.attribute).toBe(Commerce.AgeRange);
      expect(filterProps.title).toBe('Age Range');
      expect(filterProps.filterType).toBe('condition');
      expect(filterProps.isMultiselect).toBe(false);
      expect(filterProps.dimensionFilters).toEqual(dimensionFilters);
    });
  });
});
