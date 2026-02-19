/* eslint-disable import/prefer-default-export */

export const calcDataDar = (
  val: string | null | undefined,
  min: number,
  max: number,
): Array<number> => {
  if (
    typeof val === 'undefined' ||
    val === null ||
    val === '0' ||
    typeof min === 'undefined' ||
    min === null ||
    typeof max === 'undefined' ||
    max === null
  ) {
    return [];
  }
  const value = parseFloat(val);
  let from = 0;
  let width = 0;

  if (min === max) {
    return [];
  }

  const size = ((value - min) / (max - min)) * 100;

  if (min >= 0 && max >= 0) {
    // all positive
    from = 0;
    width = size;
  } else if (min < 0 && max < 0) {
    // all negative
    from = 100;
    width = (100 - size) * -1;
  } else {
    // mix
    const start = ((min * -1) / (max - min)) * 100;

    if (value < 0) {
      // negative
      from = start;
      width = size - start;
    } else {
      // positive
      from = start;
      width = size - start;
    }
  }
  return [from, width, value < 0 ? -1 : 1];
};
