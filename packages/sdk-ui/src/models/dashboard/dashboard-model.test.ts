import { dashboardModelTranslator } from '@/models';
import { WidgetStyle } from '@/widget-by-id/types';
import { DataType } from '@sisense/sdk-data';

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
