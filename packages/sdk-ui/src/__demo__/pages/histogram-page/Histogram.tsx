import { useMemo } from 'react';
import type { Attribute, DataSource, Filter } from '@sisense/sdk-data';
import { useBuildQuery } from './histogram/useBuildQuery';
import { FREQUENCY, useProcessResults } from './histogram/useProcessResults';
import { HistogramChart } from './HistogramChart';
import { useBuildMinMaxQuery } from './histogram/useBuildMinMaxQuery';
import { useExecuteQuery } from '@/query-execution/use-execute-query';
import { LoadingOverlay } from '@/common/components/loading-overlay';
import { useThemeContext } from '@/theme-provider';
import { BaseAxisStyleOptions, BaseStyleOptions, ValueToColorMap } from '@/types';

export interface HistogramStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  binCount?: number | 'auto';
  barBorder?: boolean;
  binSizePrecision?: number;
  subtype?: 'stacked' | 'overlay';
}

export interface HistogramDataOptions {
  value: Attribute;
  category: Attribute[];
  seriesToColorMap?: ValueToColorMap;
}

export type HistogramProps = {
  dataSource?: DataSource;
  dataOptions: HistogramDataOptions;
  filters?: Filter[];
  styleOptions?: HistogramStyleOptions;
};

export const Histogram = ({ dataSource, dataOptions, filters, styleOptions }: HistogramProps) => {
  const { themeSettings } = useThemeContext();

  // Widget plug-in buildQuery: get min max count per category
  const minMaxQueryProps = useBuildMinMaxQuery({ dataSource, dataOptions, filters });

  const {
    data: minMaxData,
    isLoading: isMinMaxLoading,
    error: isMinMaxError,
  } = useExecuteQuery(minMaxQueryProps);

  // Widget plug-in buildQuery: get bin frequrency data per bin and cateogry
  const frequencyDataQueryProps = useBuildQuery({
    dataSource,
    minMaxData,
    dataOptions,
    filters,
    styleOptions,
  });

  const { data: binData, isLoading, error } = useExecuteQuery(frequencyDataQueryProps);

  // Widget plug-in processResults: create histogram frequency data
  const histogramData = useProcessResults({ binData, dataOptions });

  // Widget plug-in render: render chart with histogram data
  const histogramChartDataOptions = useMemo(
    () => ({
      bins: dataOptions.value,
      fequency: { name: FREQUENCY },
      breakBy: dataOptions.category,
      seriesToColorMap: dataOptions.seriesToColorMap,
    }),
    [dataOptions.value, dataOptions.seriesToColorMap, dataOptions.category],
  );

  if (isMinMaxError) return <div>{`${isMinMaxError}`}</div>;
  if (error) return <div>{`${error}`}</div>;
  const panelBackgroundColor = themeSettings?.chart.panelBackgroundColor
    ? themeSettings.chart.panelBackgroundColor
    : 'white';
  return (
    <div
      style={{
        marginTop: '50px',
        top: '0',
        bottom: '0',
        right: '0',
        left: '0',
        position: 'absolute',
      }}
    >
      <LoadingOverlay themeSettings={themeSettings} isVisible={isMinMaxLoading || isLoading}>
        {binData && (
          <HistogramChart
            dataSet={histogramData}
            dataOptions={histogramChartDataOptions}
            styleOptions={styleOptions}
          />
        )}
        {!binData && (
          <div
            style={{
              margin: '20px',
              marginTop: '0px',
              top: '0',
              bottom: '0',
              right: '0',
              left: '0',
              position: 'absolute',
              backgroundColor: `${panelBackgroundColor}`,
            }}
          ></div>
        )}
      </LoadingOverlay>
    </div>
  );
};
