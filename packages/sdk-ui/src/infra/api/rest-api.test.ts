import { HttpClient } from '@sisense/sdk-rest-client';
import { renderHook } from '@testing-library/react';
import { Mock } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { ClientApplication } from '../app/client-application';
import { useSisenseContext } from '../contexts/sisense-context/sisense-context';
import { RestApi, useRestApi } from './rest-api';

const httpGetMock = vi.fn();
const httpPostMock = vi.fn();
const httpClientMock = {
  get: httpGetMock,
  post: httpPostMock,
} as unknown as HttpClient;

vi.mock('../contexts/sisense-context/sisense-context', async () => {
  const actual: typeof import('../contexts/sisense-context/sisense-context') =
    await vi.importActual('../contexts/sisense-context/sisense-context');

  return {
    ...actual,
    useSisenseContext: vi.fn(() => ({})),
  };
});
const useSisenseContextMock = useSisenseContext as Mock<typeof useSisenseContext>;

const restApi = new RestApi(httpClientMock, DM.DataSource);

describe('Rest API', () => {
  beforeEach(() => {
    httpGetMock.mockResolvedValue(undefined); // httpClient.get returns a promise
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error when creating a RestApi without a HttpClient', () => {
    expect(() => new RestApi(undefined as unknown as HttpClient)).toThrow();
  });

  describe('getDashboards', () => {
    it('should not fail when options are not provided', async () => {
      await restApi.getDashboards();
      expect(httpGetMock).toHaveBeenCalledWith('api/v1/dashboards?');
    });

    it('should send correct request to fetch dashboards', async () => {
      await restApi.getDashboards({
        searchByTitle: 'title',
        fields: ['field1', 'field2'],
        expand: ['expand1', 'expand2'],
      });
      expect(httpGetMock).toHaveBeenCalledWith(
        'api/v1/dashboards?name=title&fields=field1%2Cfield2&expand=expand1%2Cexpand2',
      );
    });

    it('should send correct request to fetch dashboards and their datasources for wat', async () => {
      httpGetMock
        .mockResolvedValueOnce([{ oid: 'oid1', datasource: null }])
        .mockResolvedValueOnce({ datasource: 'someDatasource' });

      const result = await restApi.getDashboards({
        searchByTitle: 'title',
        fields: ['field1', 'field2'],
        expand: ['expand1', 'expand2'],
      });

      expect(httpGetMock).toHaveBeenNthCalledWith(
        1, // First call
        'api/v1/dashboards?name=title&fields=field1%2Cfield2&expand=expand1%2Cexpand2',
      );
      expect(httpGetMock).toHaveBeenNthCalledWith(
        2, // Second call
        'api/v1/dashboards/oid1?fields=datasource',
      );
      expect(result).toEqual([{ oid: 'oid1', datasource: 'someDatasource' }]);
    });
  });
  describe('getDashboard', () => {
    it('should send correct request to fetch particular dashboard', async () => {
      await restApi.getDashboard('dashboardOid', {
        fields: ['field1', 'field2'],
      });
      expect(httpGetMock).toHaveBeenCalledWith(
        'api/v1/dashboards/dashboardOid?fields=field1%2Cfield2',
      );
    });

    it('should throw an error when fetching a dashboard with an invalid identifier', async () => {
      httpGetMock.mockRejectedValueOnce({ status: 400 });
      await expect(restApi.getDashboard('invalid-id')).rejects.toThrow();
    });
  });

  describe('getWidget', () => {
    it('should send correct request to fetch a widget', async () => {
      await restApi.getWidget('widgetOid', 'dashboardOid');
      expect(httpGetMock).toHaveBeenCalledWith('api/v1/dashboards/dashboardOid/widgets/widgetOid?');
    });

    it('should throw an error when fetching a widget with an invalid identifier', async () => {
      httpGetMock.mockRejectedValueOnce({ status: 400 });
      await expect(restApi.getWidget('invalid-id', 'invalid-id')).rejects.toThrow();
    });
  });

  describe('getCountriesGeoJson', () => {
    it('should send correct request to fetch countries geo json', async () => {
      await restApi.getCountriesGeoJson();
      expect(httpGetMock).toHaveBeenCalledWith('api/v1/geo/geojson/world');
    });
  });

  describe('getUsaStatesGeoJson', () => {
    it('should send correct request to fetch USA states geo json', async () => {
      await restApi.getUsaStatesGeoJson();
      expect(httpGetMock).toHaveBeenCalledWith('api/v1/geo/geojson/usa');
    });
  });

  describe('getHierarchies', () => {
    it('should send correct request to fetch hierarchies', async () => {
      await restApi.getHierarchies({
        dataSource: DM.DataSource,
        dimension: DM.Commerce.AgeRange,
      });
      expect(httpGetMock).toHaveBeenCalledWith(
        'api/elasticubes/hierarchies?elasticube=Sample+ECommerce&table=Commerce&column=Age+Range',
      );
    });

    it('should send correct request to fetch hierarchies specified by ids', async () => {
      await restApi.getHierarchies({
        dataSource: DM.DataSource,
        dimension: DM.Commerce.AgeRange,
        ids: ['1', '2'],
      });
      expect(httpGetMock).toHaveBeenCalledWith(
        'api/elasticubes/hierarchies?elasticube=Sample+ECommerce&table=Commerce&column=Age+Range&ids=1%2C2',
      );
    });

    it('should send correct request to fetch hierarchies with "alwaysIncluded" field equal "true"', async () => {
      await restApi.getHierarchies({
        dataSource: DM.DataSource,
        dimension: DM.Commerce.AgeRange,
        alwaysIncluded: true,
      });
      expect(httpGetMock).toHaveBeenCalledWith(
        'api/elasticubes/hierarchies?elasticube=Sample+ECommerce&table=Commerce&column=Age+Range&alwaysIncluded=true',
      );
    });

    it('should send correct request to fetch hierarchies with default datasource', async () => {
      await restApi.getHierarchies({
        dimension: DM.Commerce.AgeRange,
      });
      expect(httpGetMock).toHaveBeenCalledWith(
        'api/elasticubes/hierarchies?elasticube=Sample+ECommerce&table=Commerce&column=Age+Range',
      );
    });

    it('should throw an error when fetching hierarchies without a provided or default datasource', () => {
      const restApi = new RestApi(httpClientMock);
      expect(() => restApi.getHierarchies({ dimension: DM.Commerce.AgeRange })).toThrow();
    });
  });

  describe('addWidgetToDashboard', () => {
    it('should send correct post to add a widget with correct dashboardId', async () => {
      const dashboardId = '123';
      await restApi.addWidgetToDashboard(dashboardId, {} as any);
      expect(httpPostMock).toHaveBeenCalledWith(`api/v1/dashboards/${dashboardId}/widgets?`, {});
    });
  });

  describe('getSharedFormula', () => {
    it('should send correct request to fetch shared formula with flat=true', async () => {
      httpGetMock.mockResolvedValueOnce({ oid: '1' });
      const sharedFormula = await restApi.getSharedFormula('sharedFormulaId');
      expect(httpGetMock).toHaveBeenCalledWith('api/v1/formulas/sharedFormulaId?flat=true');
      expect(sharedFormula).toEqual({ oid: '1' });
    });
  });

  describe('getSharedFormulas', () => {
    it('should send correct request to fetch shared formulas', async () => {
      httpGetMock.mockResolvedValueOnce({ oid: '1' }).mockResolvedValueOnce({ oid: '2' });
      const sharedFormulas = await restApi.getSharedFormulas(['1', '2']);
      expect(httpGetMock).toHaveBeenCalledWith('api/v1/formulas/1?flat=true');
      expect(httpGetMock).toHaveBeenCalledWith('api/v1/formulas/2?flat=true');
      expect(sharedFormulas).toEqual({ 1: { oid: '1' }, 2: { oid: '2' } });
    });
  });

  describe('useRestApi', () => {
    it('useRestApi should load and return restApi', async () => {
      useSisenseContextMock.mockReturnValueOnce({
        app: { httpClient: httpClientMock } as ClientApplication,
        isInitialized: true,
        tracking: {
          enabled: false,
          packageName: 'sdk-ui',
        },
        errorBoundary: {
          showErrorBox: true,
        },
      });
      const { result } = renderHook(() => useRestApi());
      expect(result.current.restApi).toBeTruthy();
    });

    it('useRestApi should wait until clientApp initialized', async () => {
      const { result } = renderHook(() => useRestApi());
      expect(result.current.isReady).toBeFalsy();
    });
  });
});
