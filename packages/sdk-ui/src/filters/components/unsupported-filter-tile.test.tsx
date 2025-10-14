import { Filter } from '@sisense/sdk-data';
import { fireEvent, render } from '@testing-library/react';

import { mockToken, mockUrl } from '@/__mocks__/msw';
import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { SisenseContextProviderProps } from '@/props';

import { UnsupportedFilterTile } from './unsupported-filter-tile';

const filter = {
  attribute: { name: 'mockAttribute' },
  config: { disabled: false },
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

  it('should call "onEdit" when edit button is clicked', async () => {
    const onEditMock = vi.fn();
    const { findByTestId } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <UnsupportedFilterTile filter={filter} onEdit={onEditMock} />
      </MockedSisenseContextProvider>,
    );
    const editButton = await findByTestId('filter-edit-button');
    fireEvent.click(editButton);
    expect(onEditMock).toHaveBeenCalled();
  });
});
