/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/** @vitest-environment jsdom */
import { type HttpClient } from '@sisense/sdk-rest-client';
import zipObject from 'lodash-es/zipObject';

import { isWidgetModel } from '@/domains/widgets/widget-model';
import { TranslatableError } from '@/infra/translation/translatable-error';

import { sampleEcommerceDashboard as dashboardMock } from './__mocks__/sample-ecommerce-dashboard';
import { getDashboardModel, type GetDashboardModelOptions } from './get-dashboard-model';

const getDashboardMock = vi.fn((): typeof dashboardMock | undefined => {
  // eslint-disable-next-line no-unused-vars
  const { widgets, ...dashboardWithoutWidgets } = dashboardMock;
  return dashboardWithoutWidgets;
});
const getDashboardWidgetsMock = vi.fn(() => dashboardMock.widgets);
const getWidgetMock = vi.fn((id) => dashboardMock.widgets?.find((w) => w.oid === id));
const getDashboardLegacyMock = vi.fn((): typeof dashboardMock | undefined => {
  // eslint-disable-next-line no-unused-vars
  const { widgets, ...dashboardWithoutWidgets } = dashboardMock;
  return dashboardWithoutWidgets;
});
vi.mock('@/infra/api/rest-api', () => ({
  RestApi: class {
    getDashboard = getDashboardMock;

    getDashboardWidgets = getDashboardWidgetsMock;

    getWidget = getWidgetMock;

    getDashboardLegacy = getDashboardLegacyMock;
  },
}));

const httpClientMock: HttpClient = {} as HttpClient;

describe('getDashboardModel', () => {
  beforeEach(() => {
    getDashboardMock.mockClear();
    getDashboardWidgetsMock.mockClear();
    getWidgetMock.mockClear();
    getDashboardLegacyMock.mockClear();
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
      config: expect.anything(),
      dataSource: {
        id: dashboardMock.datasource.id,
        address: dashboardMock.datasource.address,
        title: dashboardMock.datasource.title,
        type: 'elasticube',
      },
      styleOptions: {
        palette: {
          variantColors: dashboardMock.style!.palette!.colors,
        },
      },
      settings: dashboardMock.settings,
      userAuth: expect.anything(),
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
        id: dashboardMock.datasource.id,
        address: dashboardMock.datasource.address,
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
      config: expect.anything(),
      styleOptions: {
        palette: {
          variantColors: dashboardMock.style!.palette!.colors,
        },
      },
      settings: dashboardMock.settings,
      userAuth: expect.anything(),
    });
  });

  it('should include widgets when includeWidgets is true and auth is wat', async () => {
    const options: GetDashboardModelOptions = {
      includeWidgets: true,
    };
    const result = await getDashboardModel(
      { auth: { type: 'wat' } } as HttpClient,
      dashboardMock.oid,
      options,
    );

    expect(getWidgetMock).toHaveBeenCalledTimes(dashboardMock.widgets?.length || 0);
    result.widgets.forEach((widget) => {
      expect(isWidgetModel(widget)).toBe(true);
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
        id: dashboardMock.datasource.id,
        address: dashboardMock.datasource.address,
        title: dashboardMock.datasource.title,
        type: 'elasticube',
      },
      layoutOptions: expect.anything(),
      filters: expect.arrayContaining(
        Array(dashboardMock.filters?.length).map(() => expect.anything()),
      ),
      widgets: expect.anything(),
      widgetsOptions: expect.anything(),
      config: expect.anything(),
      styleOptions: {
        palette: {
          variantColors: dashboardMock.style!.palette!.colors,
        },
      },
      settings: dashboardMock.settings,
      userAuth: expect.anything(),
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
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      new TranslatableError('errors.dashboardInvalidIdentifier', {
        dashboardOid: dashboardMock.oid,
      }).message,
    );
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

  describe('useLegacyApiVersion', () => {
    it('should fetch a dashboard model using legacy API', async () => {
      const options: GetDashboardModelOptions = {
        useLegacyApiVersion: true,
      };
      const result = await getDashboardModel(httpClientMock, dashboardMock.oid, options);

      expect(getDashboardLegacyMock).toHaveBeenCalledWith(dashboardMock.oid);
      expect(getDashboardMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        oid: dashboardMock.oid,
        title: dashboardMock.title,
        layoutOptions: expect.anything(),
        filters: expect.anything(),
        widgets: expect.anything(),
        widgetsOptions: expect.anything(),
        config: expect.anything(),
        dataSource: {
          id: dashboardMock.datasource.id,
          address: dashboardMock.datasource.address,
          title: dashboardMock.datasource.title,
          type: 'elasticube',
        },
        styleOptions: {
          palette: {
            variantColors: dashboardMock.style!.palette!.colors,
          },
        },
        settings: dashboardMock.settings,
        userAuth: expect.anything(),
      });
    });

    it("should throw an error if the dashboard doesn't exist with legacy API", async () => {
      getDashboardLegacyMock.mockReturnValueOnce(undefined);

      let result;
      let error;
      try {
        result = await getDashboardModel(httpClientMock, dashboardMock.oid, {
          useLegacyApiVersion: true,
        });
      } catch (e) {
        error = e;
      }

      expect(getDashboardLegacyMock).toHaveBeenCalledWith(dashboardMock.oid);
      expect(getDashboardMock).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        new TranslatableError('errors.dashboardInvalidIdentifier', {
          dashboardOid: dashboardMock.oid,
        }).message,
      );
    });

    it('should handle network error with legacy API', async () => {
      getDashboardLegacyMock.mockRejectedValueOnce(new Error('Legacy API network error'));

      let result;
      let error;
      try {
        result = await getDashboardModel(httpClientMock, dashboardMock.oid, {
          useLegacyApiVersion: true,
        });
      } catch (e) {
        error = e;
      }

      expect(getDashboardLegacyMock).toHaveBeenCalledWith(dashboardMock.oid);
      expect(getDashboardMock).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
      expect(error).toEqual(new Error('Legacy API network error'));
    });
  });
});
