import { describe, expect, it } from 'vitest';

import { StyledColumn } from '@/domains/visualizations/core/chart-data-options/types';

import { getSankeyNodeColorFromMap } from './sankey-node-colors.js';

const categories = [
  { column: { name: 'Gender', type: 'text', title: 'Gender Title' } },
  { column: { name: 'Condition', type: 'text' } },
] as unknown as StyledColumn[];

describe('getSankeyNodeColorFromMap', () => {
  it('resolves colors from a flat ValueToColorMap by display name', () => {
    const color = getSankeyNodeColorFromMap('0__Female', 'Female', categories, {
      Female: '#f15bb5',
      Male: '#00bbf9',
    });
    expect(color).toBe('#f15bb5');
  });

  it('resolves colors from MultiColumnValueToColorMap using the node column index', () => {
    const colorMap = {
      Gender: { Female: '#f15bb5', Male: '#00bbf9' },
      Condition: { New: '#80ed99', Used: '#ff6700' },
    };
    expect(getSankeyNodeColorFromMap('0__Female', 'Female', categories, colorMap)).toBe('#f15bb5');
    expect(getSankeyNodeColorFromMap('1__Used', 'Used', categories, colorMap)).toBe('#ff6700');
  });

  it('falls back to column title when the multi-column key uses title', () => {
    const color = getSankeyNodeColorFromMap('0__Female', 'Female', categories, {
      'Gender Title': { Female: '#abc123' },
    });
    expect(color).toBe('#abc123');
  });

  it('returns undefined when no matching entry exists', () => {
    expect(getSankeyNodeColorFromMap('0__Female', 'Female', categories, undefined)).toBeUndefined();
    expect(getSankeyNodeColorFromMap('0__Female', 'Female', categories, {})).toBeUndefined();
    expect(
      getSankeyNodeColorFromMap('0__Female', 'Female', categories, { Condition: { New: '#fff' } }),
    ).toBeUndefined();
  });
});
