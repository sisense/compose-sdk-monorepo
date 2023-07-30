import {
  toColor,
  toString,
  toRangeFn,
  toSteps,
  toGray,
  toAvg,
  hueDiff,
  getRgbValuesFromColor,
  getDarkFactor,
  getSlightlyDifferentColor,
} from './color-interpolation';
import Color from 'colorjs.io';

test('toColor and toString', () => {
  expect(toString(toColor('red'))).toBe('#f00');
});

describe('toRangeFn', () => {
  describe('1-color range', () => {
    const rangeFn = toRangeFn('red');

    test('start of range', () => {
      expect(rangeFn(0)).toBe('#f00');
    });
    test('middle of range', () => {
      expect(rangeFn(0.5)).toBe('#f00');
    });
    test('end of range', () => {
      expect(rangeFn(1)).toBe('#f00');
    });
  });

  describe('2-color range', () => {
    const rangeFn = toRangeFn('red', 'yellow');

    test('start of range', () => {
      expect(rangeFn(0)).toBe('#f00');
    });
    test('middle of range', () => {
      expect(rangeFn(0.5)).toBe('#ffa200');
    });
    test('end of range', () => {
      expect(rangeFn(1)).toBe('#ff0');
    });
    test('no interpolation out of range', () => {
      expect(rangeFn(-1)).toBe('#f00');
      expect(rangeFn(2)).toBe('#ff0');
    });
  });

  describe('3-color range', () => {
    const rangeFn = toRangeFn('blue', 'red', 'yellow');

    test('start of range', () => {
      expect(rangeFn(0)).toBe('#00f');
    });
    test('middle of range', () => {
      expect(rangeFn(0.5)).toBe('#f00');
    });
    test('end of range', () => {
      expect(rangeFn(1)).toBe('#ff0');
    });

    test('intermediate values', () => {
      expect(rangeFn(0.25)).toBe('#c10088');
      expect(rangeFn(0.75)).toBe('#ffa200');
    });

    test('no interpolation out of range', () => {
      expect(rangeFn(-1)).toBe('#00f');
      expect(rangeFn(2)).toBe('#ff0');
    });
  });
});

describe('toSteps', () => {
  test('5 steps between 2 colors', () => {
    const steps = toSteps(5, 'red', 'yellow');

    expect(steps).toEqual(['#f00', '#ff6c00', '#ffa200', '#ffd100', '#ff0']);
  });

  test('8 steps between 3 colors', () => {
    const steps = toSteps(8, 'blue', 'red', 'yellow');

    expect(steps).toEqual([
      '#00f',
      '#9900ba',
      '#cc0078',
      '#ef0035',
      '#ff4f00',
      '#ff9300',
      '#ffcb00',
      '#ff0',
    ]);
  });
});

test('toGray', () => {
  expect(toGray('red')).toBe('#808080');
  expect(toGray('yellow')).toBe('#808080');
  expect(toGray('blue')).toBe('#808080');
});

test('toAvg', () => {
  expect(toAvg('red', 'yellow')).toBe('#ffa200');
  expect(toAvg('blue', 'red')).toBe('#c10088');
});

test('hueDiff', () => {
  expect(hueDiff('red', 'green')).toBe(120);
  expect(hueDiff('red', 'yellow')).toBe(60);
  expect(hueDiff('yellow', 'blue')).toBe(180);
});

describe('getRgbValuesFromColor', () => {
  it('should return the correct RGB values for a red color', () => {
    const color = new Color('red');

    const result = getRgbValuesFromColor(color);

    expect(result).toEqual({
      R: 255,
      G: 0,
      B: 0,
    });
  });

  it('should return the correct RGB values for a green color', () => {
    const color = new Color('green');

    const result = getRgbValuesFromColor(color);

    expect(result).toEqual({
      R: 0,
      G: 128,
      B: 0,
    });
  });

  it('should return the correct RGB values for a blue color', () => {
    const color = new Color('blue');

    const result = getRgbValuesFromColor(color);

    expect(result).toEqual({
      R: 0,
      G: 0,
      B: 255,
    });
  });
});

describe('getDarkFactor', () => {
  it('should calculate the correct dark factor for light color', () => {
    const color = new Color('rgb(240,230,200)');
    expect(getDarkFactor(color)).toBe(0.09972549019607846);
  });

  it('should calculate the correct dark factor for dark color', () => {
    const color = new Color('rgb(15,30,45)');
    expect(getDarkFactor(color)).toBe(0.8932352941176471);
  });
});

describe('getSlightlyDifferentColor', () => {
  it('should calculate the correct slightly different color for light color', () => {
    const color = 'rgb(240,230,200)';
    expect(getSlightlyDifferentColor(color)).toBe('rgba(231, 221, 191, 1)');
  });

  it('should calculate the correct correct slightly different color for dark color', () => {
    const color = 'rgb(15,30,45)';
    expect(getSlightlyDifferentColor(color)).toBe('rgba(0, 8, 23, 1)');
  });
});
