/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/** @vitest-environment jsdom */

import { getDashboardModel, type GetDashboardModelOptions } from './get-dashboard-model';
import { type HttpClient } from '@sisense/sdk-rest-client';
import { sampleEcommerceDashboard as dashboardMock } from '../__mocks__/sample-ecommerce-dashboard';
import { type RestApi } from '../../api/rest-api';
import { WidgetModel } from '../widget';

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
      layout: dashboardMock.layout,
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
      layout: dashboardMock.layout,
      widgets: expect.arrayContaining(
        Array(dashboardMock.widgets?.length).map(() => expect.any(WidgetModel)),
      ),
    });
  });
});
