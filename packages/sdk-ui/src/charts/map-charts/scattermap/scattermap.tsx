import { ScattermapDataPointEventHandler } from '../../../props.js';

import { ScattermapChartDataOptionsInternal } from '../../../chart-data-options/types.js';
import { ScattermapChartDesignOptions } from '../../../chart-options-processor/translations/design-options.js';

import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import '../map-charts.scss';
import './scattermap.scss';
import { ScattermapChartData } from '@/chart-data/types.js';

export type ScattermapProps = {
  chartData: ScattermapChartData;
  dataOptions: ScattermapChartDataOptionsInternal;
  designOptions: ScattermapChartDesignOptions;
  dataSource: DataSource | null;
  filters?: Filter[] | FilterRelations;
  onDataPointClick?: ScattermapDataPointEventHandler;
};

// eslint-disable-next-line no-unused-vars
export const Scattermap = ({
  // eslint-disable-next-line no-unused-vars
  chartData,
  // eslint-disable-next-line no-unused-vars
  dataOptions,
  // eslint-disable-next-line no-unused-vars
  dataSource,
  // eslint-disable-next-line no-unused-vars
  filters = [],
  // eslint-disable-next-line no-unused-vars
  designOptions,
  // eslint-disable-next-line no-unused-vars
  onDataPointClick,
}: ScattermapProps) => {
  return <></>;
};
