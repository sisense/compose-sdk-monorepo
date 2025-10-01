/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as jaqlDates from '@/__mocks__/data/mock-jaql-dates.json';

import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { filterFactory } from '@ethings-os/sdk-data';
import { fireEvent, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { DateRangeFilterTile } from './date-range-filter-tile';

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
});
