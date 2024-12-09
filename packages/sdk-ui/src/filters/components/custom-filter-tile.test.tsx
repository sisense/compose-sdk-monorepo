import { fireEvent, render } from '@testing-library/react';
import { CustomFilterTile } from './custom-filter-tile';
import { Filter } from '@sisense/sdk-data';
import { SisenseContextProviderProps } from '@/props';
import { mockToken, mockUrl } from '@/__mocks__/msw';
import { MockedSisenseContextProvider } from '@/__test-helpers__';

const filter = {
  attribute: { name: 'mockAttribute' },
  jaql: () => ({ jaql: { filter: 'mockJaql' } }),
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

describe('CustomFilterTile', () => {
  it('should render a CustomFilterTile component', async () => {
    const { getByText } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <CustomFilterTile filter={filter} onUpdate={() => {}} />
      </MockedSisenseContextProvider>,
    );
    expect(getByText('mockAttribute')).toBeInTheDocument();
  });

  it('should show filter jaql in expanded state', async () => {
    const { getByText, getByTestId } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <CustomFilterTile
          filter={filter}
          onUpdate={() => {}}
          tileDesignOptions={{ header: { isCollapsible: true } }}
        />
      </MockedSisenseContextProvider>,
    );
    const button = getByTestId('expand-collapse-button');
    fireEvent.click(button);
    expect(getByText('"mockJaql"')).toBeInTheDocument();
  });

  it('should not have a delete button by default', async () => {
    const { queryByTestId } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <CustomFilterTile filter={filter} onUpdate={() => {}} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = queryByTestId('filter-delete-button');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should render a CustomFilterTile with delete button', async () => {
    const { findByTestId } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <CustomFilterTile filter={filter} onUpdate={() => {}} onDelete={() => {}} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const { findByTestId } = render(
      <MockedSisenseContextProvider {...contextProviderProps}>
        <CustomFilterTile filter={filter} onUpdate={() => {}} onDelete={onDelete} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalled();
  });
});
