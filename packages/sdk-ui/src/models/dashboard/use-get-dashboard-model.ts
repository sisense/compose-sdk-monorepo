import { useEffect, useReducer } from 'react';
import { useHasChanged } from '../../common/hooks/use-has-changed';
import { useShouldLoad } from '../../common/hooks/use-should-load';
import { DataState, dataLoadStateReducer } from '../../common/hooks/data-load-state-reducer';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import { DashboardModel } from './dashboard-model';
import { getDashboardModel, GetDashboardModelOptions } from './get-dashboard-model';
import { HookEnableParam } from '../../common/hooks/types';
import { TranslatableError } from '../../translation/translatable-error';
import { withTracking } from '../../decorators/hook-decorators';
import { useThemeContext } from '../../theme-provider';

/**
 * Parameters for {@link useGetDashboardModel} hook.
 */
export interface GetDashboardModelParams extends GetDashboardModelOptions, HookEnableParam {
  /**
   * Dashboard identifier
   */
  dashboardOid: string;
}

/**
 * States of a dashboard model load.
 */
export type DashboardModelState =
  | DashboardModelLoadingState
  | DashboardModelErrorState
  | DashboardModelSuccessState;

/**
 * State of a dashboard model loading.
 */
export type DashboardModelLoadingState = {
  /** Whether the dashboard model is loading */
  isLoading: true;
  /** Whether the dashboard model load has failed */
  isError: false;
  /** Whether the dashboard model load has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: undefined;
  /** The result dashboard model if the load has succeeded */
  dashboard: DashboardModel | undefined;
  /** The status of the dashboard model load */
  status: 'loading';
};

/**
 * State of a dashboard model load that has failed.
 */
export type DashboardModelErrorState = {
  /** Whether the dashboard model is loading */
  isLoading: false;
  /** Whether the dashboard model load has failed */
  isError: true;
  /** Whether the dashboard model load has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: Error;
  /** The result dashboard model if the load has succeeded */
  dashboard: undefined;
  /** The status of the dashboard model load */
  status: 'error';
};

/**
 * State of a dashboard model load that has succeeded.
 */
export type DashboardModelSuccessState = {
  /** Whether the dashboard model is loading */
  isLoading: false;
  /** Whether the dashboard model load has failed */
  isError: false;
  /** Whether the dashboard model load has succeeded */
  isSuccess: true;
  /** The error if any occurred */
  error: undefined;
  /** The result dashboard model if the load has succeeded */
  dashboard: DashboardModel;
  /** The status of the dashboard model load */
  status: 'success';
};

/**
 * React hook that retrieves an existing dashboard model from the Sisense instance.
 *
 * **Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * @example
 * An example of retrieving an existing dashboard model from the Sisense instance and render its widgets with component `DashboardWidget`:
 ```tsx
  const { dashboard, isLoading, isError } = useGetDashboardModel({
    dashboardOid: '6448665edac1920034bce7a8',
    includeWidgets: true,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (dashboard) {
    return (
      <div>
        {`Dashboard Title - ${dashboard.title}`}
        {dashboard.widgets?.map((widget) => (
          <DashboardWidget key={widget.oid} widgetOid={widget.oid} dashboardOid={dashboard.oid} />
        ))}
      </div>
    );
  }
  return null;
 ```
 * @returns Dashboard load state that contains the status of the execution, the result dashboard model, or the error if any
 * @group Fusion Embed
 * @fusionEmbed
 */
export const useGetDashboardModel = withTracking('useGetDashboardModel')(
  useGetDashboardModelInternal,
);

/**
 * {@link useGetDashboardModel} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the dashboard to be retrieved
 *
 * @internal
 */
export function useGetDashboardModelInternal(params: GetDashboardModelParams) {
  const isParamsChanged = useHasChanged(params, ['dashboardOid']);
  const shouldLoad = useShouldLoad(params, isParamsChanged);
  const [dataState, dispatch] = useReducer(dataLoadStateReducer<DashboardModel>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const { isInitialized, app } = useSisenseContext();
  const { themeSettings } = useThemeContext();

  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'error',
        error: new TranslatableError('errors.sisenseContextNotFound'),
      });
    }
    if (shouldLoad(app)) {
      dispatch({ type: 'loading' });

      const { dashboardOid, includeWidgets, includeFilters } = params;
      void getDashboardModel(
        app.httpClient,
        dashboardOid,
        {
          includeWidgets,
          includeFilters,
        },
        themeSettings,
        app.settings,
      )
        .then((data) => {
          dispatch({ type: 'success', data });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [app, isInitialized, params, shouldLoad, themeSettings]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (dataState.data && isParamsChanged) {
    return translateToDashboardResponse(dataLoadStateReducer(dataState, { type: 'loading' }));
  }

  return translateToDashboardResponse(dataState);
}

/**
 * Translates the data state to the dashboard model state.
 *
 * @internal
 * @param dataState - The data state to be translated
 */
export function translateToDashboardResponse(dataState: DataState<DashboardModel>) {
  const { data, ...rest } = dataState;

  return {
    ...rest,
    dashboard: data,
  } as DashboardModelState;
}
