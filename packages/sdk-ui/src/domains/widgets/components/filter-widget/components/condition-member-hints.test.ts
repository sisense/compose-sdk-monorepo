import { describe, expect, it } from 'vitest';

import { memberHintsForNeedle } from './condition-member-hints.js';

const MEMBERS = [
  { key: 'Cardiology', title: 'Cardiology' },
  { key: 'Radiology', title: 'Radiology' },
  { key: 'Neurology', title: 'Neurology' },
  { key: 'Oncology', title: 'Oncology' },
  { key: 'Urology', title: 'Urology' },
  { key: 'Dermatology', title: 'Dermatology' },
] as const;

describe('memberHintsForNeedle', () => {
  it('returns nothing for an empty needle', () => {
    expect(memberHintsForNeedle(MEMBERS, '')).toEqual([]);
    expect(memberHintsForNeedle(MEMBERS, '   ')).toEqual([]);
  });

  it('matches members whose title contains the needle, case-insensitively', () => {
    expect(memberHintsForNeedle(MEMBERS, 'd')).toEqual([
      { key: 'Cardiology', title: 'Cardiology' },
      { key: 'Radiology', title: 'Radiology' },
      { key: 'Dermatology', title: 'Dermatology' },
    ]);
  });

  it('hides the whole list once the needle is an exact member', () => {
    expect(memberHintsForNeedle(MEMBERS, 'Cardiology')).toEqual([]);
    expect(memberHintsForNeedle(MEMBERS, 'cardiology')).toEqual([]);
  });

  it('caps the list at five matches', () => {
    expect(memberHintsForNeedle(MEMBERS, 'o')).toHaveLength(5);
  });
});
