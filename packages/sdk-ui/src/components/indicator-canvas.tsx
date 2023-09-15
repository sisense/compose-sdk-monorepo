import {
  ChartDataOptionsInternal,
  IndicatorDataOptionsInternal,
} from '../chart-data-options/types';
import { useEffect, useRef, type FunctionComponent } from 'react';
import { IndicatorChartData } from '../chart-data/types';
import { IndicatorChartDesignOptions } from '../chart-options-processor/translations/design-options';
import { Indicator } from '../charts/indicator/chart/indicator';
import {
  createLegacyChartDataOptions,
  IndicatorLegacyChartDataOptions,
} from '../charts/indicator/indicator-legacy-chart-data-options';
import { createIndicatorLegacyChartOptions } from '../charts/indicator/indicator-legacy-chart-options';
import { ChartData } from '../chart-data/types';
import { ChartDesignOptions } from '../chart-options-processor/translations/types';
import { ThemeSettings } from '../types';

interface Props {
  chartData: IndicatorChartData;
  dataOptions: IndicatorDataOptionsInternal;
  designOptions: IndicatorChartDesignOptions;
  themeSettings?: ThemeSettings;
}

/**
 * @internal
 */
export const IndicatorCanvas: FunctionComponent<Props> = ({
  chartData,
  dataOptions,
  designOptions,
  themeSettings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      }}
      aria-label="indicator-root"
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export const isIndicatorChartData = (chartData: ChartData): chartData is IndicatorChartData => {
  return chartData.type === 'indicator';
};

export const isIndicatorDataOptionsInternal = (
  dataOptions: ChartDataOptionsInternal,
): dataOptions is IndicatorDataOptionsInternal => {
  return 'min' in dataOptions;
};

export const isIndicatorDesignOptions = (
  designOptions: ChartDesignOptions,
): designOptions is IndicatorChartDesignOptions => {
  return 'indicatorComponents' in designOptions;
};
