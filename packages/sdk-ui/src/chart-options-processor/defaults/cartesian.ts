/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines */
import { AxisSettings } from '../translations/axis-section';
import { DeepPick } from 'ts-essentials';
import { Style, HighchartsOptionsInternal, Stacking } from '../chart-options-service';
import { ChartType } from '../../types';
import merge from 'deepmerge';
import { PolarType } from '../translations/design-options';
import { getLegendSettings } from '../translations/legend-section';

export const lineColorDefault = '#d1d1d7';
const titleMargin = 25;
const autoRotation = [-10, -20, -30, -40, -50, -60, -70, -80, -90];

export const fontStyleDefault: Style = {
  fontFamily: 'Open Sans',
  fontSize: '13px',
  fontWeight: 'normal',
  color: '#5b6372',
  textOutline: 'none',
  pointerEvents: 'none',
};

export const stackTotalFontStyleDefault: Style = {
  color: '#56535b',
  fontFamily: 'Open Sans',
  fontSize: '13px',
  textOverflow: 'ellipsis',
  pointerEvents: 'none',
  textOutline: 'none',
  fontWeight: 'bold',
};

export const xAxisDefaults: AxisSettings = {
  labels: {
    overflow: 'none',
    enabled: true,
    autoRotation,
    style: fontStyleDefault,
  },
  tickmarkPlacement: 'on',
  title: {
    text: '',
    enabled: false,
    margin: titleMargin,
    style: fontStyleDefault,
  },
  gridLineDashStyle: 'Dot',
  minorGridLineWidth: 0,
  startOnTick: false,
  endOnTick: false,
  lineColor: lineColorDefault,
  lineWidth: 1,
  tickColor: lineColorDefault,
  minorTickColor: lineColorDefault,
  gridLineColor: lineColorDefault,
  minorGridLineColor: lineColorDefault,
};

export const yAxisDefaults: AxisSettings = {
  labels: {
    autoRotation,
    style: fontStyleDefault,
  },
  tickmarkPlacement: 'on',
  startOnTick: true,
  endOnTick: true,
  title: {
    text: '',
    margin: titleMargin,
    enabled: false,
    style: fontStyleDefault,
  },
  gridLineWidth: 1,
  minorTickWidth: 0,
  tickWidth: 0,
  minorGridLineWidth: 0,
  gridLineDashStyle: 'Dot',
  lineColor: lineColorDefault,
  lineWidth: 1,
  tickColor: lineColorDefault,
  minorTickColor: lineColorDefault,
  gridLineColor: lineColorDefault,
  minorGridLineColor: lineColorDefault,
  minorGridLineDashStyle: 'Dot',
  stackLabels: {
    style: stackTotalFontStyleDefault,
    crop: true,
    allowOverlap: false,
    enabled: false,
    rotation: 0,
    labelrank: 99999,
  },
  showLastLabel: true,
};

export const chartOptionsDefaults = (
  chartType: ChartType,
  polarType?: PolarType,
  stacking?: Stacking,
): HighchartsOptionsInternal => {
  switch (chartType) {
    case 'line':
      return cartesianDefaults;
    case 'area':
      return merge(cartesianDefaults, areaDefaults(stacking));
    case 'bar':
      return merge(cartesianDefaults, barDefaults(stacking));
    case 'column':
      return merge(cartesianDefaults, columnDefaults(stacking));
    case 'polar':
      return merge(
        cartesianDefaults,
        polarDefaults(polarType) as Partial<HighchartsOptionsInternal>,
      );
    default:
      return cartesianDefaults;
  }
};

export const cartesianDefaults: HighchartsOptionsInternal = {
  chart: {
    type: 'line',
    spacing: [],
    alignTicks: false,
    polar: false,
  },
  legend: getLegendSettings(null),
  credits: {
    enabled: false,
  },
  exporting: {
    enabled: true,
  },
  plotOptions: {
    series: {
      dataLabels: {
        enabled: false,
        crop: false,
        style: {
          ...fontStyleDefault,
          textOutline: 'none',
        },
      },
      stickyTracking: false,
      states: {
        select: {
          color: null, // Explicitly set to null in order to inherit from series color
          opacity: 0.3,
          borderColor: 'transparent',
        },
      },
    },
  },
  xAxis: [],
  yAxis: [],
  series: [],
  boost: {
    useGPUTranslations: true,
    usePreAllocated: true,
  },
};

export const areaDefaults = (stacking?: Stacking) => ({
  plotOptions: {
    area: {
      ...(stacking && {
        lineColor: '#ffffff',
      }),
    },
    series: {
      ...(stacking && {
        stacking,
      }),
    },
  },
});

export const columnDefaults = (stacking?: Stacking) => ({
  plotOptions: {
    column: {
      groupPadding: 0.1,
      pointPadding: 0.01,
      ...(stacking && { borderWidth: 0 }),
    },
    series: {
      ...(stacking && { stacking }),
    },
  },
});

export const barDefaults = (stacking?: Stacking) => ({
  plotOptions: {
    bar: {
      groupPadding: 0.1,
      pointPadding: 0.01,
      ...(stacking && { borderWidth: 0 }),
    },
    series: {
      ...(stacking && { stacking }),
    },
  },
});

function polarDefaults(polarType?: PolarType): DeepPick<
  HighchartsOptionsInternal,
  {
    plotOptions: { series: { stacking: true; fillOpacity: true } };
  }
> {
  return {
    plotOptions: {
      series: {
        ...(polarType !== 'line' && { stacking: 'normal' }),
        fillOpacity: 1,
      },
    },
  };
}
