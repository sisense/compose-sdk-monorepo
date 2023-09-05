/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CartesianChartDataOptionsInternal } from '../../chart-data-options/types';
import {
  getValueLabelSettings,
  getPolarValueLabelSettings,
  ValueLabelSettings,
} from './value_label_section';

const chartDataOption: CartesianChartDataOptionsInternal = {
  x: [],
  y: [],
  breakBy: [],
};

const types = {
  count: false,
  relative: true,
  totals: true,
};

describe('getValueLabelSettings(), chart with vertical xAxis', () => {
  it('horizontal', () => {
    const valueLabelSettings: ValueLabelSettings = getValueLabelSettings(
      'vertical',
      'horizontal',
      chartDataOption,
    );
    expect(valueLabelSettings).toEqual({
      align: 'left',
      enabled: true,
      formatter: expect.any(Function),
      types: types,
      verticalAlign: 'middle',
      rotation: 0,
    });
  });

  it('diagonal', () => {
    const valueLabelSettings: ValueLabelSettings = getValueLabelSettings(
      'vertical',
      'diagonal',
      chartDataOption,
    );
    expect(valueLabelSettings).toEqual({
      align: 'center',
      enabled: true,
      formatter: expect.any(Function),
      rotation: -45,
      types: types,
      verticalAlign: 'middle',
    });
  });

  it('vertical', () => {
    const valueLabelSettings: ValueLabelSettings = getValueLabelSettings(
      'vertical',
      'vertical',
      chartDataOption,
    );
    expect(valueLabelSettings).toEqual({
      align: 'center',
      enabled: true,
      formatter: expect.any(Function),
      rotation: -90,
      types: types,
      verticalAlign: 'middle',
    });
  });
});

describe('getValueLabelSettings(), chart with horizontal xAxis', () => {
  it('horizontal', () => {
    const valueLabelSettings: ValueLabelSettings = getValueLabelSettings(
      'horizontal',
      'horizontal',
      chartDataOption,
    );
    expect(valueLabelSettings).toEqual({
      align: 'center',
      enabled: true,
      formatter: expect.any(Function),
      padding: 5,
      types: types,
      verticalAlign: 'bottom',
      rotation: 0,
    });
  });
  it('diagonal', () => {
    const valueLabelSettings: ValueLabelSettings = getValueLabelSettings(
      'horizontal',
      'diagonal',
      chartDataOption,
    );
    expect(valueLabelSettings).toEqual({
      align: 'left',
      enabled: true,
      formatter: expect.any(Function),
      rotation: -45,
      types: types,
      verticalAlign: 'middle',
      x: -2,
      y: -10,
    });
  });
  it('vertical', () => {
    const valueLabelSettings: ValueLabelSettings = getValueLabelSettings(
      'horizontal',
      'vertical',
      chartDataOption,
    );
    expect(valueLabelSettings).toEqual({
      align: 'left',
      enabled: true,
      formatter: expect.any(Function),
      rotation: -90,
      types: types,
      verticalAlign: 'middle',
      y: -10,
    });
  });
});

describe('when valueLabel is null', () => {
  it('should return enabled= false', () => {
    const valueLabelSettings: ValueLabelSettings = getValueLabelSettings(
      'horizontal',
      null,
      chartDataOption,
    );
    expect(valueLabelSettings).toEqual({
      enabled: false,
    });
  });
});

describe('getPolarValueLabelSettings()', () => {
  const expectedBaseSettings = {
    enabled: true,
    types: types,
    formatter: expect.any(Function),
    padding: 5,
    rotation: 0,
  };

  it('should return "horizontal" settings for "area" type polar', () => {
    const valueLabelSettings: ValueLabelSettings = getPolarValueLabelSettings(
      'horizontal',
      chartDataOption,
      'area',
    );
    expect(valueLabelSettings).toEqual({
      ...expectedBaseSettings,
      align: 'center',
      verticalAlign: 'middle',
    });
  });

  it('should return "diagonal" settings for "line" type polar', () => {
    const valueLabelSettings: ValueLabelSettings = getPolarValueLabelSettings(
      'diagonal',
      chartDataOption,
      'line',
    );
    expect(valueLabelSettings).toEqual({
      ...expectedBaseSettings,
      align: 'center',
      verticalAlign: 'bottom',
      rotation: -45,
    });
  });

  it('should return "vertical" settings for "column" type polar', () => {
    const valueLabelSettings: ValueLabelSettings = getPolarValueLabelSettings(
      'vertical',
      chartDataOption,
      'column',
    );
    expect(valueLabelSettings).toEqual({
      ...expectedBaseSettings,
      align: 'left',
      verticalAlign: 'middle',
      rotation: -90,
    });
  });
});
