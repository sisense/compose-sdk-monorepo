import { legendColor } from '.';
import { DEFAULT_COLOR } from '../../chart-data-options/coloring/consts';

describe('legendColor', () => {
  test('string ColorOpts', () => {
    expect(legendColor('green')).toBe('green');
  });

  test('uniform ColorOpts', () => {
    expect(legendColor({ type: 'uniform', color: 'green' })).toBe('green');
  });

  test('range ColorOpts', () => {
    expect(legendColor({ type: 'range' })).toBe(DEFAULT_COLOR);
  });

  test('conditional ColorOpts', () => {
    expect(legendColor({ type: 'conditional' })).toBe(DEFAULT_COLOR);
  });
});
