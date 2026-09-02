import { describe, expect, it } from 'vitest';

import { fitNames } from './fit-names';

// Every character is 10px wide, so a width in pixels reads as a character count × 10.
const measure = (text: string) => text.length * 10;

describe('fitNames', () => {
  it('names everything when it all fits', () => {
    expect(fitNames(['2020', '2021'], 200, measure)).toEqual({ text: '2020, 2021', hidden: 0 });
  });

  /* The case from the design: three years and a `+1`, not one year and a `+3`. A fixed character
     budget produced the latter, which is what this replaces. */
  it('names as many as fit and counts only the rest', () => {
    // '2020, 2021, 2022 +1' is 19 chars = 190px; adding 2023 would need 250px.
    expect(fitNames(['2020', '2021', '2022', '2023'], 200, measure)).toEqual({
      text: '2020, 2021, 2022',
      hidden: 1,
    });
  });

  it('fits more into a wider box', () => {
    const labels = ['2020', '2021', '2022', '2023'];

    // '2020, 2021 +2' is 13 chars = 130px, so two names need 130 — at 120 only one fits.
    expect(fitNames(labels, 120, measure)).toEqual({ text: '2020', hidden: 3 });
    expect(fitNames(labels, 130, measure)).toEqual({ text: '2020, 2021', hidden: 2 });
    expect(fitNames(labels, 400, measure)).toEqual({ text: '2020, 2021, 2022, 2023', hidden: 0 });
  });

  // A trigger reading only `+3` would have hidden the very thing it filters on.
  it('always names one value, even one too long for the box', () => {
    expect(fitNames(['Antigua and Barbuda', 'Albania'], 30, measure)).toEqual({
      text: 'Antigua and Barbuda',
      hidden: 1,
    });
  });

  it('counts the pill against the same width, so the count cannot be pushed out of view', () => {
    // Without the pill 'A, B' is 4 chars = 40px and fits; with ' +1' it is 70px and does not.
    expect(fitNames(['A', 'B', 'C'], 60, measure)).toEqual({ text: 'A', hidden: 2 });
  });

  it('has nothing to say about an empty selection', () => {
    expect(fitNames([], 200, measure)).toEqual({ text: '', hidden: 0 });
  });
});
