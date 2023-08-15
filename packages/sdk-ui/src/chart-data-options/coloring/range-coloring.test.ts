import { getRangeColoringFunction } from './range-coloring';
import { RangeDataColorOptions } from '../../types';
import { DEFAULT_COLOR } from './consts';

describe('getRangeColoringFunction', () => {
  it('should interpolate color based on the range when defined range wider the passed data', () => {
    const colorOpts: RangeDataColorOptions = {
      type: 'range',
      minColor: 'red',
      maxColor: 'blue',
      minValue: 0,
      maxValue: 100,
    };

    const getColorInterpolator = getRangeColoringFunction(colorOpts);

    expect(typeof getColorInterpolator).toBe('function');

    const interpolateColor = getColorInterpolator([10, 20, 30, 40, 50]);
    expect(typeof interpolateColor).toBe('function');

    expect(interpolateColor(10)).toBe('#e2381d'); //red-ish color
    expect(interpolateColor(20)).toBe('#c54b30'); // less red-ish color
    expect(interpolateColor(30)).toBe('#a75641');
    expect(interpolateColor(40)).toBe('#865d51');
    expect(interpolateColor(50)).toBe('#616161'); // gray color (middle of the red and blue)
  });

  it('should use default colors if not provided', () => {
    const colorOpts: RangeDataColorOptions = {
      type: 'range',
      steps: 3,
    };

    const getColorInterpolator = getRangeColoringFunction(colorOpts);

    const interpolateColor = getColorInterpolator([10, 20, 30]);
    expect(interpolateColor(10)).toBe(DEFAULT_COLOR);
    expect(interpolateColor(20)).toBe(DEFAULT_COLOR);
    expect(interpolateColor(30)).toBe(DEFAULT_COLOR);
  });

  it("should move the gradient center correctly regarding 'midValue'", () => {
    const colorOpts: RangeDataColorOptions = {
      type: 'range',
      steps: 3,
      minColor: 'blue',
      maxColor: 'red',
      midValue: 20,
    };

    const coloringFunction = getRangeColoringFunction(colorOpts);

    const interpolateColor = coloringFunction([10, 20, 30, 40, 50]); // 20 closer to min then max
    expect(interpolateColor(10)).toBe('#00f'); // blue
    expect(interpolateColor(20)).toBe('#616161'); // grey (middle of blue and red)
    expect(interpolateColor(30)).toBe('#f00'); // red
    expect(interpolateColor(40)).toBe('#f00'); // red
    expect(interpolateColor(50)).toBe('#f00'); // red
  });

  it('should calculate the range values if `colorOpts.minValue` and `colorOpts.maxValue` are not explicitly set', () => {
    const colorOpts: RangeDataColorOptions = {
      type: 'range',
      minColor: 'blue',
      maxColor: 'red',
    };

    const coloringFunction = getRangeColoringFunction(colorOpts);
    const getColorForValue = coloringFunction([10, 20, 30, 40, 50]);

    expect(getColorForValue(10)).toBe('#00f'); // blue
    expect(getColorForValue(30)).toBe('#616161'); // gray
    expect(getColorForValue(50)).toBe('#f00'); // red
  });
});
