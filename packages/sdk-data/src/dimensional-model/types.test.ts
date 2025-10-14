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
});

describe('DateLevels', () => {
  describe('all', () => {
    it('should return all date levels', () => {
      const allLevels = DateLevels.all;
      expect(allLevels).toHaveLength(14);
      expect(allLevels).toContain(DateLevels.Years);
      expect(allLevels).toContain(DateLevels.Seconds);
      expect(allLevels).toContain(DateLevels.AggMinutesRoundTo1);
    });
  });

  describe('dateOnly', () => {
    it('should return only date levels', () => {
      const dateLevels = DateLevels.dateOnly;
      expect(dateLevels).toHaveLength(5);
      expect(dateLevels).toContain(DateLevels.Years);
      expect(dateLevels).toContain(DateLevels.Days);
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
