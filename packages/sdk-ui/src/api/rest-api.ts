import { HttpClient } from '@sisense/sdk-rest-client';
import { useMemo } from 'react';
import { FeatureCollection as GeoJsonFeatureCollection } from 'geojson';
import isUndefined from 'lodash-es/isUndefined';
import {
  DimensionalLevelAttribute,
  getColumnNameFromAttribute,
  getDataSourceName,
  getTableNameFromAttribute,
  type DataSource,
} from '@sisense/sdk-data';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { HierarchyDto, WidgetDto } from '../widget-by-id/types';
import type { DashboardDto } from './types/dashboard-dto';
import { TranslatableError } from '../translation/translatable-error';
import { PaletteDto } from '@/api/types/palette-dto';
import { GetHierarchiesOptions } from '@/models/hierarchy/types';

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

  private defaultDataSource?: DataSource;

  constructor(httpClient: HttpClient | undefined, defaultDataSource?: DataSource) {
    if (!httpClient) throw new TranslatableError('errors.httpClientNotFound');
    this.httpClient = httpClient;
    this.defaultDataSource = defaultDataSource;
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
        throw new TranslatableError('errors.widgetByIdInvalidIdentifier');
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

  /**
   * Get all palettes
   */
  public getPalettes = () => {
    return this.httpClient.get<PaletteDto[]>(`api/palettes`);
  };

  /**
   * Get hierarchies
   */
  public getHierarchies = ({
    dataSource = this.defaultDataSource,
    dimension,
    ids,
    alwaysIncluded,
  }: GetHierarchiesOptions) => {
    const isDateDimension = 'granularity' in dimension;
    let dateLevel = '';

    if (!dataSource) {
      throw new TranslatableError('errors.missingDataSource');
    }

    if (isDateDimension) {
      const { level, dateTimeLevel } = (
        dimension as DimensionalLevelAttribute
      ).translateGranularityToJaql();
      dateLevel = level ?? dateTimeLevel;
    }

    const queryParams = new URLSearchParams({
      elasticube: getDataSourceName(dataSource),
      table: getTableNameFromAttribute(dimension),
      column: getColumnNameFromAttribute(dimension),
      ...(dateLevel && { dateLevel }),
      ...(alwaysIncluded && { alwaysIncluded: `${alwaysIncluded}` }),
      ...(ids?.length && { ids: ids.join(',') }),
    }).toString();

    return this.httpClient
      .get<HierarchyDto[]>(`/api/elasticubes/hierarchies?${queryParams}`)
      .then((rawHierarchies = []) => {
        /**
         * Note: fixes an API issue where the 'ids' parameter does not work correctly
         * when the 'alwaysIncluded' parameter is not provided.
         */
        const isFiltedOnlyByIds = isUndefined(alwaysIncluded) && ids?.length;
        return isFiltedOnlyByIds
          ? rawHierarchies.filter(({ _id }) => ids.includes(_id))
          : rawHierarchies;
      });
  };

  /**
   * Partially update a dashboard
   */
  public patchDashboard = (dashboardOid: string, dashboard: Partial<DashboardDto>) => {
    return this.httpClient.patch<DashboardDto>(`api/v1/dashboards/${dashboardOid}`, dashboard);
  };

  /**
   * Add widget to a dashboard
   */
  public addWidgetToDashboard = (dashboardOid: string, widgetDto: WidgetDto) => {
    return this.httpClient.post<WidgetDto>(`api/v1/dashboards/${dashboardOid}/widgets`, widgetDto);
  };
}

export const useRestApi = () => {
  const { app } = useSisenseContext();
  return {
    restApi: useMemo(() => app && new RestApi(app.httpClient, app.defaultDataSource), [app]),
    isReady: !!app,
  };
};

export class RestApiNotReadyError extends TranslatableError {
  constructor() {
    super('errors.restApiNotReady');
  }
}
