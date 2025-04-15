import { sampleEcommerceFields } from './__mocks__/sample-ecommerce-fields.js';
import { getDimensionsFromDataSourceFields } from './utils.js';

describe('getDimensionsFromDataSourceFields', () => {
  it('should return a list of dimensions', () => {
    const result = getDimensionsFromDataSourceFields(sampleEcommerceFields, 'Sample ECommerce');
    expect(result).toMatchSnapshot();
  });
});
