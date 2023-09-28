/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Highcharts from '@sisense/sisense-charts';
import { useEffect, useRef, type FunctionComponent } from 'react';

// TODO: move this import once we decide where to do all our highcharts customizations
import '../highcharts-overrides';

export type HighchartsConstructorType = 'chart' | 'stockChart' | 'mapChart' | 'ganttChart';

interface Props {
  /**
   * String for constructor method. Official constructors:
   *  - 'chart' for Highcharts charts
   *  - 'stockChart' for Highstock charts
   *  - 'mapChart' for Highmaps charts
   *  - 'ganttChart' for Gantt charts
   */
  constructorType?: HighchartsConstructorType;

  /**
   * Used to pass the Highcharts instance after modules are initialized.
   * If not set the component will try to get the Highcharts from window.
   */
  highcharts?: typeof Highcharts;

  /**
   * Highcharts chart configuration object.
   * Please refer to the Highcharts (API documentation)[https://api.highcharts.com/highcharts/].
   */
  options: object;

  /**
   * This wrapper uses chart.update() method to apply new options
   * to the chart when changing the parent component.
   * This option allow us to turn off the updating.
   */
  allowChartUpdate?: boolean;

  /**
   * Boolean flag whether to reinitialize the chart on prop update (as opposed to chart.update())
   * useful in some cases but slower than a regular update.
   */
  immutable?: boolean;

  /**
   * Array of update()'s function optional arguments.
   * Parameters should be defined in the same order like in
   * native Highcharts function: [redraw, oneToOne, animation].
   * (Here)[https://api.highcharts.com/class-reference/Highcharts.Chart#update] is a more specific description of the parameters.
   */
  updateArgs?: [boolean, boolean, boolean];
}

/**
 * @internal
 */
export const HighchartsWrapper: FunctionComponent<Props> = ({
  constructorType = 'chart',
  highcharts = Highcharts,
  allowChartUpdate = true,
  immutable = false,
  updateArgs = [true, true, true],
  options,
}) => {
  const chartRef = useRef<any>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const chartContainerDefaultStyles = {
    // Container should inherit parent size for correct chart size calculation by Highcharts
    height: '100%',
    width: '100%',
  };

  function createChart() {
    const H = highcharts;

    if (!H) {
      console.warn('The "highcharts" property was not passed.');
    } else if (!H[constructorType]) {
      console.warn(
        'The "constructorType" property is incorrect or some ' + 'required module is not imported.',
      );
    } else if (!options) {
      console.warn('The "options" property was not passed.');
    } else if (!chartContainerRef.current) {
      console.warn('The ref to the div containing the chart is not initialized yet.');
    } else {
      // Create a chart
      chartRef.current = H[constructorType](chartContainerRef.current, options);
      const chartOptions = options as any;
      // if there are no on click handlers, allow parent to capture events
      if (
        !chartOptions?.plotOptions?.series?.point?.events?.click &&
        !chartOptions?.plotOptions?.series?.point?.events?.contextmenu
      ) {
        chartRef.current.container.onclick = null;
      }
    }
  }

  useEffect(() => {
    if (!chartRef.current) {
      createChart();
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (allowChartUpdate && !isFirstRender.current) {
      if (immutable || !chartRef.current) {
        createChart();
      } else {
        chartRef.current.update(options, ...(updateArgs || [true, true]));
      }
    }

    isFirstRender.current = false;
  }, [allowChartUpdate, immutable, options]);

  return <div style={chartContainerDefaultStyles} ref={chartContainerRef}></div>;
};
