import {
  AreamapChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '@/chart-data-options/types.js';
import { ChartData } from '@/chart-data/types.js';
import { DesignOptions } from '@/chart-options-processor/translations/types.js';
import { AreamapMap } from './areamap-map.js';
import { useGeoJson } from './use-geo-json.js';
import { AreamapDataPointEventHandler } from '@/props.js';
import { ChartRendererProps } from '@/chart/types.js';
import { useThemeContext } from '@/theme-provider';
import { useMemo } from 'react';
import { getPaletteColor } from '@/chart-data-options/coloring/utils';
import { useCallback } from 'react';
import { getAreamapDataPoint } from './areamap-utils.js';
import { AreamapChartDesignOptions, AreamapData, GeoDataElement } from '../types.js';

export type AreamapProps = {
  chartData: AreamapData;
  dataOptions: AreamapChartDataOptionsInternal;
  designOptions: AreamapChartDesignOptions;
  onDataPointClick?: AreamapDataPointEventHandler;
};

export const Areamap: React.FC<AreamapProps> = ({
  chartData,
  dataOptions,
  designOptions,
  onDataPointClick,
}) => {
  const { themeSettings } = useThemeContext();
  const { geoJson } = useGeoJson(designOptions.mapType);

  const geoData = useMemo(() => {
    if (!dataOptions.color) {
      return chartData.geoData.map((dataItem) => ({
        ...dataItem,
        color: getPaletteColor(themeSettings.palette.variantColors, 0),
      }));
    }
    return chartData.geoData;
  }, [chartData.geoData, dataOptions, themeSettings]);

  const onAreaClickHandler = useCallback(
    (geoDataElement: GeoDataElement, event: MouseEvent) => {
      if (!onDataPointClick) {
        return;
      }
      const areamapDataPoint = getAreamapDataPoint(geoDataElement, dataOptions);
      onDataPointClick(areamapDataPoint, event);
    },
    [dataOptions, onDataPointClick],
  );

  return (
    <>
      {geoJson && (
        <AreamapMap
          geoJson={geoJson}
          geoData={geoData}
          dataOptions={{
            originalValueTitle:
              dataOptions.color?.column.title || dataOptions.color?.column.name || '',
            onAreaClick: onAreaClickHandler,
          }}
          mapType={designOptions.mapType}
        />
      )}
    </>
  );
};

export const isAreamapData = (chartData: ChartData): chartData is AreamapData => {
  return chartData.type === 'areamap' && 'geoData' in chartData;
};

const isAreamapDataOptions = (
  dataOptions: ChartDataOptionsInternal,
): dataOptions is AreamapChartDataOptionsInternal => {
  return 'geo' in dataOptions;
};

const isAreamapChartDesignOptions = (
  designOptions: DesignOptions,
): designOptions is AreamapChartDesignOptions => {
  return 'mapType' in designOptions;
};

export const isAreamapProps = (props: ChartRendererProps): props is AreamapProps =>
  !!props.chartData &&
  isAreamapData(props.chartData) &&
  isAreamapDataOptions(props.dataOptions) &&
  isAreamapChartDesignOptions(props.designOptions);
