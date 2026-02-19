import { type JaqlPanel, UserType } from '@sisense/sdk-pivot-query-client';
import { PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-ui';
import { InputStyles } from '@sisense/sdk-pivot-ui/dist/utils/types';

import { getColoringServiceByColorOptions } from '@/domains/visualizations/core/chart-data-options/coloring';
import { getInterpolatorFn } from '@/domains/visualizations/core/chart-data-options/coloring/range-coloring';
import type {
  PivotTableDataOptions,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types';
import { RangeDataColorOptions } from '@/domains/visualizations/core/chart-data/data-coloring';
import { scaleBrightness, toGray } from '@/shared/utils/color';
import { CompleteThemeSettings } from '@/types';

import { getPivotDataOptionByJaqlIndex } from '../utils';

const DEFAULT_MIN_COLOR = '#000000';
const DEFAULT_MAX_COLOR = '#ffffff';

export function createDataCellColorFormatter(
  dataOptions: PivotTableDataOptions,
  themeSettings: CompleteThemeSettings,
) {
  return (
    cell: PivotDataNode,
    rowItem: PivotTreeNode,
    columnItem: PivotTreeNode,
    jaqlPanelItem: JaqlPanel | undefined,
  ) => {
    const style: InputStyles = {};

    if (
      rowItem.userType === UserType.SUB_TOTAL ||
      rowItem.userType === UserType.GRAND_TOTAL ||
      columnItem.userType === UserType.SUB_TOTAL ||
      columnItem.userType === UserType.GRAND_TOTAL ||
      (columnItem.parent && columnItem.parent.userType === UserType.SUB_TOTAL) ||
      (columnItem.parent && columnItem.parent.userType === UserType.GRAND_TOTAL)
    ) {
      return;
    }

    const dataOption = getPivotDataOptionByJaqlIndex(dataOptions, jaqlPanelItem?.field?.index);
    const colorFormat = (dataOption as StyledMeasureColumn)?.color;
    const dataBarsColorFormat = (dataOption as StyledMeasureColumn)?.dataBarsColor;

    if (colorFormat) {
      const coloringService = getColoringServiceByColorOptions(colorFormat);

      if (coloringService.type === 'Static' || coloringService.type === 'Absolute') {
        const color = coloringService.getColor(cell.value);
        if (color) style.backgroundColor = color as string;
      } else if (coloringService.type === 'Relative') {
        const rangeColorOptions = colorFormat as RangeDataColorOptions;
        const [baseColor] = themeSettings.palette.variantColors;
        const minColor = baseColor ? scaleBrightness(baseColor, 0.2) : DEFAULT_MIN_COLOR;
        const maxColor = baseColor ? scaleBrightness(baseColor, -0.2) : DEFAULT_MAX_COLOR;

        const compileRangeArgs = {
          steps: rangeColorOptions.steps,
          min: rangeColorOptions.minColor,
          max: rangeColorOptions.maxColor,
          minDef: minColor,
          maxDef: maxColor,
          minGray: toGray(minColor),
          maxGray: toGray(maxColor),
        };

        cell.store = cell.store || {};
        cell.store.compileRange = ({ min, max, minvalue, midvalue, maxvalue }) =>
          getInterpolatorFn(
            min ?? '#000000',
            max ?? '#ffffff',
            minvalue ?? 0,
            midvalue ?? 0,
            maxvalue ?? 0,
          );
        cell.store.compileRangeContext = {};
        cell.store.compileRangeArgs = compileRangeArgs;
      }
    }

    if (dataBarsColorFormat) {
      const dataBarsColoringService = getColoringServiceByColorOptions(dataBarsColorFormat);
      if (
        dataBarsColoringService.type === 'Static' ||
        dataBarsColoringService.type === 'Absolute'
      ) {
        const color = dataBarsColoringService.getColor(cell.value);
        if (color) {
          style.databarColor = color as string;
        }
      }
    }

    if (Object.keys(style).length > 0) {
      cell.style = cell.style || {};
      Object.assign(cell.style, style);
    }
  };
}
