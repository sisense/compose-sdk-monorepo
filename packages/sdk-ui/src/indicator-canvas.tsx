import {
  ChartDataOptionsInternal,
  IndicatorChartDataOptionsInternal,
} from './chart-data-options/types';
import { useEffect, useRef, type FunctionComponent } from 'react';
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

export interface IndicatorCanvasProps {
  chartData: IndicatorChartData;
  dataOptions: IndicatorChartDataOptionsInternal;
  designOptions: IndicatorChartDesignOptions;
}

/**
 * @internal
 */
export const IndicatorCanvas: FunctionComponent<IndicatorCanvasProps> = ({
  chartData,
  dataOptions,
  designOptions,
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
    indicator.render(
      canvasRef.current,
      legacyDataOptions,
      legacyChartOptions,
      containerRef.current,
    );
  }, [chartData, dataOptions, designOptions, themeSettings]);

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
      }}
      aria-label="indicator-root"
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
