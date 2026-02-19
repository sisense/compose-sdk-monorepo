/* eslint-disable sonarjs/no-identical-functions */
import type {
  ChartWidgetProps as ChartWidgetPropsPreact,
  PivotTableWidgetProps as PivotTableWidgetPropsPreact,
  SoftUnion,
  TextWidgetProps as TextWidgetPropsPreact,
  WidgetProps as WidgetPropsPreact,
} from '@sisense/sdk-ui-preact';

import type {
  ChartWidgetProps,
  PivotTableWidgetProps,
  TextWidgetProps,
  WidgetProps,
} from '../components/widgets';
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

export function toPreactWidgetProps(angularProps: WidgetProps): WidgetPropsPreact {
  const {
    beforeRender,
    dataReady,
    beforeMenuOpen,
    dataPointClick,
    dataPointContextMenu,
    dataPointsSelect,
    ...commonWidgetProps
  } = angularProps;
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

export function toWidgetProps(preactProps: WidgetPropsPreact): WidgetProps {
  const {
    onBeforeRender,
    onDataReady,
    onBeforeMenuOpen,
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
    ...commonWidgetProps
  } = preactProps as SoftWidgetPropsPreact;
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

export function toChartWidgetProps(preactProps: ChartWidgetPropsPreact): ChartWidgetProps {
  const { onBeforeRender, onDataReady, ...rest } = preactProps;

  return {
    ...rest,
    beforeRender: onBeforeRender,
    dataReady: onDataReady,
  };
}

export function toPivotTableWidgetProps(
  preactProps: PivotTableWidgetPropsPreact,
): PivotTableWidgetProps {
  const { ...rest } = preactProps;

  return {
    ...rest,
  };
}

export function toTextWidgetProps(preactProps: TextWidgetPropsPreact): TextWidgetProps {
  const { ...rest } = preactProps;

  return {
    ...rest,
  };
}
