import type { DashboardDto } from '@/infra/api/types/dashboard-dto';

import { getWidgetIdsFromDashboard } from './extract-widget-ids';

describe('getWidgetIdsFromDashboard', () => {
  it('should return an empty array if the dashboard has no layout', () => {
    const dashboard: DashboardDto = {
      layout: null,
    } as unknown as DashboardDto;

    const result = getWidgetIdsFromDashboard(dashboard);

    expect(result).toEqual([]);
  });

  it('should extract widget IDs from a flat layout structure', () => {
    const dashboard: DashboardDto = {
      layout: [{ widgetid: 'widget1' }, { widgetid: 'widget2' }],
    } as unknown as DashboardDto;

    const result = getWidgetIdsFromDashboard(dashboard);

    expect(result).toEqual(['widget1', 'widget2']);
  });

  it('should extract widget IDs from a nested layout structure', () => {
    const dashboard: DashboardDto = {
      layout: {
        rows: [
          {
            columns: [{ widgetid: 'widget1' }, { widgetid: 'widget2' }],
          },
          {
            columns: [
              {
                subColumns: [{ widgetid: 'widget3' }],
              },
            ],
          },
        ],
      },
    } as unknown as DashboardDto;

    const result = getWidgetIdsFromDashboard(dashboard);

    expect(result).toEqual(['widget1', 'widget2', 'widget3']);
  });

  it('should ignore objects without a widgetid property', () => {
    const dashboard: DashboardDto = {
      layout: [{ widgetid: 'widget1' }, { randomKey: 'randomValue' }, { widgetid: 'widget2' }],
    } as unknown as DashboardDto;

    const result = getWidgetIdsFromDashboard(dashboard);

    expect(result).toEqual(['widget1', 'widget2']);
  });

  it('should handle dashboards with mixed layouts (arrays and objects)', () => {
    const dashboard: DashboardDto = {
      layout: [
        { widgetid: 'widget1' },
        {
          rows: [
            {
              columns: [{ widgetid: 'widget2' }],
            },
          ],
        },
        { widgetid: 'widget3' },
      ],
    } as unknown as DashboardDto;

    const result = getWidgetIdsFromDashboard(dashboard);

    expect(result).toEqual(['widget1', 'widget2', 'widget3']);
  });

  it('should return an empty array if no widget IDs are found', () => {
    const dashboard: DashboardDto = {
      layout: [
        { someKey: 'someValue' },
        {
          rows: [
            {
              columns: [{ anotherKey: 'anotherValue' }],
            },
          ],
        },
      ],
    } as unknown as DashboardDto;

    const result = getWidgetIdsFromDashboard(dashboard);

    expect(result).toEqual([]);
  });

  it('should handle complex nested structures with duplicate widget IDs', () => {
    const dashboard: DashboardDto = {
      layout: {
        rows: [
          {
            columns: [{ widgetid: 'widget1' }, { widgetid: 'widget2' }],
          },
          {
            columns: [{ widgetid: 'widget1' }, { widgetid: 'widget3' }],
          },
        ],
      },
    } as unknown as DashboardDto;

    const result = getWidgetIdsFromDashboard(dashboard);

    expect(result).toEqual(['widget1', 'widget2', 'widget1', 'widget3']);
  });
});
