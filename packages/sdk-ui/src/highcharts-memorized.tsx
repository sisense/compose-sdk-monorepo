import { memo, useCallback } from 'react';
import Highcharts from '@sisense/sisense-charts';
import HighchartsReact from 'highcharts-react-official';
import { HighchartsEventOptions } from './chart-options-processor/apply-event-handlers';
import {
  HighchartsOptionsInternal,
  HighchartsOptions,
} from './chart-options-processor/chart-options-service';

// TODO: move this import once we decide where to do all our highcharts customizations
import './highcharts-overrides';

export const HighchartsReactMemoized = memo(
  ({
    options,
    immutable,
  }: {
    options: HighchartsOptionsInternal;
    immutable: boolean | null | undefined;
  }) => {
    const onChartCreated = useCallback(
      (chart: Highcharts.Chart) => {
        const chartOptions = options as HighchartsOptions & HighchartsEventOptions;
        // if there are no on click handlers, allow parent to capture events
        if (
          !chartOptions?.plotOptions?.series?.point?.events?.click &&
          !chartOptions?.plotOptions?.series?.point?.events?.contextmenu
        ) {
          chart.container.onclick = null;
        }
      },
      [options],
    );

    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        containerProps={{
          style: {
            // Container should inherit parent size for correct chart size calculation by Highcharts
            height: '100%',
            width: '100%',
          },
        }}
        immutable={immutable}
        callback={onChartCreated}
      />
    );
  },
);
