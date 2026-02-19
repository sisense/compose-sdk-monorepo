import { useEffect, useReducer } from 'react';

import { DashboardModel } from '@/domains/dashboarding/dashboard-model';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context.js';
import { withTracking } from '@/infra/decorators/hook-decorators';
import { TranslatableError } from '@/infra/translation/translatable-error.js';
import { dataLoadStateReducer, DataState } from '@/shared/hooks/data-load-state-reducer.js';
import { HookEnableParam } from '@/shared/hooks/types.js';
import { useHasChanged } from '@/shared/hooks/use-has-changed.js';
import { useShouldLoad } from '@/shared/hooks/use-should-load.js';

import { getDashboardModels, GetDashboardModelsOptions } from './get-dashboard-models.js';

/**
 * Parameters for {@link useGetDashboardModels} hook.
 */
export interface GetDashboardModelsParams extends GetDashboardModelsOptions, HookEnableParam {}

/**
 * States of a dashboard models load.
 */
export type DashboardModelsState =
  | DashboardModelsLoadingState
  | DashboardModelsErrorState
  | DashboardModelsSuccessState;

/**
 * State of a dashboard models loading.
 */
export type DashboardModelsLoadingState = {
  /** Whether the dashboard models is loading */
  isLoading: true;
  /** Whether the dashboard models load has failed */
  isError: false;
  /** Whether the dashboard models load has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: undefined;
  /** The result dashboard models if the load has succeeded */
  dashboards: DashboardModel[] | undefined;
  /** The status of the dashboard models load */
  status: 'loading';
};

/**
 * State of a dashboard models load that has failed.
 */
export type DashboardModelsErrorState = {
  /** Whether the dashboard models is loading */
  isLoading: false;
  /** Whether the dashboard models load has failed */
  isError: true;
  /** Whether the dashboard models load has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: Error;
  /** The result dashboard models if the load has succeeded */
  dashboards: undefined;
  /** The status of the dashboard models load */
  status: 'error';
};

/**
 * State of a dashboard models load that has succeeded.
 */
export type DashboardModelsSuccessState = {
  /** Whether the dashboard models is loading */
  isLoading: false;
  /** Whether the dashboard models load has failed */
  isError: false;
  /** Whether the dashboard models load has succeeded */
  isSuccess: true;
  /** The error if any occurred */
  error: undefined;
  /** The result dashboard models if the load has succeeded */
  dashboards: DashboardModel[];
  /** The status of the dashboard models load */
  status: 'success';
};

/**
 * React hook that retrieves existing dashboards that the user can access to from the Sisense instance.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @example
 ```tsx
  const { dashboards, isLoading, isError } = useGetDashboardModels();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (dashboards) {
    return <div>{`Total Dashboards: ${dashboards.length}`}</div>;
  }
  return null;
 ```
 * @returns Load state that contains the status of the execution, the result dashboards, or the error if any
 * @group Fusion Assets
 * @fusionEmbed
 */
export const useGetDashboardModels = withTracking('useGetDashboardModels')(
  useGetDashboardModelsInternal,
);

/**
 * {@link useGetDashboardModels} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the dashboards to be retrieved
 * @internal
 */
export function useGetDashboardModelsInternal(params: GetDashboardModelsParams = {}) {
  const isParamsChanged = useHasChanged(params, ['includeWidgets']);
  const shouldLoad = useShouldLoad(params, isParamsChanged);
  const [dataState, dispatch] = useReducer(dataLoadStateReducer<DashboardModel[]>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const { isInitialized, app } = useSisenseContext();

  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'error',
        error: new TranslatableError('errors.noSisenseContext'),
      });
    }
    if (shouldLoad(app)) {
      dispatch({ type: 'loading' });

      void getDashboardModels(app.httpClient, params)
        .then((data) => {
          dispatch({ type: 'success', data });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [app, isInitialized, params, shouldLoad]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (dataState.data && isParamsChanged) {
    return translateToDashboardsResponse(dataLoadStateReducer(dataState, { type: 'loading' }));
  }

  return translateToDashboardsResponse(dataState);
}

/**
 * @internal
 * Translates the data state to a dashboard models state.
 **/
export function translateToDashboardsResponse(dataState: DataState<DashboardModel[]>) {
  const { data, ...rest } = dataState;

  return {
    ...rest,
    dashboards: data,
  } as DashboardModelsState;
}
