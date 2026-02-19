import { StaticColoringFunction } from '.';
import { UniformDataColorOptions } from '../../../../../types';

export const getUniformColorOptionsFromString = (color: string): UniformDataColorOptions => ({
  type: 'uniform',
  color,
});

export function getUniformColoringFunction(
  colorOpts: UniformDataColorOptions,
): StaticColoringFunction {
  return () => colorOpts.color;
}
