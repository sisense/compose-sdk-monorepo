import { fireEvent, render } from '@testing-library/react';
import { UnsupportedFilterTile } from './unsupported-filter-tile';
import { Filter } from '@sisense/sdk-data';
import { mockUrl, mockToken } from '@/__mocks__/msw';
import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { SisenseContextProviderProps } from '@/props';

const filter = {
  attribute: { name: 'mockAttribute' },
  disabled: false,
} as Filter;

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

describe('UnsupportedFilterTile', () => {
  it('should render a UnsupportedFilterTile component', async () => {
    const { getByText } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <UnsupportedFilterTile filter={filter} />
      </MockedSisenseContextProvider>,
    );
    expect(getByText('mockAttribute')).toBeInTheDocument();
  });

  it('should not have a delete button by default', async () => {
    const { queryByTestId } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <UnsupportedFilterTile filter={filter} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = queryByTestId('filter-delete-button');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should render a UnsupportedFilterTile with delete button', async () => {
    const { findByTestId } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <UnsupportedFilterTile filter={filter} onDelete={() => {}} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const { findByTestId } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <UnsupportedFilterTile filter={filter} onDelete={onDelete} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalled();
  });
});
