import { HttpClient } from '@sisense/sdk-rest-client';
import { useMemo } from 'react';
import { FeatureCollection as GeoJsonFeatureCollection } from 'geojson';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { WidgetDto } from '../dashboard-widget/types';
import type { DashboardDto } from './types/dashboard-dto';
import { TranslatableError } from '../translation/translatable-error';

type GetDashboardsOptions = {
  searchByTitle?: string;
  fields?: string[];
  expand?: string[];
};

type GetDashboardOptions = {
  fields?: string[];
};

export class RestApi {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient | undefined) {
    if (!httpClient) throw new Error('HttpClient not found.');
    this.httpClient = httpClient;
  }

  /**
   * Get all dashboards
   */
  public getDashboards = (options: GetDashboardsOptions = {}) => {
    const { fields, expand, searchByTitle } = options;
    const queryParams = new URLSearchParams({
      ...(searchByTitle && { name: searchByTitle }),
      ...(fields?.length && { fields: fields?.join(',') }),
      ...(expand?.length && { expand: expand?.join(',') }),
    }).toString();

    return this.httpClient.get<DashboardDto[]>(`api/v1/dashboards?${queryParams}`);
  };

  /**
   * Get a specific dashboard
   */
  public getDashboard = (dashboardOid: string, options: GetDashboardOptions = {}) => {
    const { fields } = options;
    // Note: do not use `expand` query parameter cause it is restricted for all non-admin users.
    const queryParams = new URLSearchParams({
      ...(fields?.length && { fields: fields?.join(',') }),
    }).toString();

    return this.httpClient
      .get<DashboardDto>(`api/v1/dashboards/${dashboardOid}?${queryParams}`)
      .catch(() => {
        // when error is encountered, API may return only status code 422 without informative error message
        // to remedy, catch error and throw a more informative error message
        throw new TranslatableError('errors.dashboardInvalidIdentifier');
      });
  };

  /**
   * Get all widgets of a specific dashboard
   */
  public getDashboardWidgets = (dashboardOid: string) => {
    return this.httpClient
      .get<WidgetDto[]>(`api/v1/dashboards/${dashboardOid}/widgets`)
      .catch(() => {
        // when error is encountered, API may return only status code 422 without informative error message
        // to remedy, catch error and throw a more informative error message
        throw new TranslatableError('errors.dashboardWidgetsInvalidIdentifiers');
      });
  };

  /**
   * Get a specific widget from a dashboard
   */
  public getWidget = (widgetOid: string, dashboardOid: string) => {
    return this.httpClient
      .get<WidgetDto>(`api/v1/dashboards/${dashboardOid}/widgets/${widgetOid}`)
      .catch(() => {
        // when error is encountered, API may return only status code 422 without informative error message
        // to remedy, catch error and throw a more informative error message
        throw new TranslatableError('errors.dashboardWidgetInvalidIdentifiers');
      });
  };

  /**
   * Get a GeoJSON data for all countries
   */
  public getCountriesGeoJson = () => {
    return this.httpClient.get<GeoJsonFeatureCollection>(`api/v1/geo/geojson/world`);
  };

  /**
   * Get a GeoJSON data for all USA states
   */
  public getUsaStatesGeoJson = () => {
    return this.httpClient.get<GeoJsonFeatureCollection>(`api/v1/geo/geojson/usa`);
  };
}

export const useGetApi = () => {
  const { app } = useSisenseContext();
  return useMemo(() => new RestApi(app?.httpClient), [app]);
};
