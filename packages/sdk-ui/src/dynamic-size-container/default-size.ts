import { isIndicator, isTable, TableType } from '../chart-options-processor/translations/types';
import { ChartType } from '../types';

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
  chartType: ChartType | TableType,
  { hasHeader }: WidgetSizeOptions = {},
) => {
  const size = getChartDefaultSize(chartType);

  if (hasHeader) {
    size.height = size.height + WIDGET_HEADER_DEFAULT_HEIGHT;
  }

  return size;
};
