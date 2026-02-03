import { seriesDataColoringFunction } from './series-data-coloring-function.js';

const seriesYValues = [{ value: 1 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 5 }];

describe('seriesDataColoringFunction', () => {
  describe('uniform colorOpts', () => {
    test('string', () => {
      expect(seriesDataColoringFunction(seriesYValues, 'red')).toEqual([
        { value: 1, color: 'red' },
        { value: 1, color: 'red' },
        { value: 2, color: 'red' },
        { value: 3, color: 'red' },
        { value: 5, color: 'red' },
      ]);
    });

    test('object', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'uniform',
          color: 'red',
        }),
      ).toEqual([
        { value: 1, color: 'red' },
        { value: 1, color: 'red' },
        { value: 2, color: 'red' },
        { value: 3, color: 'red' },
        { value: 5, color: 'red' },
      ]);
    });
  });

  describe('range colorOpts', () => {
    test('red-yellow', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          minColor: 'red',
          maxColor: 'yellow',
        }),
      ).toEqual([
        { value: 1, color: '#f00' },
        { value: 1, color: '#f00' },
        { value: 2, color: '#ff6c00' },
        { value: 3, color: '#ffa200' },
        { value: 5, color: '#ff0' },
      ]);
    });

    test('red-blue', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          minColor: 'red',
          maxColor: 'blue',
        }),
      ).toEqual([
        { value: 1, color: '#f00' },
        { value: 1, color: '#f00' },
        { value: 2, color: '#b65139' },
        { value: 3, color: '#616161' },
        { value: 5, color: '#00f' },
      ]);
    });

    test('red-blue steps: 3', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          steps: 3,
          minColor: 'red',
          maxColor: 'blue',
        }),
      ).toEqual([
        { value: 1, color: '#f00' },
        { value: 1, color: '#f00' },
        { value: 2, color: '#f00' },
        { value: 3, color: '#616161' },
        { value: 5, color: '#00f' },
      ]);
    });

    test('red-blue steps: 4', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          steps: 4,
          minColor: 'red',
          maxColor: 'blue',
        }),
      ).toEqual([
        { value: 1, color: '#f00' },
        { value: 1, color: '#f00' },
        { value: 2, color: '#9c5946' },
        { value: 3, color: '#624c95' },
        { value: 5, color: '#00f' },
      ]);
    });

    test('red-blue steps: 5', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          steps: 5,
          minColor: 'red',
          maxColor: 'blue',
        }),
      ).toEqual([
        { value: 1, color: '#f00' },
        { value: 1, color: '#f00' },
        { value: 2, color: '#b65139' },
        { value: 3, color: '#616161' },
        { value: 5, color: '#00f' },
      ]);
    });

    test('red-blue minValue: 3', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          minColor: 'red',
          maxColor: 'blue',
          minValue: 3,
        }),
      ).toEqual([
        { value: 1, color: '#f00' },
        { value: 1, color: '#f00' },
        { value: 2, color: '#f00' },
        { value: 3, color: '#f00' },
        { value: 5, color: '#00f' },
      ]);
    });

    test('red-blue midValue: 2', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          minColor: 'red',
          maxColor: 'blue',
          midValue: 2,
        }),
      ).toEqual([
        { value: 1, color: '#f00' },
        { value: 1, color: '#f00' },
        { value: 2, color: '#616161' },
        { value: 3, color: '#624c95' },
        { value: 5, color: '#00f' },
      ]);
    });

    test('red-blue maxValue: 3', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          minColor: 'red',
          maxColor: 'blue',
          maxValue: 3,
        }),
      ).toEqual([
        { value: 1, color: '#f00' },
        { value: 1, color: '#f00' },
        { value: 2, color: '#616161' },
        { value: 3, color: '#00f' },
        { value: 5, color: '#00f' },
      ]);
    });

    test('red-default', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          minColor: 'red',
        }),
      ).toEqual([
        { value: 1, color: '#f00' },
        { value: 1, color: '#f00' },
        { value: 2, color: '#ff603e' },
        { value: 3, color: '#fc8f71' },
        { value: 5, color: '#dcdcdc' },
      ]);
    });

    test('default-blue', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'range',
          maxColor: 'blue',
        }),
      ).toEqual([
        { value: 1, color: '#dcdcdc' },
        { value: 1, color: '#dcdcdc' },
        { value: 2, color: '#c0aae8' },
        { value: 3, color: '#9e79f1' },
        { value: 5, color: '#00f' },
      ]);
    });
  });

  describe('conditional colorOpts', () => {
    test('no conditions', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [],
          defaultColor: 'red',
        }),
      ).toEqual([
        { value: 1, color: 'red' },
        { value: 1, color: 'red' },
        { value: 2, color: 'red' },
        { value: 3, color: 'red' },
        { value: 5, color: 'red' },
      ]);
    });

    test('no conditions, no defaultColor', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [],
        }),
      ).toEqual([{ value: 1 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 5 }]);
    });

    test('equal', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [{ color: 'blue', expression: '2', operator: '=' }],
        }),
      ).toEqual([
        { value: 1 },
        { value: 1 },
        { value: 2, color: 'blue' },
        { value: 3 },
        { value: 5 },
      ]);
    });

    test('not equal', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [{ color: 'blue', expression: '2', operator: '!=' }],
        }),
      ).toEqual([
        { value: 1, color: 'blue' },
        { value: 1, color: 'blue' },
        { value: 2 },
        { value: 3, color: 'blue' },
        { value: 5, color: 'blue' },
      ]);
    });

    test('less than', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [{ color: 'blue', expression: '3', operator: '<' }],
        }),
      ).toEqual([
        { value: 1, color: 'blue' },
        { value: 1, color: 'blue' },
        { value: 2, color: 'blue' },
        { value: 3 },
        { value: 5 },
      ]);
    });

    test('less than or equal', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [{ color: 'blue', expression: '3', operator: '<=' }],
        }),
      ).toEqual([
        { value: 1, color: 'blue' },
        { value: 1, color: 'blue' },
        { value: 2, color: 'blue' },
        { value: 3, color: 'blue' },
        { value: 5 },
      ]);
    });

    test('greater than', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [{ color: 'blue', expression: '3', operator: '>' }],
        }),
      ).toEqual([
        { value: 1 },
        { value: 1 },
        { value: 2 },
        { value: 3 },
        { value: 5, color: 'blue' },
      ]);
    });

    test('greater than or equal', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [{ color: 'blue', expression: '3', operator: '>=' }],
        }),
      ).toEqual([
        { value: 1 },
        { value: 1 },
        { value: 2 },
        { value: 3, color: 'blue' },
        { value: 5, color: 'blue' },
      ]);
    });

    test('multiple conditions', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [
            { color: 'red', expression: '2', operator: '<' },
            { color: 'blue', expression: '3', operator: '>=' },
          ],
        }),
      ).toEqual([
        { value: 1, color: 'red' },
        { value: 1, color: 'red' },
        { value: 2 },
        { value: 3, color: 'blue' },
        { value: 5, color: 'blue' },
      ]);
    });

    test('multiple overlapping conditions', () => {
      expect(
        seriesDataColoringFunction(seriesYValues, {
          type: 'conditional',
          conditions: [
            { color: 'red', expression: '3', operator: '<=' },
            { color: 'blue', expression: '3', operator: '>=' },
          ],
        }),
      ).toEqual([
        { value: 1, color: 'red' },
        { value: 1, color: 'red' },
        { value: 2, color: 'red' },
        { value: 3, color: 'red' },
        { value: 5, color: 'blue' },
      ]);
    });
  });
});
