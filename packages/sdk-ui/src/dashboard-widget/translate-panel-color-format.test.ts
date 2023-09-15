import { CompleteThemeSettings } from '../types';
import { createValueColorOptions, createValueToColorMap } from './translate-panel-color-format';
import {
  PanelColorFormat,
  PanelColorFormatConditional,
  PanelColorFormatRange,
  PanelColorFormatSingle,
} from './types';

describe('createValueColorOptions', () => {
  const themeSettings = { palette: { variantColors: ['#00cee6'] } } as CompleteThemeSettings;

  it('should return undefined when format is not provided', () => {
    expect(createValueColorOptions(undefined, undefined)).toBeUndefined();
  });

  it('should create uniform color options', () => {
    const format = {
      type: 'color',
      color: 'blue',
    } as PanelColorFormatSingle;
    const options = createValueColorOptions(format, themeSettings);

    expect(options).toEqual({
      type: 'uniform',
      color: 'blue',
    });
  });

  it('should create range value color options with auto range mode', () => {
    const format = {
      type: 'range',
      rangeMode: 'auto',
      steps: 5,
    } as PanelColorFormatRange;

    const options = createValueColorOptions(format, themeSettings);

    expect(options).toEqual({
      type: 'range',
      steps: 5,
      minColor: '#737373',
      maxColor: '#00a5b8',
    });
  });

  it('should create range value color options with both range mode', () => {
    const format = {
      type: 'range',
      rangeMode: 'both',
      steps: 3,
      min: '#0000ff',
      max: '#ff0000',
    } as PanelColorFormatRange;
    const options = createValueColorOptions(format, themeSettings);

    expect(options).toEqual({
      type: 'range',
      steps: 3,
      minColor: '#0000ff',
      maxColor: '#ff0000',
    });
  });

  it('should create range value color options with min range mode', () => {
    const format = {
      type: 'range',
      rangeMode: 'min',
      steps: 4,
      min: '#0000ff',
    } as PanelColorFormatRange;
    const options = createValueColorOptions(format, themeSettings);

    expect(options).toEqual({
      type: 'range',
      steps: 4,
      minColor: '#0000ff',
      maxColor: '#dcdcdc',
    });
  });

  it('should create range value color options with max range mode', () => {
    const format = {
      type: 'range',
      rangeMode: 'max',
      steps: 3,
      max: '#ff0000',
    } as PanelColorFormatRange;
    const options = createValueColorOptions(format, themeSettings);

    expect(options).toEqual({
      type: 'range',
      steps: 3,
      minColor: '#dcdcdc',
      maxColor: '#ff0000',
    });
  });

  it('should create conditional color options', () => {
    const format = {
      type: 'condition',
      conditions: [
        { expression: 'value > 10', color: 'blue' },
        { expression: 'value < 0', color: '#00cee6' },
      ],
    } as PanelColorFormatConditional;
    const options = createValueColorOptions(format, themeSettings);

    expect(options).toEqual({
      type: 'conditional',
      conditions: [
        { expression: 'value > 10', color: 'blue' },
        { expression: 'value < 0', color: '#00cee6' },
      ],
      defaultColor: '#00cee6',
    });
  });

  it('should create uniform color options for unknown type', () => {
    const format = {
      type: 'unknown',
    } as unknown as PanelColorFormat;
    const options = createValueColorOptions(format, themeSettings);

    expect(options).toEqual({
      type: 'uniform',
      color: '#00cee6',
    });
  });
});

describe('createValueToColorMap', () => {
  it('should create value to color map', () => {
    const membersFormat = {
      member1: { color: 'blue' },
      member2: { color: 'red' },
    };
    const map = createValueToColorMap(membersFormat);

    expect(map).toEqual({
      member1: 'blue',
      member2: 'red',
    });
  });
});
