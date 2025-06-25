import {
  ChartDataOptionsInternal,
  IndicatorChartDataOptionsInternal,
} from './chart-data-options/types';
import { useEffect, useRef, type FunctionComponent, type MouseEvent } from 'react';
import { IndicatorChartData } from './chart-data/types';
import {
  GaugeSpecificDesignOptions,
  IndicatorChartDesignOptions,
} from './chart-options-processor/translations/design-options';
import { Indicator } from './charts/indicator/chart/indicator';
import {
  createLegacyChartDataOptions,
  IndicatorLegacyChartDataOptions,
} from './charts/indicator/indicator-legacy-chart-data-options';
import { createIndicatorLegacyChartOptions } from './charts/indicator/indicator-legacy-chart-options';
import { ChartData } from './chart-data/types';
import { DesignOptions } from './chart-options-processor/translations/types';
import { ChartRendererProps } from './chart/types';
import { useThemeContext } from './theme-provider';
import {
  applyIndicatorRenderOptions,
  IndicatorRenderOptions,
  buildRenderOptionsFromLegacyOptions,
} from './charts/indicator/indicator-render-options';
import { IndicatorDataPoint, DataPointEntry } from './types';
import { getDataPointMetadata } from './chart-options-processor/data-points';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from './chart-options-processor/translations/number-format-config';
import { IndicatorDataPointEventHandler } from './props';

export type IndicatorLegacyChartOptions = ReturnType<typeof createIndicatorLegacyChartOptions>;

type IndicatorOnBeforeRender = (options: IndicatorRenderOptions) => IndicatorRenderOptions;
export interface IndicatorCanvasProps {
  chartData: IndicatorChartData;
  dataOptions: IndicatorChartDataOptionsInternal;
  designOptions: IndicatorChartDesignOptions;
  onBeforeRender?: IndicatorOnBeforeRender;
  onDataPointClick?: IndicatorDataPointEventHandler;
}

const defaultOnBeforeRender: IndicatorOnBeforeRender = (options) => options;

// Helper function to create an IndicatorDataPoint
const createIndicatorDataPoint = (
  chartData: IndicatorChartData,
  dataOptions: IndicatorChartDataOptionsInternal,
): IndicatorDataPoint => {
  const entries: NonNullable<IndicatorDataPoint['entries']> = {};

  // Helper function to create display value
  const createDisplayValue = (value: number | undefined, dataOption: any) => {
    if (value === undefined) return undefined;
    const formatConfig = getCompleteNumberFormatConfig(dataOption);
    return applyFormatPlainText(formatConfig, value);
  };

  // Create entries for each available data option
  if (dataOptions.value && dataOptions.value.length > 0) {
    entries.value = {
      ...getDataPointMetadata('value', dataOptions.value[0]),
      value: chartData.value ?? 0,
      displayValue: createDisplayValue(chartData.value, dataOptions.value[0]),
    } as DataPointEntry;
  }

  if (
    dataOptions.secondary &&
    dataOptions.secondary.length > 0 &&
    chartData.secondary !== undefined
  ) {
    entries.secondary = {
      ...getDataPointMetadata('secondary', dataOptions.secondary[0]),
      value: chartData.secondary,
      displayValue: createDisplayValue(chartData.secondary, dataOptions.secondary[0]),
    } as DataPointEntry;
  }

  if (dataOptions.min && dataOptions.min.length > 0 && chartData.min !== undefined) {
    entries.min = {
      ...getDataPointMetadata('min', dataOptions.min[0]),
      value: chartData.min,
      displayValue: createDisplayValue(chartData.min, dataOptions.min[0]),
    } as DataPointEntry;
  }

  if (dataOptions.max && dataOptions.max.length > 0 && chartData.max !== undefined) {
    entries.max = {
      ...getDataPointMetadata('max', dataOptions.max[0]),
      value: chartData.max,
      displayValue: createDisplayValue(chartData.max, dataOptions.max[0]),
    } as DataPointEntry;
  }

  return { entries };
};

/**
 * @internal
 */
export const IndicatorCanvas: FunctionComponent<IndicatorCanvasProps> = ({
  chartData,
  dataOptions,
  designOptions,
  onBeforeRender = defaultOnBeforeRender,
  onDataPointClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { themeSettings } = useThemeContext();

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) {
      return;
    }
    const indicator = new Indicator();
    const legacyDataOptions: IndicatorLegacyChartDataOptions = createLegacyChartDataOptions(
      chartData,
      designOptions,
      dataOptions,
    );
    const legacyChartOptions = createIndicatorLegacyChartOptions(
      {
        type: designOptions.indicatorType,
        numericSubtype:
          'numericSubtype' in designOptions ? designOptions.numericSubtype : undefined,
        forceTickerView: designOptions.forceTickerView,
        tickerBarHeight: (designOptions as GaugeSpecificDesignOptions).tickerBarHeight,
      },
      {
        chartData,
        dataOptions,
        themeSettings,
      },
    );

    // convert legacy options to render options, apply 'onBeforeRender' and convert back to legacy options
    const renderOptions = buildRenderOptionsFromLegacyOptions(
      legacyDataOptions,
      legacyChartOptions,
    );
    const customizedRenderOptions = onBeforeRender(renderOptions);
    const {
      legacyDataOptions: customizedLegacyDataOptions,
      legacyChartOptions: customizedLegacyChartOptions,
    } = applyIndicatorRenderOptions(customizedRenderOptions, legacyDataOptions, legacyChartOptions);

    indicator.render(
      canvasRef.current,
      customizedLegacyDataOptions,
      customizedLegacyChartOptions,
      containerRef.current,
    );
  }, [chartData, dataOptions, designOptions, themeSettings, onBeforeRender]);

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (onDataPointClick) {
      const point = createIndicatorDataPoint(chartData, dataOptions);
      onDataPointClick(point, event.nativeEvent);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        backgroundColor: themeSettings?.chart?.backgroundColor,
        cursor: onDataPointClick ? 'pointer' : 'default',
      }}
      aria-label="indicator-root"
      onClick={handleContainerClick}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

const isIndicatorChartData = (chartData: ChartData): chartData is IndicatorChartData => {
  return chartData.type === 'indicator';
};

const isIndicatorChartDataOptionsInternal = (
  dataOptions: ChartDataOptionsInternal,
): dataOptions is IndicatorChartDataOptionsInternal => {
  return 'min' in dataOptions;
};

const isIndicatorDesignOptions = (
  designOptions: DesignOptions,
): designOptions is IndicatorChartDesignOptions => {
  return 'indicatorComponents' in designOptions;
};

export const isIndicatorCanvasProps = (props: ChartRendererProps): props is IndicatorCanvasProps =>
  !!props.chartData &&
  isIndicatorChartData(props.chartData) &&
  isIndicatorChartDataOptionsInternal(props.dataOptions) &&
  isIndicatorDesignOptions(props.designOptions);
