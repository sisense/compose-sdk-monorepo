import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { CascadingFilter, filterFactory } from '@sisense/sdk-data';
import { SisenseContextProviderProps } from '@/index';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import * as jaqlAgeRange from '@/__mocks__/data/mock-jaql-age-range.json';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { CascadingFilterTile } from './cascading-filter-tile';
import { setTimeout } from 'timers/promises';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  defaultDataSource: 'Sample ECommerce',
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

describe('CascadingFilterTile', () => {
  let cascadingFilter: CascadingFilter;
  beforeEach(() => {
    server.resetHandlers();
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );
    const topFilter = filterFactory.members(DM.Commerce.Gender, ['Unspecified']);
    const bottomFilter = filterFactory.members(DM.Commerce.AgeRange, ['0-18']);

    cascadingFilter = new CascadingFilter([topFilter, bottomFilter]);
  });
  it('should render a CascadingFilterTile component', async () => {
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );

    render(
      <SisenseContextProvider {...contextProviderProps}>
        <CascadingFilterTile filter={cascadingFilter} onChange={() => {}} />
      </SisenseContextProvider>,
    );

    await setTimeout(250);

    await Promise.all(
      cascadingFilter.filters.map(async (filter) =>
        expect(await screen.findByText(filter.attribute.name)).toBeInTheDocument(),
      ),
    );
  });

  it('should render a locked CascadingFilterTile component', async () => {
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );

    const config = { locked: true };
    const topFilter = filterFactory.members(DM.Commerce.Gender, ['Unspecified'], {
      ...config,
      guid: 'member1',
    });
    const bottomFilter = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], {
      ...config,
      guid: 'member2',
    });
    const lockedCascadingFilter = new CascadingFilter([topFilter, bottomFilter], {
      ...config,
      guid: 'cascading1',
    });

    const { container } = render(
      <SisenseContextProvider {...contextProviderProps}>
        <CascadingFilterTile filter={lockedCascadingFilter} onChange={() => {}} />
      </SisenseContextProvider>,
    );

    await Promise.all(
      cascadingFilter.filters.map(async (filter) =>
        expect(await screen.findByText(filter.attribute.name)).toBeInTheDocument(),
      ),
    );
    expect(container).toMatchSnapshot();
  });

  it('should be able to disable whole cascading filter', async () => {
    let updatedFilter: CascadingFilter | undefined;
    render(
      <SisenseContextProvider {...contextProviderProps}>
        <CascadingFilterTile
          filter={cascadingFilter}
          onChange={(newCascadingFilter) => {
            updatedFilter = newCascadingFilter as CascadingFilter;
          }}
        />
      </SisenseContextProvider>,
    );

    // disable filter with toggle
    const toggle = await screen.findByRole('switch');
    toggle.click();
    // check if cascading filter and all internal filters are disabled
    expect(updatedFilter && updatedFilter.config.disabled).toBe(true);
    updatedFilter!.filters.forEach((filter) => {
      expect(filter.config.disabled).toBe(true);
    });
  });
});
