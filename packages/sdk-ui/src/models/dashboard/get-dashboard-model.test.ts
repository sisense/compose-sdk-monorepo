/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/** @vitest-environment jsdom */

import { getDashboardModel, type GetDashboardModelOptions } from './get-dashboard-model';
import { type HttpClient } from '@sisense/sdk-rest-client';
import { sampleEcommerceDashboard as dashboardMock } from '../__mocks__/sample-ecommerce-dashboard';
import { type RestApi } from '../../api/rest-api';
import zipObject from 'lodash-es/zipObject';
import { isWidgetModel } from '../widget';

const getDashboardMock = vi.fn<Parameters<RestApi['getDashboard']>>(() => {
  // eslint-disable-next-line no-unused-vars
  const { widgets, ...dashboardWithoutWidgets } = dashboardMock;
  return dashboardWithoutWidgets;
});
const getDashboardWidgetsMock = vi.fn<Parameters<RestApi['getDashboardWidgets']>>(
  () => dashboardMock.widgets,
);
vi.mock('../../api/rest-api', () => ({
  RestApi: class {
    getDashboard = getDashboardMock;

    getDashboardWidgets = getDashboardWidgetsMock;
  },
}));

const httpClientMock: HttpClient = {} as HttpClient;

describe('getDashboardModel', () => {
  beforeEach(() => {
    getDashboardMock.mockClear();
    getDashboardWidgetsMock.mockClear();
  });

  it('should fetch a dashboard model', async () => {
    const result = await getDashboardModel(httpClientMock, dashboardMock.oid);

    expect(result).toEqual({
      oid: dashboardMock.oid,
      title: dashboardMock.title,
      layoutOptions: expect.anything(),
      filters: expect.anything(),
      widgets: expect.anything(),
      widgetsOptions: expect.anything(),
      dataSource: {
        title: dashboardMock.datasource.title,
        type: 'elasticube',
      },
      styleOptions: {
        palette: {
          variantColors: dashboardMock.style!.palette!.colors,
        },
      },
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
      dataSource: {
        title: dashboardMock.datasource.title,
        type: 'elasticube',
      },
      layoutOptions: expect.anything(),
      filters: expect.anything(),
      widgets: expect.arrayContaining(
        Array(dashboardMock.widgets?.length).map((widget) =>
          expect(isWidgetModel(widget)).toBe(true),
        ),
      ),
      widgetsOptions: expect.objectContaining(
        zipObject(
          dashboardMock.widgets!.map(({ oid }) => oid),
          dashboardMock.widgets!.map(() => expect.anything()),
        ),
      ),
      styleOptions: {
        palette: {
          variantColors: dashboardMock.style!.palette!.colors,
        },
      },
    });
  });

  it('should include filters when includeFilters is true', async () => {
    const options: GetDashboardModelOptions = {
      includeFilters: true,
    };
    const result = await getDashboardModel(httpClientMock, dashboardMock.oid, options);

    expect(result).toEqual({
      oid: dashboardMock.oid,
      title: dashboardMock.title,
      dataSource: {
        title: dashboardMock.datasource.title,
        type: 'elasticube',
      },
      layoutOptions: expect.anything(),
      filters: expect.arrayContaining(
        Array(dashboardMock.filters?.length).map(() => expect.anything()),
      ),
      widgets: expect.anything(),
      widgetsOptions: expect.anything(),
      styleOptions: {
        palette: {
          variantColors: dashboardMock.style!.palette!.colors,
        },
      },
    });
  });

  it("should throw an error if the dashboard doesn't exist", async () => {
    getDashboardMock.mockReturnValueOnce(undefined);

    let result;
    let error;
    try {
      result = await getDashboardModel(httpClientMock, dashboardMock.oid);
    } catch (e) {
      error = e;
    }

    expect(result).toBeUndefined();
    expect(error).toEqual(new Error(`Dashboard with oid ${dashboardMock.oid} not found`));
  });

  it('should handle network error', async () => {
    getDashboardMock.mockRejectedValueOnce(new Error('Network error'));

    let result;
    let error;
    try {
      result = await getDashboardModel(httpClientMock, dashboardMock.oid);
    } catch (e) {
      error = e;
    }

    expect(result).toBeUndefined();
    expect(error).toEqual(new Error('Network error'));
  });
});
