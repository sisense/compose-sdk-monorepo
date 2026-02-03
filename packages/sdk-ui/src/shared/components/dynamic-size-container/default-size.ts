import { DEFAULT_WIDGET_HEADER_HEIGHT } from '@/domains/widgets/constants';

import {
  isIndicator,
  isTable,
  TableType,
} from '../../../domains/visualizations/core/chart-options-processor/translations/types';
import { ChartType } from '../../../types';

export const DEFAULT_PIVOT_TABLE_SIZE = {
  width: 400,
  height: 500,
} as const;

const DEFAULT_CHART_SIZE = {
  width: 400,
  height: 400,
} as const;

const DEFAULT_TABLE_SIZE = {
  width: 400,
  height: 500,
} as const;

const DEFAULT_INDICATOR_SIZE = {
  width: 200,
  height: 200,
} as const;

export const getChartDefaultSize = (chartType: ChartType | TableType) => {
  if (isTable(chartType)) {
    return DEFAULT_TABLE_SIZE;
  } else if (isIndicator(chartType)) {
    return DEFAULT_INDICATOR_SIZE;
  }
  return DEFAULT_CHART_SIZE;
};

type WidgetSizeOptions = {
  hasHeader?: boolean;
};

export const getWidgetDefaultSize = (
  type: ChartType | TableType | 'pivot',
  { hasHeader }: WidgetSizeOptions = {},
) => {
  const size = type === 'pivot' ? DEFAULT_PIVOT_TABLE_SIZE : getChartDefaultSize(type);

  if (hasHeader) {
    return {
      width: size.width,
      height: size.height + DEFAULT_WIDGET_HEADER_HEIGHT,
    };
  }

  return size;
};
