/** @vitest-environment jsdom */
import { filterFactory } from '@sisense/sdk-data';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlAgeRange from '@/__mocks__/data/mock-jaql-age-range.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '@/props';

import { FilterEditorPopover } from './filter-editor-popover.js';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18']);

describe('FilterEditorPopover', () => {
  beforeEach(() => {
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );
  });
  it('should render filter editor popover', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorPopover
          filter={filter}
          position={{ anchorEl: document.body }}
          defaultDataSource={''}
        />
      </SisenseContextProvider>,
    );
    const filterEditorPopover = await screen.findByLabelText('Filter editor popover');
    expect(filterEditorPopover).toBeInTheDocument();
  });

  it('should contain valid filter information in header', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorPopover
          filter={filter}
          position={{ anchorEl: document.body }}
          defaultDataSource={''}
        />
      </SisenseContextProvider>,
    );
    const headerAttribute = await screen.findByTestId('filter-editor-popover-header-attribute');
    const headerDatasource = await screen.findByTestId('filter-editor-popover-header-datasource');
    expect(headerAttribute).toHaveTextContent(filter.attribute.title);
    expect(headerDatasource).toHaveTextContent(filter.attribute.dataSource!.title);
  });

  it('should execute "onChange" callback when apply button is clicked', async () => {
    const onChangeMock = vi.fn();
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorPopover
          filter={filter}
          position={{ anchorEl: document.body }}
          onChange={onChangeMock}
          defaultDataSource={''}
        />
      </SisenseContextProvider>,
    );
    const applyButton = await screen.findByText('Apply');
    await user.click(applyButton);
    expect(onChangeMock).toHaveBeenCalled();
  });

  it('should execute "onClose" callback when cancel button is clicked', async () => {
    const onCloseMock = vi.fn();
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorPopover
          filter={filter}
          position={{ anchorEl: document.body }}
          onClose={onCloseMock}
          defaultDataSource={''}
        />
      </SisenseContextProvider>,
    );
    const cancelButton = await screen.findByText('Cancel');
    await user.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalled();
  });
});
