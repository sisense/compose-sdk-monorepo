import { getDashboardModel, type GetDashboardModelOptions } from './get-dashboard-model';
import { type HttpClient } from '@sisense/sdk-rest-client';
import { DashboardDto } from '../../api/types/dashboard-dto';
import { type RestApi } from '../../api/rest-api';

const dashboardMock = {
  oid: 'dashboard-123',
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
} as DashboardDto;

const getDashboardMock = vi.fn<Parameters<RestApi['getDashboard']>>(
  (_dashboardOid, { expand } = {}) => {
    const result = { ...dashboardMock };

    if (!expand || !expand?.includes('widgets')) {
      delete result.widgets;
    }

    return result;
  },
);
vi.mock('../../api/rest-api', () => ({
  RestApi: class {
    getDashboard = getDashboardMock;
  },
}));

const httpClientMock: HttpClient = {} as HttpClient;

describe('getDashboardModel', () => {
  beforeEach(() => {
    getDashboardMock.mockClear();
  });

  it('should fetch a dashboard model', async () => {
    const result = await getDashboardModel(httpClientMock, dashboardMock.oid);

    console.log(result);

    expect(result).toEqual({
      oid: dashboardMock.oid,
      title: dashboardMock.title,
      dataSource: dashboardMock.datasource.title,
    });
  });

  it('should include widgets when includeWidgets is true', async () => {
    const options: GetDashboardModelOptions = {
      includeWidgets: true,
    };
    const result = await getDashboardModel(httpClientMock, dashboardMock.oid, options);

    expect(result).toEqual({
      oid: dashboardMock.oid,
      title: dashboardMock.title,
      dataSource: dashboardMock.datasource.title,
      widgets: dashboardMock.widgets?.map((widgetMock) => ({
        oid: widgetMock.oid,
        title: widgetMock.title,
        dataSource: widgetMock.datasource.title,
      })),
    });
  });
});
