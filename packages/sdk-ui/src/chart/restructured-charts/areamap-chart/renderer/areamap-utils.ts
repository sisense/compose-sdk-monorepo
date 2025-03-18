import { AreamapChartDataOptionsInternal } from '@/chart-data-options/types';
import { getDataPointMetadata } from '@/chart-options-processor/data-points';
import { AreamapDataPoint } from '@/types';
import { GeoDataElement } from '../types';

export function getAreamapDataPoint(
  geoDataElement: GeoDataElement,
  dataOptions: AreamapChartDataOptionsInternal,
) {
  const entries = {} as NonNullable<AreamapDataPoint['entries']>;

  if (dataOptions.geo) {
    entries.geo = [
      {
        ...getDataPointMetadata(`geo.0`, dataOptions.geo),
        value: geoDataElement.geoName,
      },
    ];
  }

  if (dataOptions.color) {
    entries.color = [
      {
        ...getDataPointMetadata(`color.0`, dataOptions.color),
        value: geoDataElement.originalValue,
      },
    ];
  }

  return {
    ...geoDataElement,
    entries,
  };
}
