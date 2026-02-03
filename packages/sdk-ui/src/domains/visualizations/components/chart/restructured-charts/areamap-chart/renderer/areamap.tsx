import { useMemo } from 'react';
import { useCallback } from 'react';

import { ChartRendererProps } from '@/domains/visualizations/components/chart/types.js';
import { getPaletteColor } from '@/domains/visualizations/core/chart-data-options/coloring/utils.js';
import {
  AreamapChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import { getDataOptionTitle } from '@/domains/visualizations/core/chart-data-options/utils.js';
import { ChartData } from '@/domains/visualizations/core/chart-data/types.js';
import { DesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { AreamapDataPointEventHandler } from '@/props.js';

import { AreamapChartDesignOptions, AreamapData, GeoDataElement } from '../types.js';
import { AreamapMap } from './areamap-map.js';
import { getAreamapDataPoint } from './areamap-utils.js';
import { useGeoJson } from './use-geo-json.js';

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
            originalValueTitle: dataOptions.color ? getDataOptionTitle(dataOptions.color) : '',
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
