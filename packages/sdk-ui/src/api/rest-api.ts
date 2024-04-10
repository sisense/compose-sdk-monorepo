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

  constructor(httpClient: HttpClient) {
    if (!httpClient) throw new Error('HttpClient not found.');
    this.httpClient = httpClient;
  }

  /**
   * Get all dashboards
   */
  public getDashboards = async (options: GetDashboardsOptions = {}): Promise<DashboardDto[]> => {
    const { fields, expand, searchByTitle } = options;
    const queryParams = new URLSearchParams({
      ...(searchByTitle && { name: searchByTitle }),
      ...(fields?.length && { fields: fields?.join(',') }),
      ...(expand?.length && { expand: expand?.join(',') }),
    }).toString();

    return this.httpClient.get(`api/v1/dashboards?${queryParams}`);
  };

  /**
   * Get a specific dashboard
   */
  public getDashboard = async (
    dashboardOid: string,
    options: GetDashboardOptions = {},
  ): Promise<DashboardDto> => {
    const { fields } = options;
    // Note: do not use `expand` query parameter cause it is restricted for all non-admin users.
    const queryParams = new URLSearchParams({
      ...(fields?.length && { fields: fields?.join(',') }),
    }).toString();

    try {
      return await this.httpClient.get(`api/v1/dashboards/${dashboardOid}?${queryParams}`);
    } catch (error) {
      // when error is encountered, API may return only status code 422 without informative error message
      // to remedy, catch error and throw a more informative error message
      throw new TranslatableError('errors.dashboardInvalidIdentifier');
    }
  };

  /**
   * Get all widgets of a specific dashboard
   */
  public getDashboardWidgets = async (dashboardOid: string): Promise<WidgetDto[]> => {
    try {
      return await this.httpClient.get(`api/v1/dashboards/${dashboardOid}/widgets`);
    } catch (error) {
      // when error is encountered, API may return only status code 422 without informative error message
      // to remedy, catch error and throw a more informative error message
      throw new TranslatableError('errors.dashboardWidgetsInvalidIdentifiers');
    }
  };

  /**
   * Get a specific widget from a dashboard
   */
  public getWidget = async (widgetOid: string, dashboardOid: string): Promise<WidgetDto> => {
    try {
      return await this.httpClient.get(`api/v1/dashboards/${dashboardOid}/widgets/${widgetOid}`);
    } catch (error) {
      // when error is encountered, API may return only status code 422 without informative error message
      // to remedy, catch error and throw a more informative error message
      throw new TranslatableError('errors.dashboardWidgetInvalidIdentifiers');
    }
  };

  /**
   * Get a GeoJSON data for all countries
   */
  public getCountriesGeoJson = async (): Promise<GeoJsonFeatureCollection> => {
    return this.httpClient.get(`api/v1/geo/geojson/world`);
  };

  /**
   * Get a GeoJSON data for all USA states
   */
  public getUsaStatesGeoJson = async (): Promise<GeoJsonFeatureCollection> => {
    return this.httpClient.get(`api/v1/geo/geojson/usa`);
  };
}

export const useGetApi = () => {
  const { app } = useSisenseContext();
  return useMemo(() => new RestApi(app!.httpClient), [app]);
};
