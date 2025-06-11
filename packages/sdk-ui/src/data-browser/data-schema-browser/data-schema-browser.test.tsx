import { render } from '@testing-library/react';

import { DataSchemaBrowser } from '@/data-browser/data-schema-browser/data-schema-browser';
import { sampleEcommerceFields } from '@/__mocks__/sample-ecommerce-fields';
import { getDimensionsFromDataSourceFields } from '@sisense/sdk-data';

const sampleEcommerceDimensions = getDimensionsFromDataSourceFields(
  sampleEcommerceFields,
  'Sample ECommerce',
);

describe('DataSchemaBrowser component', () => {
  it('should render SearchInput and DimensionsBrowser when fields are provided', () => {
    const { container } = render(
      <DataSchemaBrowser dimensions={sampleEcommerceDimensions} collapseAll={false} />,
    );

    expect(container.firstChild).toBeTruthy();
    // [Search input, dimensions browser]
    expect(container.firstChild!.childNodes.length).toBe(2);

    // Check that some sample field titles are present in the document
    sampleEcommerceFields.slice(0, 3).forEach((field) => {
      expect(container.firstChild).toHaveTextContent(field.title);
    });
  });
});
