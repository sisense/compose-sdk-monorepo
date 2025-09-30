/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  getDataLabelsSettings,
  getPolarDataLabelsSettings,
  DataLabelsSettings,
} from './value-label-section';

const types = {
  count: false,
  relative: true,
  totals: true,
};

describe('getValueLabelSettings(), chart with vertical xAxis', () => {
  it('horizontal', () => {
    const valueLabelSettings: DataLabelsSettings = getDataLabelsSettings('vertical', {
      enabled: true,
      rotation: 0,
    });
    expect(valueLabelSettings).toEqual({
      align: 'left',
      enabled: true,
      types: types,
      verticalAlign: 'middle',
      rotation: 0,
    });
  });

  it('diagonal', () => {
    const valueLabelSettings: DataLabelsSettings = getDataLabelsSettings('vertical', {
      enabled: true,
      rotation: -45,
    });
    expect(valueLabelSettings).toEqual({
      align: 'center',
      enabled: true,
      rotation: -45,
      types: types,
      verticalAlign: 'middle',
    });
  });

  it('vertical', () => {
    const valueLabelSettings: DataLabelsSettings = getDataLabelsSettings('vertical', {
      enabled: true,
      rotation: -90,
    });
    expect(valueLabelSettings).toEqual({
      align: 'center',
      enabled: true,
      rotation: -90,
      types: types,
      verticalAlign: 'middle',
    });
  });
});

describe('getValueLabelSettings(), chart with horizontal xAxis', () => {
  it('horizontal', () => {
    const valueLabelSettings: DataLabelsSettings = getDataLabelsSettings('horizontal', {
      enabled: true,
      rotation: 0,
    });
    expect(valueLabelSettings).toEqual({
      align: 'center',
      enabled: true,
      padding: 5,
      types: types,
      verticalAlign: 'bottom',
      rotation: 0,
    });
  });
  it('diagonal', () => {
    const valueLabelSettings: DataLabelsSettings = getDataLabelsSettings('horizontal', {
      enabled: true,
      rotation: -45,
    });
    expect(valueLabelSettings).toEqual({
      align: 'left',
      enabled: true,
      rotation: -45,
      types: types,
      verticalAlign: 'middle',
      x: -2,
      y: -10,
    });
  });
  it('vertical', () => {
    const valueLabelSettings: DataLabelsSettings = getDataLabelsSettings('horizontal', {
      enabled: true,
      rotation: -90,
    });
    expect(valueLabelSettings).toEqual({
      align: 'left',
      enabled: true,
      rotation: -90,
      types: types,
      verticalAlign: 'middle',
      y: -10,
    });
  });
});

describe('when valueLabel is null', () => {
  it('should return enabled= false', () => {
    const valueLabelSettings: DataLabelsSettings = getDataLabelsSettings('horizontal');
    expect(valueLabelSettings).toEqual({
      enabled: false,
    });
  });
});

describe('getPolarValueLabelSettings()', () => {
  const expectedBaseSettings = {
    enabled: true,
    types: types,
    padding: 5,
    rotation: 0,
  };

  it('should return "horizontal" settings for "area" type polar', () => {
    const valueLabelSettings: DataLabelsSettings = getPolarDataLabelsSettings(
      { enabled: true, rotation: 0 },
      'area',
    );
    expect(valueLabelSettings).toEqual({
      ...expectedBaseSettings,
      align: 'center',
      verticalAlign: 'middle',
    });
  });

  it('should return "diagonal" settings for "line" type polar', () => {
    const valueLabelSettings: DataLabelsSettings = getPolarDataLabelsSettings(
      { enabled: true, rotation: -45 },
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
    const valueLabelSettings: DataLabelsSettings = getPolarDataLabelsSettings(
      { enabled: true, rotation: -90 },
      'column',
    );
    expect(valueLabelSettings).toEqual({
      ...expectedBaseSettings,
      align: 'left',
      verticalAlign: 'middle',
      rotation: -90,
    });
  });

  it('should return enabled=false when `valueLabel` is disabled', () => {
    const valueLabelSettings: DataLabelsSettings = getPolarDataLabelsSettings(
      { enabled: false },
      'column',
    );
    expect(valueLabelSettings).contain({
      enabled: false,
    });
  });
});
