import { getDashboardModels, type GetDashboardModelsOptions } from './get-dashboard-models.js';
import { type HttpClient } from '@sisense/sdk-rest-client';
import { DashboardDto } from '../../api/types/dashboard-dto.js';
import { type RestApi } from '../../api/rest-api.js';

const dashboardsMock = [
  {
    oid: 'dashboard-1',
    title: 'Test Dashboard',
    datasource: {
      title: 'Test Datasource',
    },
    widgets: [
      {
        oid: 'widget-1',
        title: 'Test Widget 1',
        datasource: {
          title: 'Test Datasource',
        },
      },
      {
        oid: 'widget-2',
        title: 'Test Widget 2',
        datasource: {
          title: 'Test Datasource 2',
        },
      },
    ],
  },
  {
    oid: 'dashboard-2',
    title: 'Test Dashboard 2',
    datasource: {
      title: 'Test Datasource',
    },
    widgets: [],
  },
] as DashboardDto[];

const getDashboardsMock = vi.fn<Parameters<RestApi['getDashboards']>>(
  ({ expand, searchByTitle } = {}) => {
    return dashboardsMock
      .map((dashboardMock) => {
        const result = { ...dashboardMock };

        if (!expand || !expand?.includes('widgets')) {
          delete result.widgets;
        }

        return result;
      })
      .filter((dashboardMock) => !searchByTitle || dashboardMock.title === searchByTitle);
  },
);

vi.mock('../../api/rest-api', () => ({
  RestApi: class {
    getDashboards = getDashboardsMock;
  },
}));

const httpClientMock: HttpClient = {} as HttpClient;

describe('getDashboardModels', () => {
  beforeEach(() => {
    getDashboardsMock.mockClear();
  });

  it('should fetch all dashboard models', async () => {
    const result = await getDashboardModels(httpClientMock);

    expect(result).toEqual(
      dashboardsMock.map((dashboardMock) => ({
        oid: dashboardMock.oid,
        title: dashboardMock.title,
        dataSource: dashboardMock.datasource.title,
      })),
    );
  });

  it('should include widgets when includeWidgets is true', async () => {
    const options: GetDashboardModelsOptions = {
      includeWidgets: true,
    };
    const result = await getDashboardModels(httpClientMock, options);

    expect(result).toEqual(
      dashboardsMock.map((dashboardMock) => ({
        oid: dashboardMock.oid,
        title: dashboardMock.title,
        dataSource: dashboardMock.datasource.title,
        widgets: dashboardMock.widgets?.map((widgetMock) => ({
          oid: widgetMock.oid,
          title: widgetMock.title,
          dataSource: widgetMock.datasource.title,
        })),
      })),
    );
  });

  it('should fetch dashboard models filtered by certain title', async () => {
    const targetDashboardMock = dashboardsMock[1];
    const options: GetDashboardModelsOptions = {
      searchByTitle: targetDashboardMock.title,
    };
    const result = await getDashboardModels(httpClientMock, options);

    console.log(result);

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      oid: targetDashboardMock.oid,
      title: targetDashboardMock.title,
      dataSource: targetDashboardMock.datasource.title,
    });
  });
});
