import { getDataPointMetadata } from '@/chart-options-processor/data-points';
import { AreamapChartDataOptionsInternal, AreamapDataPoint, GeoDataElement } from '@/index';

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
