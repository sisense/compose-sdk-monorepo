import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from './rest-api';

const httpGetMock = vi.fn();
const httpClientMock = {
  get: httpGetMock,
} as unknown as HttpClient;

const restApi = new RestApi(httpClientMock);

describe('Rest API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error when creating a RestApi without a HttpClient', () => {
    expect(() => new RestApi(undefined as unknown as HttpClient)).toThrow();
  });

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

  it('should send correct request to fetch particular dashboard', async () => {
    await restApi.getDashboard('dashboardOid', {
      fields: ['field1', 'field2'],
      expand: ['expand1', 'expand2'],
    });
    expect(httpGetMock).toHaveBeenCalledWith(
      'api/v1/dashboards/dashboardOid?fields=field1%2Cfield2&expand=expand1%2Cexpand2',
    );
  });

  it('should throw an error when fetching a dashboard with an invalid identifier', async () => {
    httpGetMock.mockRejectedValueOnce({ status: 400 });
    await expect(restApi.getDashboard('invalid-id')).rejects.toThrow();
  });

  it('should send correct request to fetch a widget', async () => {
    await restApi.getWidget('widgetOid', 'dashboardOid');
    expect(httpGetMock).toHaveBeenCalledWith('api/v1/dashboards/dashboardOid/widgets/widgetOid');
  });

  it('should throw an error when fetching a widget with an invalid identifier', async () => {
    httpGetMock.mockRejectedValueOnce({ status: 400 });
    await expect(restApi.getWidget('invalid-id', 'invalid-id')).rejects.toThrow();
  });

  it('should send correct request to fetch countries geo json', async () => {
    await restApi.getCountriesGeoJson();
    expect(httpGetMock).toHaveBeenCalledWith('api/v1/geo/geojson/world');
  });

  it('should send correct request to fetch USA states geo json', async () => {
    await restApi.getUsaStatesGeoJson();
    expect(httpGetMock).toHaveBeenCalledWith('api/v1/geo/geojson/usa');
  });
});
