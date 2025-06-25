import { HttpClient } from '@sisense/sdk-rest-client';
import { useMemo } from 'react';
import { FeatureCollection as GeoJsonFeatureCollection } from 'geojson';
import isUndefined from 'lodash-es/isUndefined';
import {
  DataSourceField,
  DimensionalLevelAttribute,
  getColumnNameFromAttribute,
  getDataSourceName,
  getTableNameFromAttribute,
  type DataSource,
} from '@sisense/sdk-data';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { HierarchyDto, SharedFormulaDto, WidgetDto } from '../widget-by-id/types';
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
  sharedMode?: boolean;
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
  public getDashboards = async (options: GetDashboardsOptions = {}) => {
    const { fields, expand, searchByTitle } = options;
    const queryParams = new URLSearchParams({
      ...(searchByTitle && { name: searchByTitle }),
      ...(fields?.length && { fields: fields?.join(',') }),
      ...(expand?.length && { expand: expand?.join(',') }),
    }).toString();

    const dashboards = await this.httpClient.get<DashboardDto[]>(
      `api/v1/dashboards?${queryParams}`,
    );

    if (!dashboards) return [];

    // fetch datasources that are not present in the dashboard object
    // a workaround for the API issue where the datasource is not returned in the dashboard object (WAT)
    const dashboardsPromises = dashboards.map(async (dashboard) => {
      if (dashboard.oid && !dashboard.datasource) {
        const dashboardInfo = await this.getDashboard(dashboard.oid, { fields: ['datasource'] });

        return dashboardInfo?.datasource
          ? { ...dashboard, datasource: dashboardInfo.datasource }
          : dashboard;
      }
      return dashboard;
    });

    return Promise.all(dashboardsPromises);
  };

  /**
   * Get a specific dashboard
   */
  public getDashboard = (dashboardOid: string, options: GetDashboardOptions = {}) => {
    const { fields, sharedMode } = options;
    // Note: do not use `expand` query parameter cause it is restricted for all non-admin users.
    const queryParams = new URLSearchParams({
      ...(fields?.length && { fields: fields?.join(',') }),
      ...(sharedMode && { sharedMode: 'true' }),
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
  public getDashboardWidgets = (dashboardOid: string, sharedMode?: boolean) => {
    const queryParams = new URLSearchParams({
      ...(sharedMode && { sharedMode: 'true' }),
    }).toString();

    return this.httpClient
      .get<WidgetDto[]>(`api/v1/dashboards/${dashboardOid}/widgets?${queryParams}`)
      .catch(() => {
        // when error is encountered, API may return only status code 422 without informative error message
        // to remedy, catch error and throw a more informative error message
        throw new TranslatableError('errors.dashboardWidgetsInvalidIdentifiers');
      });
  };

  /**
   * Get a specific widget from a dashboard
   */
  public getWidget = (widgetOid: string, dashboardOid: string, sharedMode?: boolean) => {
    const queryParams = new URLSearchParams({
      ...(sharedMode && { sharedMode: 'true' }),
    }).toString();

    return this.httpClient
      .get<WidgetDto>(`api/v1/dashboards/${dashboardOid}/widgets/${widgetOid}?${queryParams}`)
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
      .get<HierarchyDto[]>(`api/elasticubes/hierarchies?${queryParams}`)
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
  public patchDashboard = (
    dashboardOid: string,
    dashboard: Partial<DashboardDto>,
    sharedMode?: boolean,
  ) => {
    const queryParams = new URLSearchParams({
      ...(sharedMode && { sharedMode: 'true' }),
    }).toString();

    return this.httpClient.patch<DashboardDto>(
      `api/v1/dashboards/${dashboardOid}?${queryParams}`,
      dashboard,
    );
  };

  /**
   * Add widget to a dashboard
   */
  public addWidgetToDashboard = (
    dashboardOid: string,
    widgetDto: WidgetDto,
    sharedMode?: boolean,
  ) => {
    const queryParams = new URLSearchParams({
      ...(sharedMode && { sharedMode: 'true' }),
    }).toString();

    return this.httpClient.post<WidgetDto>(
      `api/v1/dashboards/${dashboardOid}/widgets?${queryParams}`,
      widgetDto,
    );
  };

  /**
   * Delete widget from a dashboard
   */
  public deleteWidgetFromDashboard = (
    dashboardOid: string,
    widgetOid: string,
    sharedMode?: boolean,
  ) => {
    const queryParams = new URLSearchParams({
      ...(sharedMode && { sharedMode: 'true' }),
    }).toString();

    return this.httpClient.delete(
      `api/v1/dashboards/${dashboardOid}/widgets/${widgetOid}?${queryParams}`,
    );
  };

  /**
   * Get shared formulas by ids
   *
   * @param sharedFormulasIds - An array of shared formulas ids
   * @returns A dictionary of shared formulas
   */
  public getSharedFormulas = async (
    sharedFormulasIds: string[],
  ): Promise<Record<string, SharedFormulaDto>> => {
    const sharedFormulas = await Promise.all(sharedFormulasIds.map(this.getSharedFormula));
    return sharedFormulas.filter(isSharedFormulaDto).reduce((acc, sharedFormula) => {
      acc[sharedFormula.oid] = sharedFormula;
      return acc;
    }, {});
  };

  /**
   * Get a shared formula by id
   *
   * @param sharedFormulaId - A shared formula id
   * @returns A shared formula
   */
  public getSharedFormula = async (sharedFormulaId: string) => {
    return this.httpClient.get<SharedFormulaDto>(`api/v1/formulas/${sharedFormulaId}`);
  };

  /**
   * Get datasource fields
   *
   * @param dataSource - A datasource name
   * @param options - An object with offset and count
   * @returns A list of datasource fields
   */
  public getDataSourceFields = (
    dataSource: string,
    options?: { offset?: number; count?: number; searchValue?: string },
  ) => {
    const { offset = 0, count = 9999 } = options || {};
    return this.httpClient.post<DataSourceField[]>(
      `api/datasources/${encodeURIComponent(dataSource)}/fields/search`,
      {
        offset: offset,
        count: count,
        term: options?.searchValue,
      },
    );
  };
}

function isSharedFormulaDto(
  sharedFormula: SharedFormulaDto | undefined,
): sharedFormula is SharedFormulaDto {
  return !!sharedFormula;
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
