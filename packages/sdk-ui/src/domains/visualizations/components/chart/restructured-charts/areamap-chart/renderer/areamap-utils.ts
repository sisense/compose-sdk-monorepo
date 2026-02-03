import { AreamapChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { getDataPointMetadata } from '@/domains/visualizations/core/chart-options-processor/data-points.js';
import { AreamapDataPoint } from '@/types';

import { GeoDataElement } from '../types.js';

export function getAreamapDataPoint(
  geoDataElement: GeoDataElement,
  dataOptions: AreamapChartDataOptionsInternal,
) {
  const entries = {} as NonNullable<AreamapDataPoint['entries']>;

  if (dataOptions.geo) {
    entries.geo = [
      {
        ...getDataPointMetadata(dataOptions.geo),
        value: geoDataElement.geoName,
      },
    ];
  }

  if (dataOptions.color) {
    entries.color = [
      {
        ...getDataPointMetadata(dataOptions.color),
        value: geoDataElement.originalValue,
      },
    ];
  }

  return {
    ...geoDataElement,
    entries,
  };
}
