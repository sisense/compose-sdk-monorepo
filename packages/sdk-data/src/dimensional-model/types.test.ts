/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DateLevels, MetadataTypes } from './types.js';

describe('MetadataTypes', () => {
  describe('isMeasure', () => {
    it('should fail validation for an invalid measure', () => {
      const measure = {
        name: 'Quantity',
        aggregation: 'sum',
        title: 'Total Quantity',
      };
      expect(MetadataTypes.isMeasure(measure)).toBeFalsy();
    });

    it('should fail validation for an invalid base measure', () => {
      expect(MetadataTypes.isBaseMeasure(undefined)).toBeFalsy();
      expect(MetadataTypes.isBaseMeasure(MetadataTypes.BaseMeasure)).toBeTruthy();
    });

    it('should pass validation for a valid measure', () => {
      const measure = {
        name: 'sum Revenue',
        type: 'basemeasure',
        desc: '',
        sort: 0,
        aggregation: 'sum',
        attribute: {
          name: 'Revenue',
          type: 'numeric-attribute',
          desc: '',
          expression: '[Commerce.Revenue]',
        },
      };
      expect(MetadataTypes.isMeasure(measure)).toBeTruthy();
    });
  });

  describe('isCalculatedAttribute', () => {
    const calculatedDimensionJaql = {
      type: 'calculated_dimension',
      title: 'Age & Gender',
      formula: "Concat([a], ' ', [b])",
      context: {},
    };

    it('recognizes a calculated attribute by its type (raw JAQL, serialized form, and type string)', () => {
      // raw JAQL form
      expect(MetadataTypes.isCalculatedAttribute(calculatedDimensionJaql)).toBe(true);
      // serialized / CSDK element form (carries the calculated-attribute metadata type)
      expect(
        MetadataTypes.isCalculatedAttribute({
          type: MetadataTypes.CalculatedAttribute,
          expression: 'Left([c], 5)',
          context: {},
        }),
      ).toBe(true);
      // wrapping metadata item
      expect(MetadataTypes.isCalculatedAttribute({ jaql: calculatedDimensionJaql })).toBe(true);
      // type strings
      expect(MetadataTypes.isCalculatedAttribute(MetadataTypes.CalculatedAttribute)).toBe(true);
      expect(MetadataTypes.isCalculatedAttribute('calculated_dimension')).toBe(true);
    });

    it('returns false for empty input, plain attributes, and calculated measures', () => {
      expect(MetadataTypes.isCalculatedAttribute(undefined)).toBe(false);
      expect(MetadataTypes.isCalculatedAttribute(null)).toBe(false);
      // a calculated measure (shares formula + context, but has a different type) is NOT a calculated attribute
      expect(
        MetadataTypes.isCalculatedAttribute({
          type: MetadataTypes.CalculatedMeasure,
          formula: '[a] - [b]',
          context: {},
        }),
      ).toBe(false);
      expect(MetadataTypes.isCalculatedAttribute({ formula: '[a] - [b]', context: {} })).toBe(
        false,
      );
    });

    it('is mutually exclusive with isCalculatedMeasure', () => {
      // a calculated dimension is never a (calculated) measure
      expect(MetadataTypes.isCalculatedMeasure(calculatedDimensionJaql)).toBe(false);
      expect(MetadataTypes.isMeasure(calculatedDimensionJaql)).toBe(false);
      // a genuine calculated measure is still detected and is not a calculated attribute
      const calculatedMeasureJaql = { formula: '[a] - [b]', context: {} };
      expect(MetadataTypes.isCalculatedMeasure(calculatedMeasureJaql)).toBe(true);
      expect(MetadataTypes.isCalculatedAttribute(calculatedMeasureJaql)).toBe(false);
    });
  });
});

describe('DateLevels', () => {
  describe('all', () => {
    it('should return all date levels', () => {
      const allLevels = DateLevels.all;
      expect(allLevels).toHaveLength(15);
      expect(allLevels).toContain(DateLevels.Years);
      expect(allLevels).toContain(DateLevels.Seconds);
      expect(allLevels).toContain(DateLevels.AggMinutesRoundTo1);
      expect(allLevels).toContain(DateLevels.WeekOfYear);
    });
  });

  describe('dateOnly', () => {
    it('should return only date levels', () => {
      const dateLevels = DateLevels.dateOnly;
      expect(dateLevels).toHaveLength(6);
      expect(dateLevels).toContain(DateLevels.Years);
      expect(dateLevels).toContain(DateLevels.Days);
      expect(dateLevels).toContain(DateLevels.WeekOfYear);
      expect(dateLevels).not.toContain(DateLevels.Hours);
      expect(dateLevels).not.toContain(DateLevels.Seconds);
    });
  });

  describe('timeOnly', () => {
    it('should return only time levels', () => {
      const timeLevels = DateLevels.timeOnly;
      expect(timeLevels).toHaveLength(9);
      expect(timeLevels).toContain(DateLevels.Hours);
      expect(timeLevels).toContain(DateLevels.Seconds);
      expect(timeLevels).toContain(DateLevels.AggMinutesRoundTo1);
      expect(timeLevels).not.toContain(DateLevels.Years);
      expect(timeLevels).not.toContain(DateLevels.Days);
    });
  });
});
