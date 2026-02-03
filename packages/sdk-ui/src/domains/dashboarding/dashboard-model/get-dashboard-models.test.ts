/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/** @vitest-environment jsdom */
import { type HttpClient } from '@sisense/sdk-rest-client';

import { isWidgetModel } from '@/domains/widgets/widget-model/widget-model.js';
import { DashboardDto } from '@/infra/api/types/dashboard-dto.js';

import {
  dashboardWithSharedFormulas,
  sharedFormulasDictionary,
} from './__mocks__/dashboard-with-shared-formulas.js';
import { sampleEcommerceDashboard } from './__mocks__/sample-ecommerce-dashboard.js';
import { sampleHealthcareDashboard } from './__mocks__/sample-healthcare-dashboard.js';
import { samplePivotDashboard } from './__mocks__/sample-pivot-dashboard.js';
import { getDashboardModels, type GetDashboardModelsOptions } from './get-dashboard-models.js';

const dashboardsMock: DashboardDto[] = [
  sampleEcommerceDashboard,
  sampleHealthcareDashboard,
  samplePivotDashboard,
  dashboardWithSharedFormulas,
];

const dashboardsWithDuplicateMock = [
  ...dashboardsMock,
  { ...sampleEcommerceDashboard, isCoAuthored: true },
];

const getDashboardsMock = vi.fn(({ expand, searchByTitle } = {}): unknown => {
  return dashboardsWithDuplicateMock
    .map((dashboardMock) => {
      const result = { ...dashboardMock };

      if (!expand || !expand?.includes('widgets')) {
        delete result.widgets;
      }

      return result;
    })
    .filter((dashboardMock) => !searchByTitle || dashboardMock.title === searchByTitle);
});

const getSharedFormulasMock = vi.fn((sharedFormulasIds: string[]) => {
  // Return empty object if no formulas requested (e.g., when widgets aren't included)
  if (!sharedFormulasIds || sharedFormulasIds.length === 0) {
    return {};
  }
  const result: Record<string, unknown> = {};
  sharedFormulasIds.forEach((id) => {
    if (sharedFormulasDictionary[id]) {
      result[id] = sharedFormulasDictionary[id];
    }
  });
  return result;
});

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

vi.mock('@/infra/api/rest-api', () => ({
  RestApi: class {
    getDashboards = getDashboardsMock;

    getSharedFormulas = getSharedFormulasMock;
  },
}));

const httpClientMock: HttpClient = {} as HttpClient;

describe('getDashboardModels', () => {
  expect.extend({
    oneOf: oneOfExpectExtension,
  });
  beforeEach(() => {
    getDashboardsMock.mockClear();
    getSharedFormulasMock.mockClear();
  });

  it('should fetch all dashboard models', async () => {
    const result = await getDashboardModels(httpClientMock);

    expect(result.length).toBe(dashboardsMock.length);

    result.forEach((dashboard, index) => {
      const dashboardMock = dashboardsMock[index];
      expect(dashboard).toMatchObject({
        oid: dashboardMock.oid,
        title: dashboardMock.title,
        dataSource: {
          id: dashboardMock.datasource.id,
          address: dashboardMock.datasource.address,
          title: dashboardMock.datasource.title,
          type: (expect as ExpectWithOneOfExtension).oneOf(['live', 'elasticube']),
        },
        styleOptions: {
          ...(dashboardMock.style?.palette?.colors && {
            palette: {
              variantColors: dashboardMock.style.palette.colors,
            },
          }),
        },
        settings: dashboardMock.settings,
      });

      expect(dashboard.layoutOptions).toBeDefined();
      expect(dashboard.filters).toBeDefined();
      expect(dashboard.widgets).toBeDefined();
      expect(dashboard.widgetsOptions).toBeDefined();
      expect(dashboard.config).toBeDefined();
    });
  });

  it('should include widgets when includeWidgets is true', async () => {
    const options: GetDashboardModelsOptions = {
      includeWidgets: true,
    };
    const result = await getDashboardModels(httpClientMock, options);

    expect(result.length).toBe(dashboardsMock.length);

    result.forEach((dashboard, index) => {
      const dashboardMock = dashboardsMock[index];
      expect(dashboard.oid).toBe(dashboardMock.oid);
      expect(dashboard.title).toBe(dashboardMock.title);
      expect(dashboard.dataSource).toEqual({
        id: dashboardMock.datasource.id,
        address: dashboardMock.datasource.address,
        title: dashboardMock.datasource.title,
        type: (expect as ExpectWithOneOfExtension).oneOf(['live', 'elasticube']),
      });

      // Verify widgets are included and valid
      expect(dashboard.widgets).toBeDefined();
      expect(dashboard.widgets?.length).toBe(dashboardMock.widgets?.length);
      dashboard.widgets?.forEach((widget) => {
        expect(isWidgetModel(widget)).toBe(true);
      });

      // Verify widgetsOptions
      expect(dashboard.widgetsOptions).toBeDefined();
      dashboardMock.widgets?.forEach((widgetMock) => {
        expect(dashboard.widgetsOptions?.[widgetMock.oid]).toBeDefined();
      });
    });
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
        address: 'localHost',
        id: 'localhost_aSampleIAAaHealthcare',
        title: targetDashboardMock.datasource.title,
        type: (expect as ExpectWithOneOfExtension).oneOf(['live', 'elasticube']),
      },
      widgets: expect.anything(),
      widgetsOptions: expect.anything(),
      config: expect.anything(),
      styleOptions: {
        ...(targetDashboardMock.style?.palette?.colors
          ? {
              palette: {
                variantColors: targetDashboardMock.style.palette.colors,
              },
            }
          : null),
      },
      settings: targetDashboardMock.settings,
      userAuth: expect.anything(),
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

  it('should resolve shared formulas when includeWidgets is true', async () => {
    const options: GetDashboardModelsOptions = {
      includeWidgets: true,
    };

    const result = await getDashboardModels(httpClientMock, options);

    // Verify shared formulas were fetched
    expect(getSharedFormulasMock).toHaveBeenCalledWith(Object.keys(sharedFormulasDictionary));

    // Verify the dashboard with shared formulas is in the result
    const dashboardWithFormulas = result.find((d) => d.oid === dashboardWithSharedFormulas.oid);
    expect(dashboardWithFormulas).toBeDefined();
    expect(dashboardWithFormulas?.oid).toBe(dashboardWithSharedFormulas.oid);
    expect(dashboardWithFormulas?.title).toBe(dashboardWithSharedFormulas.title);

    // Verify widgets are included
    expect(dashboardWithFormulas?.widgets).toBeDefined();
    expect(dashboardWithFormulas?.widgets?.length).toBe(
      dashboardWithSharedFormulas.widgets?.length,
    );
  });
});
