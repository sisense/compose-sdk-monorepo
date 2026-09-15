import { useEffect, useReducer } from 'react';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider/index';
import { withTracking } from '@/infra/decorators/hook-decorators/index';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { dataLoadStateReducer, DataState } from '@/shared/hooks/data-load-state-reducer';
import { HookEnableParam } from '@/shared/hooks/types';
import { useHasChanged } from '@/shared/hooks/use-has-changed';
import { useShouldLoad } from '@/shared/hooks/use-should-load';

import { getWidgetModel } from './get-widget-model';
import { WidgetModel } from './widget-model';

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
 * React hook that retrieves an existing widget model from a Fusion instance.
 *
 * **Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * @example
 * Retrieve a widget model and use it to populate a `ChartWidget` component.
 *
 * ```tsx
 * import { ChartWidget, useGetWidgetModel, widgetModelTranslator } from '@sisense/sdk-ui';
 *
 * const CodeExample = () => {
 *   const { widget } = useGetWidgetModel({
 *     dashboardOid: '65a82171719e7f004018691c',
 *     widgetOid: '65a82171719e7f004018691f',
 *   });
 *
 *   const widgetProps = widget ? widgetModelTranslator.toChartWidgetProps(widget) : null;
 *
 *   return (
 *     <>
 *       {widgetProps && (
 *         <ChartWidget
 *           chartType={widgetProps.chartType}
 *           title={widgetProps.title}
 *           description={widgetProps.description}
 *           dataSource={widgetProps.dataSource}
 *           dataOptions={widgetProps.dataOptions}
 *           styleOptions={widgetProps.styleOptions}
 *           filters={widgetProps.filters}
 *           highlights={widgetProps.highlights}
 *           drilldownOptions={widgetProps.drilldownOptions}
 *         />
 *       )}
 *     </>
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://use-get-widget-model-example-1.png" width="700px" />
 *
 * Retrieve a widget model and let the user switch its chart type at runtime:
 *
 * ```tsx
 * import Button from '@mui/material/Button';
 * import ButtonGroup from '@mui/material/ButtonGroup';
 * import { Chart, ChartProps, ChartType, useGetWidgetModel, widgetModelTranslator } from '@sisense/sdk-ui';
 * import { useState } from 'react';
 *
 * const CHART_TYPES: readonly ChartType[] = ['pie', 'line', 'area', 'bar', 'column', 'polar', 'funnel', 'treemap', 'sunburst'];
 *
 * const CodeExample = () => {
 *   const { widget } = useGetWidgetModel({
 *     dashboardOid: '65a82171719e7f004018691c',
 *     widgetOid: '65a82171719e7f004018691f',
 *   });
 *
 *   const [chartProps, setChartProps] = useState<ChartProps>();
 *
 *   if (widget && !chartProps) setChartProps(widgetModelTranslator.toChartProps(widget));
 *
 *   const changeChartType = (value: ChartType) => {
 *     if (value && chartProps) {
 *       setChartProps({
 *         ...chartProps,
 *         chartType: value,
 *         dataOptions: {
 *           // Fusion widget may not have all required data options.
 *           ...{ category: [], value: [], breakBy: [] },
 *           ...chartProps.dataOptions,
 *         },
 *         styleOptions: {
 *           ...chartProps.styleOptions,
 *           // Changing chart type may invalidate the chart subtype.
 *           subtype: undefined,
 *         },
 *       });
 *     }
 *   };
 *
 *   return (
 *     <>
 *       {chartProps && (
 *         <>
 *           <ButtonGroup variant="outlined" size="small" color="primary">
 *             {CHART_TYPES.map((chartType) => (
 *               <Button
 *                 key={chartType}
 *                 size="small"
 *                 variant={chartType === chartProps.chartType ? 'contained' : 'outlined'}
 *                 onClick={() => changeChartType(chartType)}
 *               >
 *                 {chartType}
 *               </Button>
 *             ))}
 *           </ButtonGroup>
 *           <Chart
 *             chartType={chartProps.chartType}
 *             dataSet={chartProps.dataSet}
 *             dataOptions={chartProps.dataOptions}
 *             filters={chartProps.filters}
 *             highlights={chartProps.highlights}
 *             styleOptions={chartProps.styleOptions}
 *           />
 *         </>
 *       )}
 *     </>
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://use-get-widget-model-example-2.png" width="700px" />
 *
 * @returns Widget load state that contains the status of the execution, the result widget model, or the error if one has occurred
 * @group Fusion Assets
 * @fusionEmbed
 */
export const useGetWidgetModel = withTracking('useGetWidgetModel')(useGetWidgetModelInternal);

/**
 * {@link useGetWidgetModel} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the widget to be retrieved
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
        error: new TranslatableError('errors.noSisenseContext'),
      });
    }
    if (shouldLoad(app)) {
      dispatch({ type: 'loading' });

      const { dashboardOid, widgetOid } = params;
      void getWidgetModel(app.httpClient, dashboardOid, widgetOid, themeSettings, app.settings)
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
