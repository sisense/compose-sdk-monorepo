/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { filterFactory } from '@sisense/sdk-data';
import { fireEvent, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlDates from '@/__mocks__/data/mock-jaql-dates.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';

import { DateRangeFilterTile } from './date-range-filter-tile.js';

describe('DateRangeFilterTile', () => {
  it.skip('should render DateRangeFilterTile', async () => {
    expect.assertions(2);

    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDates)));

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years);

    const { container } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          dataSource={DM.DataSource}
          attribute={DM.Commerce.Date.Years}
          filter={dateRangeFilter}
          onChange={() => {}}
        />
      </SisenseContextProvider>,
    );

    expect(await screen.findByText('2009-01-01')).toBeInTheDocument();

    const dateButton = container.querySelector('.h-button') || container;
    fireEvent.click(dateButton);
    // TODO: fix unstable snapshot of complete DOM, rewrite test for stable validation
    expect(dateButton).toMatchSnapshot();
  });

  it('should render a DateRangeFilterTile component with jaql error', async () => {
    expect.assertions(1);

    // Set failed jaql response
    server.use(
      http.post(
        '*/api/datasources/:dataSource/jaql',
        () => new HttpResponse('Internal error', { status: 500 }),
      ),
    );

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years);

    const { findByLabelText, findByText } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          dataSource={DM.DataSource}
          attribute={DM.Commerce.Date.Years}
          filter={dateRangeFilter}
          onChange={() => {}}
        />
      </SisenseContextProvider>,
    );

    const errorBoxContainer = await findByLabelText('error-box');
    fireEvent.mouseEnter(errorBoxContainer);
    const errorBoxText = await findByText(/Error/);

    expect(errorBoxText).toBeTruthy();
  });

  it('should render a tiled version of DateRangeFilterTile', async () => {
    expect.assertions(2);

    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDates)));

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01-01');

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          dataSource={DM.DataSource}
          attribute={DM.Commerce.Date.Years}
          filter={dateRangeFilter}
          onChange={() => {}}
          tiled
        />
      </SisenseContextProvider>,
    );

    expect(await screen.findByText('From 2009-01-01')).toBeInTheDocument();

    const expandFilterButton = screen.getByLabelText('arrow-down');
    fireEvent.click(expandFilterButton);
    expect(await screen.findByLabelText('date range filter')).toBeInTheDocument();
  });

  it('should not have delete button in tiled mode by default', async () => {
    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDates)));

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01-01');

    const { queryByTestId } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          dataSource={DM.DataSource}
          attribute={DM.Commerce.Date.Years}
          filter={dateRangeFilter}
          onChange={() => {}}
          tiled={true}
        />
      </SisenseContextProvider>,
    );
    const deleteButton = queryByTestId('filter-delete-button');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should have delete button in tiled mode if onDelete is provided', async () => {
    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDates)));

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01-01');

    const { findByTestId } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          attribute={DM.Commerce.Date.Years}
          dataSource={DM.DataSource}
          filter={dateRangeFilter}
          onChange={() => {}}
          onDelete={() => {}}
          tiled={true}
        />
      </SisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should execute onDelete callback when delete button is clicked', async () => {
    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDates)));

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01-01');

    const onDelete = vi.fn();
    const { findByTestId } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          attribute={DM.Commerce.Date.Years}
          dataSource={DM.DataSource}
          filter={dateRangeFilter}
          onChange={() => {}}
          onDelete={onDelete}
          tiled={true}
        />
      </SisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalled();
  });

  it('should execute "onEdit" callback when edit button is clicked', async () => {
    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDates)));

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01-01');

    const onEditMock = vi.fn();
    const { findByTestId } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          attribute={DM.Commerce.Date.Years}
          dataSource={DM.DataSource}
          filter={dateRangeFilter}
          onChange={() => {}}
          onEdit={onEditMock}
          tiled={true}
        />
      </SisenseContextProvider>,
    );
    const editButton = await findByTestId('filter-edit-button');
    fireEvent.click(editButton);
    expect(onEditMock).toHaveBeenCalled();
  });

  it('shows menu in tile when lock action is enabled in config', async () => {
    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDates)));

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01-01');
    const config = { actions: { lockFilter: { enabled: true } } };

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          attribute={DM.Commerce.Date.Years}
          dataSource={DM.DataSource}
          filter={dateRangeFilter}
          onChange={() => {}}
          tiled
          config={config}
        />
      </SisenseContextProvider>,
    );

    expect(await screen.findByLabelText('Filter tile menu')).toBeInTheDocument();
  });

  it('renders linked indicator and disables controls when linked to a FilterWidget', async () => {
    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDates)));

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01-01');

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          attribute={DM.Commerce.Date.Years}
          dataSource={DM.DataSource}
          filter={dateRangeFilter}
          onChange={() => {}}
          onDelete={vi.fn()}
          tiled
          linked
        />
      </SisenseContextProvider>,
    );

    expect(await screen.findByTestId('filter-tile-linked-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('filter-delete-button')).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Enable/disable filter' })).toBeDisabled();
    // The expand toggle is disabled too — a linked tile can never reach its own editable
    // From/To buttons through the collapsed display in this arrangement (vertical, gated by
    // `FilterTileContainer`'s own `disabled={linked}` on the arrow). The non-tiled branch
    // below has no such gate, which is what the next test exercises instead.
    expect(screen.getByRole('button', { name: 'arrow-down' })).toBeDisabled();
  });

  it('disables the editable From/To buttons when linked to a FilterWidget (non-tiled — no collapse gate)', async () => {
    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDates)));

    const dateRangeFilter = filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01-01');

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DateRangeFilterTile
          title="Date Range"
          attribute={DM.Commerce.Date.Years}
          dataSource={DM.DataSource}
          filter={dateRangeFilter}
          onChange={() => {}}
          linked
        />
      </SisenseContextProvider>,
    );

    // CodeRabbit review finding: this branch renders straight to `EditableDateRangeFilter`
    // with no `FilterTileContainer` collapse gate in front of it, so it was the one place a
    // linked filter's date buttons stayed genuinely reachable and clickable.
    const dateButtons = await screen.findAllByLabelText('DateRangeFieldButton');
    expect(dateButtons).toHaveLength(2);
    dateButtons.forEach((button) => expect(button).toBeDisabled());
  });
});
