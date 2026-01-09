/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { SoftUnion, WidgetProps as WidgetPropsPreact } from '@sisense/sdk-ui-preact';

import type { WidgetProps } from '../components/widgets';
import {
  Arguments,
  ChartDataPointClickEvent,
  ChartDataPointContextMenuEvent,
  ChartDataPointsEvent,
  WidgetDataPointClickEvent,
  WidgetDataPointClickEventHandler,
  WidgetDataPointContextMenuEvent,
} from '../types';

type SoftWidgetPropsPreact = SoftUnion<WidgetPropsPreact>;

export function translateToPreactWidgetProps(widgetProps: WidgetProps): WidgetPropsPreact {
  const {
    beforeRender,
    dataReady,
    beforeMenuOpen,
    dataPointClick,
    dataPointContextMenu,
    dataPointsSelect,
    ...commonWidgetProps
  } = widgetProps;
  return {
    ...commonWidgetProps,
    onBeforeRender: beforeRender,
    onDataReady: dataReady,
    onBeforeMenuOpen: beforeMenuOpen,
    onDataPointClick: dataPointClick
      ? (...[point, nativeEvent]: Arguments<SoftWidgetPropsPreact['onDataPointClick']>) =>
          (dataPointClick as WidgetDataPointClickEventHandler)({
            point,
            nativeEvent,
          } as WidgetDataPointClickEvent)
      : undefined,
    onDataPointContextMenu: dataPointContextMenu
      ? (...[point, nativeEvent]: Arguments<SoftWidgetPropsPreact['onDataPointContextMenu']>) =>
          (dataPointContextMenu as WidgetDataPointClickEventHandler)({
            point,
            nativeEvent,
          } as WidgetDataPointContextMenuEvent)
      : undefined,
    onDataPointsSelected: dataPointsSelect
      ? (...[points, nativeEvent]: Arguments<SoftWidgetPropsPreact['onDataPointsSelected']>) =>
          dataPointsSelect({ points, nativeEvent } as ChartDataPointsEvent)
      : undefined,
  } as WidgetPropsPreact;
}

export function translateFromPreactWidgetProps(widgetProps: WidgetPropsPreact): WidgetProps {
  const {
    onBeforeRender,
    onDataReady,
    onBeforeMenuOpen,
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
    ...commonWidgetProps
  } = widgetProps as SoftWidgetPropsPreact;
  return {
    ...commonWidgetProps,
    beforeRender: onBeforeRender,
    dataReady: onDataReady,
    beforeMenuOpen: onBeforeMenuOpen,
    dataPointClick: onDataPointClick
      ? ({ point, nativeEvent }: ChartDataPointClickEvent) =>
          onDataPointClick(point as any, nativeEvent as any)
      : undefined,
    dataPointContextMenu: onDataPointContextMenu
      ? ({ point, nativeEvent }: ChartDataPointContextMenuEvent) =>
          onDataPointContextMenu(point as any, nativeEvent as any)
      : undefined,
    dataPointsSelect: onDataPointsSelected
      ? ({ points, nativeEvent }: ChartDataPointsEvent) =>
          onDataPointsSelected(points as any, nativeEvent as any)
      : undefined,
  } as WidgetProps;
}
