import { Color } from '../types.js';

import {
  createValueColorOptions,
  createValueToColorMap,
  createPanelColorFormat,
} from './translate-panel-color-format.js';
import {
  PanelColorFormat,
  PanelColorFormatConditional,
  PanelColorFormatRange,
  PanelColorFormatSingle,
} from './types.js';
import {
  ConditionalDataColorOptions,
  DataColorOptions,
  RangeDataColorOptions,
  UniformDataColorOptions,
} from '../chart-data/data-coloring/index.js';

describe('createValueColorOptions', () => {
  const paletteColors = ['#00cee6'] as Color[];

  it('should return undefined when format is not provided', () => {
    expect(createValueColorOptions(undefined, undefined)).toBeUndefined();
  });

  it('should create uniform color options', () => {
    const format = {
      type: 'color',
      color: 'blue',
    } as PanelColorFormatSingle;
    const options = createValueColorOptions(format, paletteColors);

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

    const options = createValueColorOptions(format, paletteColors);

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
    const options = createValueColorOptions(format, paletteColors);

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
    const options = createValueColorOptions(format, paletteColors);

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
    const options = createValueColorOptions(format, paletteColors);

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
    const options = createValueColorOptions(format, paletteColors);

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
    const options = createValueColorOptions(format, paletteColors);

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

describe('createPanelColorFormat', () => {
  const paletteColors: Color[] = ['#00cee6'];

  const defaultMinColor = '#dcdcdc'; // DEFAULT_COLOR
  const defaultMaxColor = '#dcdcdc'; // DEFAULT_COLOR

  it('should return undefined when options is undefined', () => {
    expect(createPanelColorFormat(undefined, paletteColors)).toBeUndefined();
  });

  it('should create color format from string', () => {
    const options = 'blue';
    expect(createPanelColorFormat(options)).toEqual({
      type: 'color',
      color: 'blue',
    });
  });

  it('should create color format from uniform options with colorIndex when using palette color', () => {
    const options: UniformDataColorOptions = {
      type: 'uniform',
      color: '#00cee6', // matches paletteColors[0]
      colorIndex: 0,
    };
    expect(createPanelColorFormat(options, paletteColors)).toEqual({
      type: 'color',
      color: '#00cee6',
      colorIndex: 0,
      isHandPickedColor: false,
    });
  });

  it('should create color format from uniform options without colorIndex for custom color', () => {
    const options: UniformDataColorOptions = {
      type: 'uniform',
      color: '#ff0000',
    };
    expect(createPanelColorFormat(options, paletteColors)).toEqual({
      type: 'color',
      color: '#ff0000',
      isHandPickedColor: true,
    });
  });

  it('should create range format with both mode when custom colors are used', () => {
    const options: RangeDataColorOptions = {
      type: 'range',
      steps: 3,
      minColor: '#0000ff',
      maxColor: '#ff0000',
      minValue: 0,
      midValue: 50,
      maxValue: 100,
    };
    expect(createPanelColorFormat(options, paletteColors)).toEqual({
      type: 'range',
      steps: 3,
      rangeMode: 'both',
      min: '#0000ff',
      max: '#ff0000',
      minvalue: '0',
      midvalue: '50',
      maxvalue: '100',
    });
  });

  it('should create range format with auto mode when using default colors', () => {
    const options: RangeDataColorOptions = {
      type: 'range',
      steps: 3,
      minColor: defaultMinColor,
      maxColor: defaultMaxColor,
    };
    expect(createPanelColorFormat(options, paletteColors)).toEqual({
      type: 'range',
      steps: 3,
      rangeMode: 'auto',
      min: defaultMinColor,
      max: defaultMaxColor,
    });
  });

  it('should create range format with min mode when only max color is auto', () => {
    const options: RangeDataColorOptions = {
      type: 'range',
      steps: 3,
      minColor: '#0000ff',
      maxColor: defaultMaxColor,
    };
    expect(createPanelColorFormat(options, paletteColors)).toEqual({
      type: 'range',
      steps: 3,
      rangeMode: 'min',
      min: '#0000ff',
      max: '#00a5b8',
    });
  });

  it('should create range format with max mode when only min color is auto', () => {
    const options: RangeDataColorOptions = {
      type: 'range',
      steps: 3,
      minColor: defaultMinColor,
      maxColor: '#ff0000',
    };
    expect(createPanelColorFormat(options, paletteColors)).toEqual({
      type: 'range',
      steps: 3,
      rangeMode: 'max',
      min: '#737373',
      max: '#ff0000',
    });
  });

  it('should create range format with default steps', () => {
    const options: RangeDataColorOptions = {
      type: 'range',
      minColor: '#0000ff',
      maxColor: '#ff0000',
    };
    expect(createPanelColorFormat(options)).toEqual({
      type: 'range',
      steps: 5,
      rangeMode: 'both',
      min: '#0000ff',
      max: '#ff0000',
    });
  });

  it('should create conditional format and filter non-string expressions', () => {
    const options: ConditionalDataColorOptions = {
      type: 'conditional',
      conditions: [
        { color: 'red', expression: 'value > 10', operator: '>' },
        { color: 'blue', expression: 'value < 0', operator: '<' },
        { color: 'green', expression: { jaql: {} } as unknown as string, operator: '=' },
      ],
      defaultColor: '#00cee6',
    };
    expect(createPanelColorFormat(options, paletteColors)).toEqual({
      type: 'condition',
      conditions: [
        { color: 'red', expression: 'value > 10', operator: '>' },
        { color: 'blue', expression: 'value < 0', operator: '<' },
      ],
    });
  });

  it('should create conditional format with default color for missing colors', () => {
    const options: ConditionalDataColorOptions = {
      type: 'conditional',
      conditions: [
        { color: undefined as unknown as string, expression: 'value > 10', operator: '>' },
        { color: 'blue', expression: 'value < 0', operator: '<' },
      ],
      defaultColor: '#00cee6',
    };
    expect(createPanelColorFormat(options, paletteColors)).toEqual({
      type: 'condition',
      conditions: [
        { color: '#00cee6', expression: 'value > 10', operator: '>' },
        { color: 'blue', expression: 'value < 0', operator: '<' },
      ],
    });
  });

  it('should create conditional format with empty conditions', () => {
    const options: ConditionalDataColorOptions = {
      type: 'conditional',
      defaultColor: '#00cee6',
    };
    expect(createPanelColorFormat(options)).toEqual({
      type: 'condition',
      conditions: [],
    });
  });

  it('should create default color format with palette color for unknown type', () => {
    const options = {
      type: 'unknown',
    } as unknown as DataColorOptions;
    expect(createPanelColorFormat(options, paletteColors)).toEqual({
      type: 'color',
      color: '#00cee6',
      colorIndex: 0,
    });
  });

  it('should create range format with both mode when palette colors are not provided', () => {
    const options: RangeDataColorOptions = {
      type: 'range',
      steps: 3,
      minColor: '#0000ff',
      maxColor: '#ff0000',
    };
    expect(createPanelColorFormat(options)).toEqual({
      type: 'range',
      steps: 3,
      rangeMode: 'both',
      min: '#0000ff',
      max: '#ff0000',
    });
  });

  it('should handle round-trip conversion for auto range mode', () => {
    // PanelColorFormat → DataColorOptions
    const format: PanelColorFormatRange = {
      type: 'range',
      rangeMode: 'auto',
      steps: 5,
    };
    const dataOptions = createValueColorOptions(format, paletteColors);
    expect(dataOptions).toBeDefined();

    // DataColorOptions → PanelColorFormat
    const roundTripped = createPanelColorFormat(dataOptions as DataColorOptions, paletteColors);
    expect(roundTripped).toEqual({
      type: 'range',
      steps: 5,
      rangeMode: 'auto',
      min: '#737373',
      max: '#00a5b8',
    });
  });

  it('should handle round-trip conversion for min range mode', () => {
    // PanelColorFormat → DataColorOptions
    const format: PanelColorFormatRange = {
      type: 'range',
      rangeMode: 'min',
      steps: 4,
      min: '#0000ff',
    };
    const dataOptions = createValueColorOptions(format, paletteColors);
    expect(dataOptions).toBeDefined();

    // DataColorOptions → PanelColorFormat
    const roundTripped = createPanelColorFormat(dataOptions as DataColorOptions, paletteColors);
    expect(roundTripped).toEqual({
      type: 'range',
      steps: 4,
      rangeMode: 'min',
      min: '#0000ff',
      max: '#00a5b8',
    });
  });

  it('should handle round-trip conversion for max range mode', () => {
    // PanelColorFormat → DataColorOptions
    const format: PanelColorFormatRange = {
      type: 'range',
      rangeMode: 'max',
      steps: 3,
      max: '#ff0000',
    };
    const dataOptions = createValueColorOptions(format, paletteColors);
    expect(dataOptions).toBeDefined();

    // DataColorOptions → PanelColorFormat
    const roundTripped = createPanelColorFormat(dataOptions as DataColorOptions, paletteColors);
    expect(roundTripped).toEqual({
      type: 'range',
      steps: 3,
      rangeMode: 'max',
      min: '#737373',
      max: '#ff0000',
    });
  });

  it('should handle round-trip conversion for both range mode', () => {
    // PanelColorFormat → DataColorOptions
    const format: PanelColorFormatRange = {
      type: 'range',
      rangeMode: 'both',
      steps: 3,
      min: '#0000ff',
      max: '#ff0000',
    };
    const dataOptions = createValueColorOptions(format, paletteColors);
    expect(dataOptions).toBeDefined();

    // DataColorOptions → PanelColorFormat
    const roundTripped = createPanelColorFormat(dataOptions as DataColorOptions, paletteColors);
    expect(roundTripped).toEqual({
      type: 'range',
      steps: 3,
      rangeMode: 'both',
      min: '#0000ff',
      max: '#ff0000',
    });
  });

  it('should handle round-trip conversion for conditional format', () => {
    // PanelColorFormat → DataColorOptions
    const format: PanelColorFormatConditional = {
      type: 'condition',
      conditions: [
        { color: 'red', expression: 'value > 10', operator: '>' },
        { color: 'blue', expression: 'value < 0', operator: '<' },
      ],
    };
    const dataOptions = createValueColorOptions(format, paletteColors);
    expect(dataOptions).toBeDefined();

    // DataColorOptions → PanelColorFormat
    const roundTripped = createPanelColorFormat(dataOptions as DataColorOptions, paletteColors);
    expect(roundTripped).toEqual({
      type: 'condition',
      conditions: [
        { color: 'red', expression: 'value > 10', operator: '>' },
        { color: 'blue', expression: 'value < 0', operator: '<' },
      ],
    });
  });
});
