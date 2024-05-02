import { isIndicator, isTable, TableType } from '../chart-options-processor/translations/types';
import { ChartType } from '../types';

export const DEFAULT_PIVOT_TABLE_SIZE = {
  width: 400,
  height: 500,
};

export const getChartDefaultSize = (chartType: ChartType | TableType) => {
  if (isTable(chartType)) {
    return {
      width: 400,
      height: 500,
    };
  } else if (isIndicator(chartType)) {
    return {
      width: 200,
      height: 200,
    };
  } else {
    return {
      width: 400,
      height: 400,
    };
  }
};

type WidgetSizeOptions = {
  hasHeader?: boolean;
};

const WIDGET_HEADER_DEFAULT_HEIGHT = 25;

export const getWidgetDefaultSize = (
  type: ChartType | TableType | 'pivot',
  { hasHeader }: WidgetSizeOptions = {},
) => {
  const size = type === 'pivot' ? DEFAULT_PIVOT_TABLE_SIZE : getChartDefaultSize(type);

  if (hasHeader) {
    size.height = size.height + WIDGET_HEADER_DEFAULT_HEIGHT;
  }

  return size;
};
