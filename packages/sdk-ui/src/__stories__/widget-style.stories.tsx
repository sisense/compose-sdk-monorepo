import { DataSource } from '@sisense/sdk-data';
import { Meta } from '@storybook/react';
import { SisenseContextProviderProps } from '../index';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider';
import { ChartStyleOptions } from '../types';
import { ChartWidget } from '../widgets/chart-widget';
import { templateForComponent } from './template';

const sisenseContextProps: SisenseContextProviderProps = {
  url: import.meta.env.VITE_APP_SISENSE_URL ?? '',
  token: import.meta.env.VITE_APP_SISENSE_TOKEN,
  showRuntimeErrors: true,
  appConfig: { errorBoundaryConfig: { alwaysShowErrorText: true } },
};

const template = templateForComponent(ChartWidget);

const meta: Meta<typeof ChartWidget> = {
  title: 'Widget/Style',
  component: ChartWidget,
  argTypes: {
    chartType: { options: ['line', 'area', 'column', 'bar'] },
  },
  decorators: [
    (Story) => (
      <SisenseContextProvider {...sisenseContextProps}>
        <Story />
      </SisenseContextProvider>
    ),
  ],
};
export default meta;

const cat1 = {
  name: 'Years',
  type: 'date',
};

const meas1 = {
  column: { name: 'Quantity', aggregation: 'sum' },
  showOnRightAxis: false,
};

const chartStyleOptions: ChartStyleOptions = {
  legend: {
    enabled: false,
  },
  xAxis: {
    enabled: true,
    gridLines: true,
    isIntervalEnabled: false,
    labels: {
      enabled: true,
    },
    logarithmic: false,
    title: {
      enabled: false,
    },
  },
  yAxis: {
    enabled: true,
    gridLines: true,
    isIntervalEnabled: false,
    labels: {
      enabled: true,
    },
    logarithmic: false,
    title: {
      enabled: false,
    },
  },
};

const dataSet = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['2009', 'A', 6781, 10],
    ['2010', 'A', 4471, 70],
    ['2011', 'B', 1812, 50],
    ['2012', 'B', 5001, 60],
    ['2013', 'A', 2045, 40],
    ['2014', 'B', 3010, 90],
    ['2015', 'A', 5447, 80],
    ['2016', 'B', 4242, 70],
    ['2017', 'B', 936, 20],
  ],
};

const cartesianArgs = {
  chartType: 'line' as const,
  dataSource: dataSet as unknown as DataSource,
  dataOptions: {
    category: [cat1],
    value: [meas1],
    breakBy: [],
  },
};

export const WithoutHeader = template({
  title: 'Widget Without Header',
  ...cartesianArgs,
  styleOptions: {
    ...chartStyleOptions,
    header: {
      hidden: true,
    },
  },
});

export const WithBorder = template({
  title: 'Widget With Border',
  ...cartesianArgs,
  styleOptions: {
    ...chartStyleOptions,
    border: true,
    borderColor: 'lightgray',
    header: {
      dividerLine: true,
      dividerLineColor: 'lightgray',
    },
  },
});

export const WithRoundedCorners = template({
  ...cartesianArgs,
  title: 'Widget With Rounded Corners',
  styleOptions: {
    ...chartStyleOptions,
    border: true,
    borderColor: 'lightgray',
    cornerRadius: 'Medium',
    header: {
      dividerLine: true,
      dividerLineColor: 'lightgray',
    },
  },
});

export const WithShadow = template({
  title: 'Widget With Shadow',
  ...cartesianArgs,
  styleOptions: {
    ...chartStyleOptions,
    border: true,
    borderColor: 'lightgray',
    spaceAround: 'Large',
    shadow: 'Dark',
    header: {
      dividerLine: true,
      dividerLineColor: 'lightgray',
    },
  },
});

export const WithCustomBackground = template({
  title: 'Widget With Custom Background',
  ...cartesianArgs,
  styleOptions: {
    ...chartStyleOptions,
    backgroundColor: 'beige',
    header: {
      backgroundColor: 'bisque',
    },
  },
});

export const WithCustomizedHeader = template({
  title: 'Widget With Customized Header',
  ...cartesianArgs,
  styleOptions: {
    ...chartStyleOptions,
    header: {
      titleAlignment: 'Center',
      backgroundColor: 'bisque',
      titleTextColor: 'chocolate',
    },
  },
});

export const WithCustomToolbar = template({
  title: 'Widget With Customized Header and Custom Toolbar',
  ...cartesianArgs,
  styleOptions: {
    ...chartStyleOptions,
    header: {
      titleAlignment: 'Center',
      backgroundColor: 'bisque',
      titleTextColor: 'chocolate',
      renderToolbar: (onRefresh) => (
        <>
          <button onClick={onRefresh}>Refresh</button>
          <button>Other Button</button>
        </>
      ),
    },
  },
});
