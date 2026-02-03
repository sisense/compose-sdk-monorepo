import { DataType } from '@sisense/sdk-data';

import { dashboardModelTranslator } from '@/domains/dashboarding/dashboard-model';
import { WidgetStyle } from '@/domains/widgets/components/widget-by-id/types';

describe('DashboardModel', () => {
  it('should create a new dashboard model with minimum of arguments', async () => {
    expect(
      dashboardModelTranslator.fromDashboardDto({
        oid: 'test',
        title: 'test',
        datasource: { title: 'test', id: 'test' },
      }),
    ).toMatchSnapshot();
  });

  it('should create a new dashboard model with all arguments', () => {
    expect(
      dashboardModelTranslator.fromDashboardDto({
        oid: 'test',
        title: 'test',
        datasource: { title: 'test', id: 'test' },
        widgets: [
          {
            oid: 'widget-1',
            type: 'chart/pie',
            subtype: 'pie/donut',
            datasource: {
              title: 'test',
              id: 'test',
            },
            metadata: {
              panels: [],
            },
            style: {} as WidgetStyle,
            title: 'test',
            desc: null,
          },
        ],
        layout: {
          columns: [
            {
              width: 1000,
              cells: [
                {
                  subcells: [
                    {
                      width: 2000,
                      elements: [
                        {
                          height: 3000,
                          widgetid: 'widget-1',
                          minWidth: 100,
                          maxWidth: 2000,
                          minHeight: 100,
                          maxHeight: 4000,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        filters: [
          {
            jaql: {
              datatype: DataType.TEXT,
              dim: '[table.column]',
              table: 'table',
              column: 'column',
              title: 'title',
              filter: {
                members: ['member'],
              },
            },
            instanceid: 'test-id',
            disabled: false,
          },
        ],
        settings: {
          autoUpdateOnFiltersChange: true,
          useAcceleration: true,
          aiAssistantEnabled: true,
          managedByTool: 'studio-assistant',
        },
      }),
    ).toMatchSnapshot();
  });
});
