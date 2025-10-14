/** @vitest-environment jsdom */
import { filterFactory } from '@sisense/sdk-data';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlAgeRange from '@/__mocks__/data/mock-jaql-age-range.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProviderProps } from '@/props';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';

import { FilterEditor } from './filter-editor';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

describe('FilterEditor', () => {
  beforeEach(() => {
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );
  });

  it('should render filter editor for text attribute filter', async () => {
    const filterChangeHandler = vi.fn();
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditor
          filter={filterFactory.members(DM.Commerce.AgeRange, [])}
          onChange={filterChangeHandler}
          defaultDataSource={''}
        />
      </SisenseContextProvider>,
    );
    const filterEditor = await screen.findByLabelText('Filter editor textual');
    expect(filterEditor).toBeInTheDocument();
  });

  it('should render filter editor for numeric attribute filter', async () => {
    const filterChangeHandler = vi.fn();
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditor
          filter={filterFactory.members(DM.Commerce.Quantity, [])}
          onChange={filterChangeHandler}
          defaultDataSource={''}
        />
      </SisenseContextProvider>,
    );
    const filterEditor = await screen.findByLabelText('Filter editor numerical');
    expect(filterEditor).toBeInTheDocument();
  });
});
