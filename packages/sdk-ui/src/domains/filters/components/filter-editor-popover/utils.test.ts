import {
  Attribute,
  createCalculatedAttribute,
  filterFactory,
  isRankingFilter,
  measureFactory,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { getFilterEditorValueType, isSupportedByFilterEditor } from './utils.js';

/** Builds a calculated-dimension attribute the way a Fusion-created CD filter deserializes. */
function createCdAttribute(datatype?: string): Attribute {
  return createCalculatedAttribute({
    type: 'calculated_dimension',
    title: 'right([Age Range],1)',
    formula: 'right([Age Range],1)',
    ...(datatype ? { datatype } : {}),
    context: { '[Age Range]': { dim: '[Commerce.Age Range]', datatype: 'text' } },
  });
}

describe('filter-editor-popover utils', () => {
  it('supports ranking filters in the filter editor', () => {
    const measure = measureFactory.sum(DM.Commerce.Revenue);
    const filter = filterFactory.topRanking(DM.Commerce.AgeRange, measure, 5);

    expect(isRankingFilter(filter)).toBe(true);
    expect(isSupportedByFilterEditor(filter)).toBe(true);
  });

  describe('getFilterEditorValueType', () => {
    it('resolves regular attributes by their type', () => {
      expect(getFilterEditorValueType(DM.Commerce.AgeRange)).toBe('text');
      expect(getFilterEditorValueType(DM.Commerce.Revenue)).toBe('numeric');
      expect(getFilterEditorValueType(DM.Commerce.Date.Years)).toBe('datetime');
    });

    it('resolves calculated dimensions by their data type, defaulting to text', () => {
      // `type` is the metadata kind, so it cannot be used to pick an editor
      expect(createCdAttribute('text').type).toBe('calculatedattribute');
      expect(getFilterEditorValueType(createCdAttribute('text'))).toBe('text');
      expect(getFilterEditorValueType(createCdAttribute('numeric'))).toBe('numeric');
      // one built in code carries no `datatype`, and text is the only type supported for a CD
      expect(getFilterEditorValueType(createCdAttribute())).toBe('text');
    });

    it('returns null when no editor applies', () => {
      // a date CD would crash the datetime editor, which needs LevelAttribute.setGranularity
      expect(getFilterEditorValueType(createCdAttribute('datetime'))).toBeNull();
      // an unrecognized data type is not editable, whether or not it is calculated
      expect(getFilterEditorValueType(createCdAttribute('blob'))).toBeNull();
      expect(getFilterEditorValueType({ type: 'blob' } as Attribute)).toBeNull();
    });
  });
});
