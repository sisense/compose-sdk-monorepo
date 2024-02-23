import { isEqual } from 'lodash';
import { useEffect, useReducer, useState } from 'react';
import { usePrevious } from '../../common/hooks/use-previous';
import { DataState, dataLoadStateReducer } from '../../common/hooks/data-load-state-reducer';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import { type DashboardModel } from './types';
import { getDashboardModel, GetDashboardModelOptions } from './get-dashboard-model';
import { HookEnableParam } from '../../common/hooks/types';
import { TranslatableError } from '../../translation/translatable-error';
import { withTracking } from '../../decorators/hook-decorators';

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
 * @param params - Parameters of the dashboard to be retrieved
 * @returns Dashboard load state that contains the status of the execution, the result dashboard model, or the error if any
 */
export const useGetDashboardModel = withTracking('useGetDashboardModel')(
  useGetDashboardModelInternal,
);

/**
 * {@link useGetDashboardModel} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useGetDashboardModelInternal(params: GetDashboardModelParams) {
  const prevParams = usePrevious(params);
  const [dataState, dispatch] = useReducer(dataLoadStateReducer<DashboardModel>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const { isInitialized, app } = useSisenseContext();
  const [isNeverExecuted, setIsNeverExecuted] = useState(true);

  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'error',
        error: new TranslatableError('errors.sisenseContextNotFound'),
      });
    }
    if (!app) {
      return;
    }
    if (params?.enabled === false) {
      return;
    }
    if (isNeverExecuted || isParamsChanged(prevParams, params)) {
      if (isNeverExecuted) {
        setIsNeverExecuted(false);
      }
      dispatch({ type: 'loading' });

      const { dashboardOid, includeWidgets } = params;
      void getDashboardModel(app.httpClient, dashboardOid, {
        includeWidgets,
      })
        .then((data) => {
          dispatch({ type: 'success', data });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [app, isInitialized, prevParams, params, isNeverExecuted]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (dataState.data && isParamsChanged(prevParams, params)) {
    return translateToDashboardResponse(dataLoadStateReducer(dataState, { type: 'loading' }));
  }

  return translateToDashboardResponse(dataState);
}

/**
 * Checks if the parameters have changed by deep comparison.
 *
 * @param prevParams - Previous query parameters
 * @param newParams - New query parameters
 */
function isParamsChanged(
  prevParams: GetDashboardModelParams | undefined,
  newParams: GetDashboardModelParams,
): boolean {
  if (!prevParams && newParams) {
    return true;
  }

  const simplySerializableParamNames = ['dashboardOid'];
  return simplySerializableParamNames.some(
    (paramName) => !isEqual(prevParams?.[paramName], newParams[paramName]),
  );
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
