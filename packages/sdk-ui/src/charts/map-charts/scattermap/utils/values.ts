export function getValuesMinMax(values: number[]): {
  min: number;
  max: number;
} {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;

  values.forEach((value) => {
    if (isNaN(value)) return;

    min = Math.min(min, value);
    max = Math.max(max, value);
  });

  return {
    min,
    max,
  };
}
