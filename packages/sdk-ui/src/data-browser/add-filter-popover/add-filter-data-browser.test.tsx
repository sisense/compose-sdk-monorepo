import { render } from '@testing-library/react';

import { AddFilterDataBrowser } from '@/data-browser/add-filter-popover/add-filter-data-browser';
import { useGetDataSourceFields } from '@/common/hooks/fusion-endpoints/use-get-data-source-fields';
import { sampleEcommerceFields } from '@/__mocks__/sample-ecommerce-fields';
import type { Mock } from 'vitest';

// Mock only the useGetDataSourceFields hook.
vi.mock('@/common/hooks/fusion-endpoints/use-get-data-source-fields', () => {
  return {
    useGetDataSourceFields: vi.fn(),
  };
});

const mockUseGetDataSourceFields = useGetDataSourceFields as Mock;

const sampleECommerceDataSource = 'Sample ECommerce';
const allDataSources = [sampleECommerceDataSource];

const handleAttributeClick = vi.fn();

describe('AddFilterDataBrowser component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render DataSourceSelector and DimensionsBrowser when fields are returned', () => {
    // simulate the hook has returned fields
    mockUseGetDataSourceFields.mockReturnValue({
      dataSourceFields: sampleEcommerceFields,
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: undefined,
      status: 'success',
    });

    const { container } = render(
      <AddFilterDataBrowser
        dataSources={allDataSources}
        initialDataSource={sampleECommerceDataSource}
        onAttributeClick={handleAttributeClick}
      />,
    );

    expect(container.firstChild).toBeTruthy();
    // [DataSource selector, Search input, dimensions list]
    expect(container.firstChild!.childNodes.length).toBe(3);
    // find the data source selector
    expect(container.firstChild!.childNodes[0].textContent).toBe('Sample ECommerce');
    // find elements with text of the each field in sampleEcommerceFields
    sampleEcommerceFields.forEach((field) => {
      expect(container.firstChild).toHaveTextContent(field.title);
    });
  });

  it('should render DimensionsBrowser with empty dimensions when no fields are returned', () => {
    // simulate the hook is loading (i.e. no fields yet)
    mockUseGetDataSourceFields.mockReturnValue({
      dataSourceFields: undefined,
      isLoading: true,
      isError: false,
      isSuccess: false,
      error: undefined,
      status: 'loading',
    });

    const { container } = render(
      <AddFilterDataBrowser
        dataSources={allDataSources}
        initialDataSource={sampleECommerceDataSource}
        onAttributeClick={handleAttributeClick}
      />,
    );

    const dataBrowser = container.firstChild!;
    expect(dataBrowser).toBeTruthy();

    //[DataSource selector, Search input, loading-spinner]
    expect(dataBrowser.childNodes.length).toBe(3);

    // still have the data source selector
    expect(dataBrowser.childNodes[0].textContent).toBe('Sample ECommerce');

    // loading spinner is shown (1 container with 4 children - 3 dots and separate <style> element)
    const loadingSpinner = dataBrowser.childNodes[2];
    expect(loadingSpinner.childNodes.length).toBe(1);
    expect(loadingSpinner.firstChild!.childNodes.length).toBe(4);
  });
});
