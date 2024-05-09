import {
  AreamapChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../../chart-data-options/types.js';
import { AreamapData, ChartData } from '../../../chart-data/types.js';
import { AreamapChartDesignOptions } from '../../../chart-options-processor/translations/design-options.js';
import { DesignOptions } from '../../../chart-options-processor/translations/types.js';
import { ThemeSettings } from '../../../types.js';
import { AreamapMap } from './areamap-map.js';
import { useGeoJson } from './use-geo-json.js';
import { AreamapDataPointEventHandler } from '../../../props';

export type AreamapProps = {
  chartData: AreamapData;
  dataOptions: AreamapChartDataOptionsInternal;
  designOptions: AreamapChartDesignOptions;
  themeSettings: ThemeSettings;
  onDataPointClick?: AreamapDataPointEventHandler;
};

export const Areamap: React.FC<AreamapProps> = ({
  chartData,
  dataOptions,
  designOptions,
  onDataPointClick,
}) => {
  const { geoJson } = useGeoJson(designOptions.mapType);
  return (
    <>
      {geoJson && (
        <AreamapMap
          geoJson={geoJson}
          geoData={chartData.geoData}
          dataOptions={{
            originalValueTitle: dataOptions.color.title || dataOptions.color.name,
            onAreaClick: onDataPointClick,
          }}
          mapType={designOptions.mapType}
        />
      )}
    </>
  );
};

const isAreamapData = (chartData: ChartData): chartData is AreamapData => {
  return chartData.type === 'areamap';
};

const isAreamapDataOptions = (
  dataOptions: ChartDataOptionsInternal,
): dataOptions is AreamapChartDataOptionsInternal => {
  return 'geo' in dataOptions && 'color' in dataOptions;
};

const isAreamapChartDesignOptions = (
  designOptions: DesignOptions,
): designOptions is AreamapChartDesignOptions => {
  return 'mapType' in designOptions;
};

export const isAreamapProps = (props: AreamapProps) =>
  isAreamapData(props.chartData) &&
  isAreamapDataOptions(props.dataOptions) &&
  isAreamapChartDesignOptions(props.designOptions);
