import { useEffect, useReducer } from 'react';
import { useHasChanged } from '../../common/hooks/use-has-changed';
import { DataState, dataLoadStateReducer } from '../../common/hooks/data-load-state-reducer';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import { HookEnableParam } from '../../common/hooks/types';
import { TranslatableError } from '../../translation/translatable-error';
import { withTracking } from '../../decorators/hook-decorators';
import { WidgetModel } from './widget-model';
import { getWidgetModel } from './get-widget-model';
import { useShouldLoad } from '../../common/hooks/use-should-load';
import { useThemeContext } from '../../theme-provider';

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
 * React hook that retrieves an existing widget model from a Fusion Embed instance.
 *
 * ## Example
 *
 * Retrieve a widget model and use it to populate a `Chart` component
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=fusion-assets%2Fuse-get-widget-model&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * Additional `useGetWidgetModel` examples:
 *
 * - [Modify Chart Type](https://www.sisense.com/platform/compose-sdk/playground/?example=fusion-assets%2Fuse-get-widget-model-change-chart-type)
 *
 * @param params - Parameters of the widget to be retrieved
 * @returns Widget load state that contains the status of the execution, the result widget model, or the error if one has occurred
 * @group Fusion Embed
 * @fusionEmbed
 */
export const useGetWidgetModel = withTracking('useGetWidgetModel')(useGetWidgetModelInternal);

/**
 * {@link useGetWidgetModel} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useGetWidgetModelInternal(params: GetWidgetModelParams): WidgetModelState {
  const isParamsChanged = useHasChanged(params, ['dashboardOid', 'widgetOid']);
  const shouldLoad = useShouldLoad(params, isParamsChanged);
  const { themeSettings } = useThemeContext();
  const [dataState, dispatch] = useReducer(dataLoadStateReducer<WidgetModel>, {
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
        error: new TranslatableError('errors.sisenseContextNotFound'),
      });
    }
    if (shouldLoad(app)) {
      dispatch({ type: 'loading' });

      const { dashboardOid, widgetOid } = params;
      void getWidgetModel(app.httpClient, dashboardOid, widgetOid, themeSettings)
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
    return translateToWidgetResponse(dataLoadStateReducer(dataState, { type: 'loading' }));
  }

  return translateToWidgetResponse(dataState);
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
