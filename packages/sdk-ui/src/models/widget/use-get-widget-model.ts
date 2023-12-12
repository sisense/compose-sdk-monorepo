import { isEqual } from 'lodash';
import { useEffect, useReducer, useState } from 'react';
import { usePrevious } from '../../common/hooks/use-previous';
import { DataState, dataLoadStateReducer } from '../../common/hooks/data-load-state-reducer';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import { HookEnableParam } from '../../common/hooks/types';
import { TranslatableError } from '../../translation/translatable-error';
import { withTracking } from '../../decorators/hook-decorators';
import { WidgetModel } from './widget-model';
import { getWidgetModel } from './get-widget-model';

/**
 * Parameters for {@link useGetWidgetModel} hook.
 */
export interface GetWidgetModelParams extends HookEnableParam {
  /**
   * Identifier of the dashboard that contains the widget
   */
  dashboardOid: string;
  /**
   * Identifier of the widget to be retrieved
   */
  widgetOid: string;
}

/**
 * States of a widget model load.
 */
export type WidgetModelState =
  | WidgetModelLoadingState
  | WidgetModelErrorState
  | WidgetModelSuccessState;

/**
 * State of a widget model that is loading.
 */
export type WidgetModelLoadingState = {
  /** Whether the widget model is loading */
  isLoading: true;
  /** Whether the widget model load has failed */
  isError: false;
  /** Whether the widget model load has succeeded */
  isSuccess: false;
  /** Error, if one occurred */
  error: undefined;
  /** Widget model, if the load succeeded */
  widget: WidgetModel | undefined;
  /** Loading status */
  status: 'loading';
};

/**
 * State of a widget model load that has failed.
 */
export type WidgetModelErrorState = {
  /** Whether the widget model is loading */
  isLoading: false;
  /** Whether the widget model load has failed */
  isError: true;
  /** Whether the widget model load has succeeded */
  isSuccess: false;
  /** Error, if one occurred */
  error: Error;
  /** Widget model, if the load succeeded */
  widget: undefined;
  /** Loading status */
  status: 'error';
};

/**
 * State of a widget model load that has succeeded.
 */
export type WidgetModelSuccessState = {
  /** Whether the widget model is loading */
  isLoading: false;
  /** Whether the widget model load has failed */
  isError: false;
  /** Whether the widget model load has succeeded */
  isSuccess: true;
  /** Error, if one occurred */
  error: undefined;
  /** Widget model, if the load succeeded */
  widget: WidgetModel;
  /** Loading status */
  status: 'success';
};

/**
 * React hook that retrieves an existing widget model from the Sisense instance.
 *
 * @example
 * An example of retrieving an existing widget model from the Sisense instance:
 ```tsx
  const { widget, isLoading, isError } = useGetWidgetModel({
    dashboardOid: '6448665edac1920034bce7a8',
    widgetOid: '6448665edac1920034bce7a8',
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (widget) {
    return (
      <Chart {...widget.getChartProps()} />
    );
  }
  return null;
 ```
 * @param params - Parameters of the widget to be retrieved
 * @returns Widget load state that contains the status of the execution, the result widget model, or the error if one has occurred
 */
export const useGetWidgetModel = withTracking('useGetWidgetModel')(useGetWidgetModelInternal);

/**
 * {@link useGetWidgetModel} without tracking to be used inside other hooks or components in Compose SDK.
 * @internal
 */
export function useGetWidgetModelInternal(params: GetWidgetModelParams): WidgetModelState {
  const prevParams = usePrevious(params);
  const [dataState, dispatch] = useReducer(dataLoadStateReducer<WidgetModel>, {
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

      const { dashboardOid, widgetOid } = params;
      void getWidgetModel(app.httpClient, dashboardOid, widgetOid)
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
    return translateToWidgetResponse(dataLoadStateReducer(dataState, { type: 'loading' }));
  }

  return translateToWidgetResponse(dataState);
}

/**
 * Checks if the parameters have changed by deep comparison.
 *
 * @param prevParams - Previous query parameters
 * @param newParams - New query parameters
 */
function isParamsChanged(
  prevParams: GetWidgetModelParams | undefined,
  newParams: GetWidgetModelParams,
): boolean {
  if (!prevParams && newParams) {
    return true;
  }

  const simplySerializableParamNames: (keyof GetWidgetModelParams)[] = [
    'dashboardOid',
    'widgetOid',
  ];
  return simplySerializableParamNames.some(
    (paramName) => !isEqual(prevParams?.[paramName], newParams[paramName]),
  );
}

/**
 * Translates the reducer's data state to the public widget model state.
 */
function translateToWidgetResponse(dataState: DataState<WidgetModel>): WidgetModelState {
  const { data, ...rest } = dataState;
  return {
    ...rest,
    widget: data,
  } as WidgetModelState;
}
