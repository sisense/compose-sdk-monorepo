/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/** @vitest-environment jsdom */

import { getDashboardModels, type GetDashboardModelsOptions } from './get-dashboard-models.js';
import { type HttpClient } from '@sisense/sdk-rest-client';
import { DashboardDto } from '../../api/types/dashboard-dto.js';
import { type RestApi } from '../../api/rest-api.js';
import { sampleEcommerceDashboard } from '../__mocks__/sample-ecommerce-dashboard.js';
import { sampleHealthcareDashboard } from '../__mocks__/sample-healthcare-dashboard.js';
import { samplePivotDashboard } from '../__mocks__/sample-pivot-dashboard.js';
import zipObject from 'lodash-es/zipObject';
import { isWidgetModel } from '../widget/widget-model.js';

const dashboardsMock: DashboardDto[] = [
  sampleEcommerceDashboard,
  sampleHealthcareDashboard,
  samplePivotDashboard,
];

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

/**
 * Custom 'expect' extension to check if a value is in an array
 *
 * @param received - received value
 * @param expected - expected value
 * @returns - object with pass and message
 */
const oneOfExpectExtension = (received: unknown, expected: unknown[]) => {
  const pass = expected.includes(received);
  const receivedString = JSON.stringify(received);
  const expectedString = JSON.stringify(expected);
  if (pass) {
    return {
      message: () => `expected ${receivedString} not to be in ${expectedString}`,
      pass: true,
    };
  } else {
    return {
      message: () => `expected ${receivedString} to be in ${expectedString}`,
      pass: false,
    };
  }
};

type ExpectWithOneOfExtension = typeof expect & { oneOf: (arr: unknown[]) => unknown };

vi.mock('../../api/rest-api', () => ({
  RestApi: class {
    getDashboards = getDashboardsMock;
  },
}));

const httpClientMock: HttpClient = {} as HttpClient;

describe('getDashboardModels', () => {
  expect.extend({
    oneOf: oneOfExpectExtension,
  });
  beforeEach(() => {
    getDashboardsMock.mockClear();
  });

  it('should fetch all dashboard models', async () => {
    const result = await getDashboardModels(httpClientMock);

    expect(result).toEqual(
      dashboardsMock.map((dashboardMock) => ({
        oid: dashboardMock.oid,
        title: dashboardMock.title,
        layoutOptions: expect.anything(),
        filters: expect.anything(),
        dataSource: {
          title: dashboardMock.datasource.title,
          type: (expect as ExpectWithOneOfExtension).oneOf(['live', 'elasticube']),
        },
        widgets: expect.anything(),
        widgetsOptions: expect.anything(),
        styleOptions: {
          ...(dashboardMock.style?.palette?.colors && {
            palette: {
              variantColors: dashboardMock.style.palette.colors,
            },
          }),
        },
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
        dataSource: {
          title: dashboardMock.datasource.title,
          type: (expect as ExpectWithOneOfExtension).oneOf(['live', 'elasticube']),
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
          ...(dashboardMock.style?.palette?.colors && {
            palette: {
              variantColors: dashboardMock.style.palette.colors,
            },
          }),
        },
      })),
    );
  });

  it('should fetch dashboard models filtered by certain title', async () => {
    const targetDashboardMock = dashboardsMock[1];
    const options: GetDashboardModelsOptions = {
      searchByTitle: targetDashboardMock.title,
    };
    const result = await getDashboardModels(httpClientMock, options);

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      oid: targetDashboardMock.oid,
      title: targetDashboardMock.title,
      layoutOptions: expect.anything(),
      filters: expect.anything(),
      dataSource: {
        title: targetDashboardMock.datasource.title,
        type: (expect as ExpectWithOneOfExtension).oneOf(['live', 'elasticube']),
      },
      widgets: expect.anything(),
      widgetsOptions: expect.anything(),
      styleOptions: {
        ...(targetDashboardMock.style?.palette?.colors
          ? {
              palette: {
                variantColors: targetDashboardMock.style.palette.colors,
              },
            }
          : null),
      },
    });
  });

  it("should throw an error if the dashboard doesn't exist", async () => {
    getDashboardsMock.mockReturnValueOnce(undefined);

    const targetDashboardMock = dashboardsMock[1];
    const options: GetDashboardModelsOptions = {
      searchByTitle: targetDashboardMock.title,
    };

    const result = await getDashboardModels(httpClientMock, options);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(0);
  });

  it('should handle network error', async () => {
    getDashboardsMock.mockRejectedValueOnce(new Error('Network error'));

    const targetDashboardMock = dashboardsMock[1];
    const options: GetDashboardModelsOptions = {
      searchByTitle: targetDashboardMock.title,
    };

    let result;
    let error;
    try {
      result = await getDashboardModels(httpClientMock, options);
    } catch (e) {
      error = e;
    }

    expect(result).toBeUndefined();
    expect(error).toEqual(new Error('Network error'));
  });
});
