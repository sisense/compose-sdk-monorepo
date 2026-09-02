import { Attribute, createCalculatedAttribute } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import {
  getFilterAttributeValueType,
  getFilterEditorValueType,
} from './filter-attribute-value-type.js';

/** Builds a calculated-dimension attribute the way a CD filter deserializes from JAQL. */
function createCdAttribute(datatype?: string): Attribute {
  return createCalculatedAttribute({
    type: 'calculated_dimension',
    title: 'right([Age Range],1)',
    formula: 'right([Age Range],1)',
    ...(datatype ? { datatype } : {}),
    context: { '[Age Range]': { dim: '[Commerce.Age Range]', datatype: 'text' } },
  });
}

describe('getFilterAttributeValueType', () => {
  it('resolves regular attributes by their type', () => {
    expect(getFilterAttributeValueType(DM.Commerce.AgeRange)).toBe('text');
    expect(getFilterAttributeValueType(DM.Commerce.Revenue)).toBe('numeric');
    expect(getFilterAttributeValueType(DM.Commerce.Date.Years)).toBe('datetime');
  });

  it('resolves calculated dimensions by their data type, defaulting to text', () => {
    // `type` is the metadata kind, so it cannot be used to pick an editor
    expect(createCdAttribute('text').type).toBe('calculatedattribute');
    expect(getFilterAttributeValueType(createCdAttribute('text'))).toBe('text');
    expect(getFilterAttributeValueType(createCdAttribute('numeric'))).toBe('numeric');
    // one built in code carries no `datatype`, and text is the only type supported for a CD
    expect(getFilterAttributeValueType(createCdAttribute())).toBe('text');
  });

  it('returns null when no editor applies', () => {
    // a date CD would crash the datetime editor, which needs LevelAttribute.setGranularity
    expect(getFilterAttributeValueType(createCdAttribute('datetime'))).toBeNull();
    // an unrecognized data type is not editable, whether or not it is calculated
    expect(getFilterAttributeValueType(createCdAttribute('blob'))).toBeNull();
    expect(getFilterAttributeValueType({ type: 'blob' } as Attribute)).toBeNull();
  });

  it('keeps getFilterEditorValueType as an alias', () => {
    expect(getFilterEditorValueType(DM.Commerce.AgeRange)).toBe(
      getFilterAttributeValueType(DM.Commerce.AgeRange),
    );
  });
});
