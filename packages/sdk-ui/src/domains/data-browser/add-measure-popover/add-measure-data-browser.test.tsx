import { fireEvent, render } from '@testing-library/react';
import type { Mock } from 'vitest';

import { sampleEcommerceFields } from '@/__mocks__/sample-ecommerce-fields';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { AddMeasureDataBrowser } from '@/domains/data-browser/add-measure-popover/add-measure-data-browser';
import { useGetDataSourceFields } from '@/domains/data-browser/data-source-dimensional-model/hooks/use-get-data-source-fields';
import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';

vi.mock(
  '@/domains/data-browser/data-source-dimensional-model/hooks/use-get-data-source-fields',
  () => ({
    useGetDataSourceFields: vi.fn(),
  }),
);

vi.mock('@/infra/contexts/menu-provider/hooks/use-menu', () => ({
  useMenu: vi.fn(),
}));

const mockUseGetDataSourceFields = useGetDataSourceFields as Mock;
const mockUseMenu = useMenu as Mock;

const sampleECommerceDataSource = 'Sample ECommerce';
const allDataSources = [sampleECommerceDataSource];

const handleMeasureCreated = vi.fn();

describe('AddMeasureDataBrowser component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMenu.mockReturnValue({ openMenu: vi.fn() });
  });

  it('should render DataSourceSelector and DimensionsBrowser when fields are returned', () => {
    mockUseGetDataSourceFields.mockReturnValue({
      dataSourceFields: sampleEcommerceFields,
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: undefined,
      status: 'success',
    });

    const { container } = render(
      <AddMeasureDataBrowser
        dataSources={allDataSources}
        initialDataSource={sampleECommerceDataSource}
        onMeasureCreated={handleMeasureCreated}
      />,
    );

    expect(container.firstChild).toBeTruthy();
    expect(container.firstChild!.childNodes.length).toBe(3);
    expect(container.firstChild!.childNodes[0].textContent).toBe('Sample ECommerce');
    sampleEcommerceFields.forEach((field) => {
      expect(container.firstChild).toHaveTextContent(field.title);
    });
  });

  it('should render DimensionsBrowser with loading spinner when no fields are returned', () => {
    mockUseGetDataSourceFields.mockReturnValue({
      dataSourceFields: undefined,
      isLoading: true,
      isError: false,
      isSuccess: false,
      error: undefined,
      status: 'loading',
    });

    const { container } = render(
      <AddMeasureDataBrowser
        dataSources={allDataSources}
        initialDataSource={sampleECommerceDataSource}
        onMeasureCreated={handleMeasureCreated}
      />,
    );

    const dataBrowser = container.firstChild!;
    expect(dataBrowser).toBeTruthy();
    expect(dataBrowser.childNodes.length).toBe(3);
    expect(dataBrowser.childNodes[0].textContent).toBe('Sample ECommerce');
    const loadingSpinner = dataBrowser.childNodes[2];
    expect(loadingSpinner.childNodes.length).toBe(1);
    expect(loadingSpinner.firstChild!.childNodes.length).toBe(4);
  });

  it('should call onMeasureCreated when attribute is clicked', () => {
    mockUseGetDataSourceFields.mockReturnValue({
      dataSourceFields: sampleEcommerceFields,
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: undefined,
      status: 'success',
    });

    const { getByText } = render(
      <AddMeasureDataBrowser
        dataSources={allDataSources}
        initialDataSource={sampleECommerceDataSource}
        onMeasureCreated={handleMeasureCreated}
      />,
    );

    fireEvent.click(getByText(DM.Commerce.Quantity.name));

    expect(handleMeasureCreated).toHaveBeenCalledTimes(1);
    const createdMeasure = handleMeasureCreated.mock.calls[0][0];
    expect(createdMeasure).toBeDefined();
    expect(createdMeasure).toHaveProperty('aggregation');
  });

  it('should call openMenu when secondary action (more) is clicked', () => {
    mockUseGetDataSourceFields.mockReturnValue({
      dataSourceFields: sampleEcommerceFields,
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: undefined,
      status: 'success',
    });

    const mockOpenMenu = vi.fn();
    mockUseMenu.mockReturnValue({ openMenu: mockOpenMenu });

    const { getByText } = render(
      <AddMeasureDataBrowser
        dataSources={allDataSources}
        initialDataSource={sampleECommerceDataSource}
        onMeasureCreated={handleMeasureCreated}
      />,
    );

    const quantityRow = getByText(DM.Commerce.Quantity.name);
    fireEvent.mouseEnter(quantityRow);
    const moreLink = getByText('dataBrowser.more');
    fireEvent.click(moreLink);

    expect(mockOpenMenu).toHaveBeenCalledTimes(1);
    expect(mockOpenMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        position: expect.objectContaining({ left: expect.any(Number), top: expect.any(Number) }),
        alignment: { horizontal: 'left', vertical: 'top' },
        itemSections: expect.any(Array),
        onClose: expect.any(Function),
      }),
    );
  });
});
