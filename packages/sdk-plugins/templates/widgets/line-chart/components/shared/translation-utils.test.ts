import { describe, expect, it } from 'vitest';

import { getRotationType } from './translation-utils';

describe('getRotationType', () => {
  it('returns "horizontal" for rotation < 20', () => {
    expect(getRotationType(0)).toBe('horizontal');
    expect(getRotationType(10)).toBe('horizontal');
    expect(getRotationType(19)).toBe('horizontal');
  });

  it('returns "diagonal" for rotation between 20 and 59', () => {
    expect(getRotationType(20)).toBe('diagonal');
    expect(getRotationType(45)).toBe('diagonal');
    expect(getRotationType(59)).toBe('diagonal');
  });

  it('returns "vertical" for rotation between 60 and 119', () => {
    expect(getRotationType(60)).toBe('vertical');
    expect(getRotationType(90)).toBe('vertical');
    expect(getRotationType(119)).toBe('vertical');
  });

  it('returns "diagonal" for rotation between 120 and 159', () => {
    expect(getRotationType(120)).toBe('diagonal');
    expect(getRotationType(140)).toBe('diagonal');
    expect(getRotationType(159)).toBe('diagonal');
  });

  it('returns "horizontal" for rotation >= 160', () => {
    expect(getRotationType(160)).toBe('horizontal');
    expect(getRotationType(170)).toBe('horizontal');
    expect(getRotationType(179)).toBe('horizontal');
  });

  it('handles negative rotations via Math.abs', () => {
    expect(getRotationType(-10)).toBe('horizontal');
    expect(getRotationType(-45)).toBe('diagonal');
    expect(getRotationType(-90)).toBe('vertical');
    expect(getRotationType(-140)).toBe('diagonal');
    expect(getRotationType(-165)).toBe('horizontal');
  });

  it('handles rotations >= 180 via modulo', () => {
    expect(getRotationType(180)).toBe('horizontal'); // 180 % 180 = 0 < 20
    expect(getRotationType(200)).toBe('diagonal'); // 200 % 180 = 20
    expect(getRotationType(270)).toBe('vertical'); // 270 % 180 = 90
    expect(getRotationType(300)).toBe('diagonal'); // 300 % 180 = 120
    expect(getRotationType(340)).toBe('horizontal'); // 340 % 180 = 160
  });
});
