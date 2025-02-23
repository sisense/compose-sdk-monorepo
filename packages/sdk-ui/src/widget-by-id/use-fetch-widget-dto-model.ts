import { useEffect, useState } from 'react';
import { RestApi, useRestApi } from '../api/rest-api.js';
import { DashboardDto } from '../api/types/dashboard-dto.js';
import { WidgetDto } from './types.js';
import { TranslatableError } from '@/translation/translatable-error';

/**
 * Fetches a Widget DTO model and, optionally, a Dashboard DTO model.
 *
 * @internal
 * @param {object} options - The options for fetching the DTO models.
 * @param {string} options.widgetOid - The OID of the widget to fetch.
 * @param {string} options.dashboardOid - The OID of the dashboard to which the widget belongs.
 * @param {boolean} [options.includeDashboard] - (Optional) Whether to include the associated dashboard.
 * @param {RestApi} options.api - The RestApi instance to use for fetching.
 * @returns {Promise<{widget: WidgetDto, dashboard?: DashboardDto}>} A promise that resolves to an object containing the Widget DTO and optionally the Dashboard DTO.
 */
export const fetchWidgetDtoModel = async ({
  widgetOid,
  dashboardOid,
  includeDashboard,
  api,
}: {
  widgetOid: string;
  dashboardOid: string;
  includeDashboard?: boolean;
  api: RestApi;
}) => {
  const [widget, dashboard] = await Promise.all([
    api.getWidget(widgetOid, dashboardOid),
    includeDashboard ? api.getDashboard(dashboardOid) : undefined,
  ]);
  return { widget, dashboard };
};

/**
 * Custom hook for fetching Widget DTO and Dashboard DTO models.
 *
 * @internal
 * @param {object} options - The options for fetching the DTO models.
 * @param {string} options.widgetOid - The OID of the widget to fetch.
 * @param {string} options.dashboardOid - The OID of the dashboard to which the widget belongs.
 * @param {boolean} [options.includeDashboard] - (Optional) Whether to include the associated dashboard.
 * @returns {{
 *   widget: WidgetDto,
 *   dashboard?: DashboardDto,
 *   error: Error
 * }} An object containing the Widget DTO, optionally the Dashboard DTO, and an error if fetching fails.
 */
export const useFetchWidgetDtoModel = ({
  widgetOid,
  dashboardOid,
  includeDashboard,
}: {
  widgetOid: string;
  dashboardOid: string;
  includeDashboard?: boolean;
}) => {
  const [error, setError] = useState<Error | undefined>();
  const { restApi: api, isReady: apiIsReady } = useRestApi();

  const [fetchedDtoModels, setFetchedDtoModelsWidget] = useState<{
    widget: WidgetDto;
    dashboard?: DashboardDto;
  }>();

  useEffect(() => {
    if (!apiIsReady || !api) {
      return;
    }
    fetchWidgetDtoModel({ widgetOid, dashboardOid, includeDashboard, api })
      .then(({ widget, dashboard }) => {
        if (!widget) {
          throw new TranslatableError('errors.widgetEmptyResponse', { widgetOid });
        }
        setFetchedDtoModelsWidget({
          widget,
          dashboard,
        });
      })
      .catch((asyncError: Error) => {
        // set error state to trigger rerender and throw synchronous error
        setError(asyncError);
      });
  }, [widgetOid, dashboardOid, api, apiIsReady, includeDashboard]);

  return {
    ...fetchedDtoModels,
    error,
  };
};
