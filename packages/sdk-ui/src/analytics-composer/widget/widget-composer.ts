import { WidgetProps } from '@/props.js';
import {
  ExpandedQueryModel,
  WidgetCodeParams,
  WidgetPropsConfig,
  isByIdWidgetCodeParams,
} from '../types.js';
import { toWidgetCodeById, toWidgetCodeClientSide } from './to-widget-code.js';
import { toWidgetPropsFromQuery } from './to-widget-props.js';

/**
 * Converts query model to widget props.
 * @param queryModel - Expanded query model
 * @returns Widget props
 */
export const toWidgetProps = (
  queryModel: ExpandedQueryModel,
  config?: WidgetPropsConfig,
): WidgetProps | undefined => {
  return toWidgetPropsFromQuery(queryModel, config);
};

/**
 * Converts widget props to CSDK code.
 *
 * @param widgetCodeParams - Widget code params
 * @returns CSDK code string
 */
export const toWidgetCode = (widgetCodeParams: WidgetCodeParams): string => {
  if (isByIdWidgetCodeParams(widgetCodeParams)) {
    return toWidgetCodeById(widgetCodeParams);
  } else {
    return toWidgetCodeClientSide(widgetCodeParams);
  }
};
