/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { MetadataTypes } from './types';
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
