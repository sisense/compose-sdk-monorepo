import { DEFAULT_WIDGET_HEADER_HEIGHT } from '@/domains/widgets/constants';

import {
  isIndicator,
  isTable,
  TableType,
} from '../../../domains/visualizations/core/chart-options-processor/translations/types';
import { ChartType } from '../../../types';
import {
  DEFAULT_CHART_SIZE,
  DEFAULT_INDICATOR_SIZE,
  DEFAULT_PIVOT_TABLE_SIZE,
  DEFAULT_TABLE_SIZE,
} from './default-sizes';

export { DEFAULT_PIVOT_TABLE_SIZE };

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
