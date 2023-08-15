/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { useMemo } from 'react';
import { QueryResultData } from '@sisense/sdk-data';
import React from 'react';
import { getColumnIndexMap } from './WaferMapGallery';
import { LineChart } from '@sisense/sdk-ui';
import { produce } from 'immer';
import { HighchartsOptions } from '@sisense/sdk-ui/dist/chart-options-processor/chart_options_service';

export const CustomChart = ({ options }: { options: HighchartsOptions }) => {
  const data = {
    columns: [{name: 'foo', type: 'string'}],
    rows: [['bar']],
  };
  const cartesianArgs = {
    dataSet: data,
    dataOptions: {
      category: [{name: 'foo', type: 'string'}],
      value: [],
      breakBy: [],
    },
    styleOptions: {},
    onBeforeRender: (optionsBase: any) =>
      JSON.parse(JSON.stringify({ ...optionsBase, ...options })),
  };
  return <LineChart {...cartesianArgs} />;
};

// Create Wafermap Data Object and populate all values
export const processResult = (queryResult: QueryResultData): WaferBinData => {
  const columnIndexMap = getColumnIndexMap(queryResult);

  const xValues = queryResult.rows.map((row) => row[columnIndexMap.X_COORD].data);
  const yValues = queryResult.rows.map((row) => row[columnIndexMap.Y_COORD].data);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const xCoords: number[] = [];
  const yCoords: string[] = [];
  for (let i = xMin; i <= xMax; i++) {
    xCoords.push(i);
  }
  for (let i = yMin; i <= yMax; i++) {
    yCoords.push(i.toString());
  }
  const data = queryResult.rows
    .filter((row) => row.length >= 3)
    .map((row) => [
      row[columnIndexMap.X_COORD].data - xMin,
      row[columnIndexMap.Y_COORD].data - yMin,
      row[columnIndexMap.BIN_NUMBER].data,
    ]);
  return { xMin, yMin, xMax, yMax, xCoords, yCoords, data };
};

export type WaferBinData = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xCoords: number[];
  yCoords: string[];
  data: number[][];
};

const minColor = 0;
const maxColor = 1;
const circleX = 18;
const circleY = 21.5;
const circleR = 19;

interface Props {
  title?: string;
  waferBinData: WaferBinData;
  onClick?: () => void;
  height?: number;
  width?: number;
}

const wafOutline = (chart: any) => {
  const thisChart = globalThis as any;
  if (thisChart.circle && thisChart.circle?.element) {
    thisChart.circle?.element?.parentNode?.removeChild(thisChart.circle.element);
  }

  const pixelX = chart.xAxis[0].toPixels(circleX);
  const pixelY = chart.yAxis[0].toPixels(circleY);
  const pixelR = chart.xAxis[0].toPixels(circleR) - chart.xAxis[0].toPixels(0);

  thisChart.circle = chart.renderer.circle(pixelX, pixelY, pixelR).attr({
    fill: 'transparent',
    stroke: 'black',
    'stroke-width': 1,
  });
};

