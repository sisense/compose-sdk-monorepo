/** @vitest-environment jsdom */
import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlAgeRange from '@/__mocks__/data/mock-jaql-age-range.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '@/props';
import { useDataSourceLabelResolver } from '@/shared/hooks/use-data-source-label-resolver';

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

  it('should render existing top ranking filter in condition section', async () => {
    const rankingFilter = filterFactory.topRanking(
      DM.Commerce.AgeRange,
      measureFactory.sum(DM.Commerce.Revenue),
      5,
    );
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorPopover
          filter={rankingFilter}
          position={{ anchorEl: document.body }}
          defaultDataSource={DM.DataSource}
          dataSources={[DM.DataSource]}
        />
      </SisenseContextProvider>,
    );
    expect(await screen.findByLabelText('Ranking count input')).toHaveValue(5);
    expect(screen.queryByLabelText('Not supported section')).not.toBeInTheDocument();
  });

  it('should honor an explicitly empty dataSources list', async () => {
    const rankingFilter = filterFactory.topRanking(
      DM.Commerce.AgeRange,
      measureFactory.sum(DM.Commerce.Revenue),
      5,
    );
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorPopover
          filter={rankingFilter}
          position={{ anchorEl: document.body }}
          defaultDataSource={DM.DataSource}
          dataSources={[]}
        />
      </SisenseContextProvider>,
    );

    expect(await screen.findByLabelText('Select ranked by measure')).toBeDisabled();
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

  describe('data source label in header', () => {
    // Display names are cached per Sisense URL, so each test uses its own URL
    let testIndex = 0;
    // Shares the display names query with the header. Once it shows its display name,
    // the loaded display names have reached every consumer, including the header.
    const probeDataSource = 'Probe Data Source';
    const DisplayNamesLoadedProbe = () => (
      <span data-testid="display-names-probe">{useDataSourceLabelResolver()(probeDataSource)}</span>
    );
    const waitForDisplayNames = () =>
      waitFor(() => expect(screen.getByTestId('display-names-probe')).toHaveTextContent('loaded'));

    const renderWithDisplayName = (displayName: string | null) => {
      testIndex += 1;
      server.use(
        http.get('*/api/datasources/', () =>
          HttpResponse.json([
            {
              title: DM.DataSource,
              fullname: `localhost/${DM.DataSource}`,
              live: false,
              displayName,
            },
            {
              title: probeDataSource,
              fullname: `localhost/${probeDataSource}`,
              live: false,
              displayName: 'loaded',
            },
          ]),
        ),
      );
      return setup(
        <SisenseContextProvider {...contextProviderProps} url={`http://fake-url-${testIndex}/`}>
          <FilterEditorPopover
            filter={filter}
            position={{ anchorEl: document.body }}
            defaultDataSource={''}
          />
          <DisplayNamesLoadedProbe />
        </SisenseContextProvider>,
      );
    };

    it('should show the data source display name', async () => {
      renderWithDisplayName('Online Store');

      const headerDatasource = await screen.findByTestId('filter-editor-popover-header-datasource');
      await waitFor(() => expect(headerDatasource).toHaveTextContent('Online Store'));
    });

    it('should show the data source title when the display name is missing', async () => {
      renderWithDisplayName(null);
      await waitForDisplayNames();

      const headerDatasource = screen.getByTestId('filter-editor-popover-header-datasource');
      expect(headerDatasource).toHaveTextContent(DM.DataSource);
    });

    it('should render a hostile display name as plain text', async () => {
      const hostile = '<img src=x onerror="alert(1)">';
      renderWithDisplayName(hostile);

      const headerDatasource = await screen.findByTestId('filter-editor-popover-header-datasource');
      await waitFor(() => expect(headerDatasource).toHaveTextContent(hostile));
      expect(headerDatasource.querySelector('img')).toBeNull();
    });

    it('should refresh a stale display name when the popover opens again', async () => {
      testIndex += 1;
      let displayName = 'Online Store';
      const onRequest = vi.fn(() =>
        HttpResponse.json([
          {
            title: DM.DataSource,
            fullname: `localhost/${DM.DataSource}`,
            live: false,
            displayName,
          },
        ]),
      );
      server.use(http.get('*/api/datasources/', onRequest));
      const url = `http://fake-url-${testIndex}/`;
      const renderPopover = (filterToEdit: typeof filter | null) => (
        <SisenseContextProvider {...contextProviderProps} url={url}>
          <FilterEditorPopover
            filter={filterToEdit}
            position={{ anchorEl: document.body }}
            defaultDataSource={''}
          />
        </SisenseContextProvider>
      );

      const { rerender } = setup(renderPopover(filter));
      const headerDatasource = await screen.findByTestId('filter-editor-popover-header-datasource');
      await waitFor(() => expect(headerDatasource).toHaveTextContent('Online Store'));

      rerender(renderPopover(null));
      expect(screen.queryByTestId('filter-editor-popover-header-datasource')).toBeNull();

      displayName = 'Renamed Store';
      const loadedAt = Date.now();
      const dateNow = vi.spyOn(Date, 'now').mockReturnValue(loadedAt + 61_000);
      try {
        rerender(renderPopover(filter));

        await waitFor(() =>
          expect(screen.getByTestId('filter-editor-popover-header-datasource')).toHaveTextContent(
            'Renamed Store',
          ),
        );
        expect(onRequest).toHaveBeenCalledTimes(2);
      } finally {
        dateNow.mockRestore();
      }
    });
  });
});
