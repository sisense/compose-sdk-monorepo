import { describe, expect, it } from 'vitest';

import { getSizeTier } from './use-size-tier';

describe('getSizeTier', () => {
  it.each`
    width  | height | expected
    ${100} | ${100} | ${'xs'}
    ${250} | ${100} | ${'xs'}
    ${100} | ${250} | ${'xs'}
    ${199} | ${119} | ${'xs'}
    ${250} | ${150} | ${'sm'}
    ${400} | ${150} | ${'sm'}
    ${250} | ${170} | ${'sm'}
    ${200} | ${120} | ${'sm'}
    ${400} | ${220} | ${'md'}
    ${600} | ${220} | ${'md'}
    ${400} | ${250} | ${'md'}
    ${320} | ${180} | ${'md'}
    ${600} | ${300} | ${'lg'}
    ${520} | ${280} | ${'lg'}
  `(
    'returns $expected for a $width x $height box',
    ({ width, height, expected }: { width: number; height: number; expected: string }) => {
      expect(getSizeTier(width, height)).toBe(expected);
    },
  );
});