const baseBinWaferMapChartOptions: any = {
  renderTo: '',
  chart: {
    type: 'heatmap',
    renderTo: 'container',
    marginTop: 40,
    marginBottom: 10,
    events: {
      load: function () {
        wafOutline(this);
      },
      redraw: function () {
        wafOutline(this);
      },
    },
  },
  plotOptions: {
    heatmap: {
      shadow: false,
      animation: false,
      nullColor: '#A8A8A8',
      dataLabels: {
        enabled: false,
        style: {
          fontSize: '6px',
          fontWeight: 'normal',
        },
      },
    },
  },
  title: {
    text: 'Bin Wafer Map',
    style: {
      fontSize: '14px',
      fontWeight: 'normal',
    },
  },

  xAxis: {
    categories: [],
    title: {
      enabled: false,
      text: 'X',
    },
    labels: {
      enabled: false,
    },
    gridLineWidth: 0,
    tickInterval: 1,
    minorTickLength: 0,
    tickLength: 0,
    width: 0,
    height: 0,
    visible: true,
  },

  yAxis: {
    categories: [],
    title: {
      enabled: false,
      text: 'Y',
    },
    labels: {
      enabled: false,
    },
    gridLineWidth: 0,
    max: 0,
    width: 0,
    height: 0,
    visible: true,
  },
  colorAxis: {
    stops: [
      [1, '#00FF00'], // PASS
      [2, '#A3FD86'],
      [3, '#54B989'],
      [4, '#610F59'],
      [5, '#8F8436'],
      [6, '#6C57A0'],
      [7, '#23F4D8'],
      [8, '#157441'],
      [9, '#A8F6FA'],
      [10, '#42415E'],
      [11, '#B4CF17'],
      [12, '#0A2C38'],
      [13, '#D56E47'],
      [14, '#9A9A09'],
      [15, '#08FA69'],
      [16, '#1562A3'],
      [17, '#EBEB98'],
      [18, '#7119C9'],
      [19, '#427631'],
      [20, '#962C31'],
      [21, '#DB7242'],
      [22, '#C15251'],
      [23, '#1E1AF9'],
      [24, '#4B4A08'],
      [25, '#56DDE5'],
      [26, '#FFFF00'],
    ],
    min: minColor,
    max: maxColor,
    startOnTick: false,
    endOnTick: false,
    reversed: false,
    labels: {
      formatter: function () {
        const thisPoint = this as any;
        return 'Bin ' + thisPoint.value;
      },
    },
  },

  legend: {
    align: 'right',
    layout: 'vertical',
    marginTop: 0,
    verticalAlign: 'top',
    y: 40,
    symbolHeight: 100,
    enabled: false,
  },

  tooltip: {
    enabled: true,
    formatter: function () {
      const thisChart = this as any;

      return (
        '<b>' +
        thisChart.series.xAxis.categories[thisChart.point.x] +
        ':' +
        thisChart.series.yAxis.categories[thisChart.point.y] +
        '</b><br>Bin: ' +
        thisChart.point.value
      );
    },
  },
  series: [
    {
      dataLabels: {
        enabled: false,
      },
      name: 'Stacked Yield',
      borderWidth: 0,
      data: [],
    },
  ],
};

export const BinWaferMap = React.memo(
  ({ title, waferBinData, onClick, height = 260, width = 250 }: Props) => {
    const highchartsOptions = useMemo(() => {
      const fudge = 0;
      let smallerSide = (height - 40 > width - 80 ? width - 80 : height - 40) - fudge;
      return produce(
        baseBinWaferMapChartOptions,
        (draftOptions: {
          series: any[];
          xAxis: { categories: number[]; visible: boolean; width: number; height: number };
          yAxis: {
            categories: string[];
            max: number;
            visible: boolean;
            width: number;
            height: number;
          };
          title: { text: string; style: { fontSize: string } };
          chart: { marginTop: number; height: number; width: number };
          legend: { enabled: boolean; symbolHeight: number; y: number };
          tooltip: { enabled: boolean };
        }) => {
          draftOptions.series = [{ ...draftOptions.series[0], data: [...waferBinData.data] }];
          draftOptions.xAxis.categories = waferBinData.xCoords;
          draftOptions.yAxis.categories = waferBinData.yCoords;
          draftOptions.yAxis.max = waferBinData.yCoords.length - 1;
          if (title) {
            draftOptions.title.text = title;
          }

          if (smallerSide < 225) {
            smallerSide = height - 20 > width - 20 ? width - 20 : height - 20;
            draftOptions.chart.marginTop = 30;
            draftOptions.title.style.fontSize = '9px';
            draftOptions.legend.enabled = false;
            draftOptions.xAxis.visible = false;
            draftOptions.yAxis.visible = false;
            draftOptions.tooltip.enabled = false;
          } else {
            const titleHeight = 40;
            const legendPadding = 18;
            draftOptions.chart.marginTop = titleHeight;
            draftOptions.legend.symbolHeight = smallerSide * 0.8;
            draftOptions.legend.y = titleHeight + smallerSide * 0.1 - legendPadding;
            draftOptions.legend.enabled = false;
            draftOptions.title.style.fontSize = '14px';
            draftOptions.xAxis.visible = false;
            draftOptions.yAxis.visible = false;
            draftOptions.tooltip.enabled = true;
          }
          draftOptions.xAxis.width = smallerSide;
          draftOptions.xAxis.height = smallerSide;
          draftOptions.yAxis.width = smallerSide;
          draftOptions.yAxis.height = smallerSide;
          draftOptions.chart.height = height;
          draftOptions.chart.width = width;
        },
      );
    }, [height, title, waferBinData, width]);

    return (
      <div
        onClick={() => {
          if (onClick) onClick();
        }}
        style={{
          height: `${height}px`,
          width: `${width}px`,
        }}
      >
        <CustomChart options={highchartsOptions as HighchartsOptions} />
      </div>
    );
  },
);
