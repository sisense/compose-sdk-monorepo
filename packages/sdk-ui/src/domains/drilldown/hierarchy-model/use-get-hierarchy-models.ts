import { useEffect, useReducer } from 'react';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { withTracking } from '@/infra/decorators/hook-decorators/index';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { dataLoadStateReducer, DataState } from '@/shared/hooks/data-load-state-reducer';
import { HookEnableParam } from '@/shared/hooks/types';
import { useHasChanged } from '@/shared/hooks/use-has-changed';
import { useShouldLoad } from '@/shared/hooks/use-should-load';

import { getHierarchyModels, GetHierarchyModelsOptions } from './get-hierarchy-models';
import { HierarchyModel } from './hierarchy-model';

/**
 * Parameters for {@link useGetHierarchyModels} hook.
 */
export interface GetHierarchyModelsParams extends GetHierarchyModelsOptions, HookEnableParam {}

/**
 * States of hierarchy models load.
 */
export type HierarchyModelsState =
  | HierarchyModelsLoadingState
  | HierarchyModelsErrorState
  | HierarchyModelsSuccessState;

/**
 * State of hierarchy models that is loading.
 */
export type HierarchyModelsLoadingState = {
  /** Whether the hierarchy models is loading */
  isLoading: true;
  /** Whether the hierarchy models load has failed */
  isError: false;
  /** Whether the hierarchy models load has succeeded */
  isSuccess: false;
  /** Error, if one occurred */
  error: undefined;
  /** Hierarchy models, if the load succeeded */
  hierarchies: HierarchyModel[] | undefined;
  /** Loading status */
  status: 'loading';
};

/**
 * State of a hierarchy models load that has failed.
 */
export type HierarchyModelsErrorState = {
  /** Whether the hierarchy models is loading */
  isLoading: false;
  /** Whether the hierarchy models load has failed */
  isError: true;
  /** Whether the hierarchy models load has succeeded */
  isSuccess: false;
  /** Error, if one occurred */
  error: Error;
  /** Hierarchy models, if the load succeeded */
  hierarchies: undefined;
  /** Loading status */
  status: 'error';
};

/**
 * State of a hierarchy models load that has succeeded.
 */
export type HierarchyModelsSuccessState = {
  /** Whether the hierarchy models is loading */
  isLoading: false;
  /** Whether the hierarchy models load has failed */
  isError: false;
  /** Whether the hierarchy models load has succeeded */
  isSuccess: true;
  /** Error, if one occurred */
  error: undefined;
  /** Hierarchy models, if the load succeeded */
  hierarchies: HierarchyModel[];
  /** Loading status */
  status: 'success';
};

/**
 * React hook that retrieves existing hierarchy models from a Fusion instance.
 *
 * @example
 * Retrieve the hierarchy models and render their counts.
 ```tsx
  const { hierarchies, isLoading, isError } = useGetHierarchyModels({
    dataSource: DM.DataSource,
    dimension: DM.Commerce.AgeRange,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (hierarchies) {
    return <div>{`Total Hierarchies: ${hierarchies.length}`}</div>;
  }
  return null;
 ```
 * @returns Load state that contains the status of the execution, the result hierarchy models, or the error if one has occurred
 * @group Fusion Assets
 * @fusionEmbed
 */
export const useGetHierarchyModels = withTracking('useGetHierarchyModels')(
  useGetHierarchyModelsInternal,
);

/**
 * {@link useGetHierarchyModels} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the hierarchies to be retrieved
 * @internal
 */
export function useGetHierarchyModelsInternal(
  params: GetHierarchyModelsParams,
): HierarchyModelsState {
  const isParamsChanged = useHasChanged(params, [
    'dataSource',
    'dimension',
    'ids',
    'alwaysIncluded',
  ]);
  const shouldLoad = useShouldLoad(params, isParamsChanged);
  const [dataState, dispatch] = useReducer(dataLoadStateReducer<HierarchyModel[]>, {
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

      getHierarchyModels(app.httpClient, params, app.defaultDataSource)
        .then((hierarchies) => {
          dispatch({ type: 'success', data: hierarchies });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [app, isInitialized, params, shouldLoad]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (dataState.data && isParamsChanged) {
    return translateToHierarchiesResponse(dataLoadStateReducer(dataState, { type: 'loading' }));
  }

  return translateToHierarchiesResponse(dataState);
}

/**
 * Translates the reducer's data state to the public hierarchy models state.
 */
function translateToHierarchiesResponse(
  dataState: DataState<HierarchyModel[]>,
): HierarchyModelsState {
  const { data, ...rest } = dataState;
  return {
    ...rest,
    hierarchies: data,
  } as HierarchyModelsState;
}
