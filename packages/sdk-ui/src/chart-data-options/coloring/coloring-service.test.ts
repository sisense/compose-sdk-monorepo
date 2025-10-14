import { DataColorOptions } from '../../types';
import {
  AbsoluteColoringFunction,
  getColoringServiceByColorOptions,
  RelativeColoringFunction,
  StaticColoringFunction,
} from './coloring-service';

describe('getColoringServiceByColorOptions', () => {
  it('should return a coloring service for uniform color options', () => {
    const colorOptions: DataColorOptions = {
      type: 'uniform',
      color: 'red',
    };

    const coloringService = getColoringServiceByColorOptions(colorOptions);

    expect(coloringService.type).toBe('Static');
    expect(typeof coloringService.getColor).toBe('function');

    const getColor: StaticColoringFunction = coloringService.getColor as StaticColoringFunction;
    expect(getColor()).toBe('red');
  });

  it('should return a coloring service for conditional color options', () => {
    const colorOptions: DataColorOptions = {
      type: 'conditional',
      conditions: [
        { color: 'red', expression: '10', operator: '<' },
        { color: 'blue', expression: '10', operator: '>=' },
      ],
      defaultColor: 'gray',
    };

    const coloringService = getColoringServiceByColorOptions(colorOptions);

    expect(coloringService.type).toBe('Absolute');
    expect(typeof coloringService.getColor).toBe('function');

    const getColor: AbsoluteColoringFunction = coloringService.getColor as AbsoluteColoringFunction;
    expect(getColor(5)).toBe('red');
    expect(getColor(15)).toBe('blue');
    expect(getColor(20)).toBe('blue');
    expect(getColor(25)).toBe('blue');
    expect(getColor(30)).toBe('blue');
  });

  it('should return a coloring service for range color options', () => {
    const colorOptions: DataColorOptions = {
      type: 'range',
      steps: 3,
      minColor: 'blue',
      maxColor: 'red',
      minValue: 0,
      maxValue: 100,
    };

    const coloringService = getColoringServiceByColorOptions(colorOptions);

    expect(coloringService.type).toBe('Relative');
    expect(typeof coloringService.getColor).toBe('function');

    const getColor: RelativeColoringFunction = coloringService.getColor as RelativeColoringFunction;
    const getColorForValue = getColor([0, 25, 50, 75, 100]);

    expect(getColorForValue(0)).toBe('#00f'); // blue
    expect(getColorForValue(25)).toBe('#00f'); // blue
    expect(getColorForValue(50)).toBe('#616161'); // gray
    expect(getColorForValue(75)).toBe('#f00'); // red
    expect(getColorForValue(100)).toBe('#f00'); // red
  });
});
