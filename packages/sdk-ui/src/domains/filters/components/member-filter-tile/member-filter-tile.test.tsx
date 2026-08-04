import { attributeFactory, filterFactory, type MembersFilter } from '@sisense/sdk-data';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { expect } from 'vitest';

import * as jaqlAgeRange from '@/__mocks__/data/mock-jaql-age-range.json';
import * as jaqlCategoryId from '@/__mocks__/data/mock-jaql-category-id.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { SisenseContextProviderProps } from '@/index';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';

import { MemberFilterTile } from './member-filter-tile.js';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

describe('MemberFilterTile', () => {
  it('should render a MemberFilterTile component', async () => {
    expect.assertions(3);

    // Rendering a MemberFilterTile requires 3 fetches
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );

    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '65+']) as MembersFilter;
    render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.AgeRange}
          filter={filter}
          onChange={() => {}}
        />
      </SisenseContextProvider>,
    );

    expect(await screen.findByText(filterTitle)).toBeInTheDocument();

    await Promise.all(
      filter.members.map(async (member: string) =>
        expect(await screen.findByText(member)).toBeInTheDocument(),
      ),
    );
  });

  it('does not render normally for a calculated dimension (filters unsupported)', async () => {
    // A calculated dimension cannot back a filter; the tile must surface an error
    // (via the data-layer guard) instead of rendering its normal content.
    const calcDim = attributeFactory.customFormula('Bucket', "IF([rev] > 1000, 'A', 'B')", {
      rev: DM.Commerce.Revenue,
    });
    const filterTitle = 'Calc Dim Filter';

    render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={calcDim}
          filter={null}
          onChange={() => {}}
        />
      </SisenseContextProvider>,
    );

    // The normal tile content (its title) must not be rendered.
    expect(screen.queryByText(filterTitle)).not.toBeInTheDocument();
    expect(await screen.findByLabelText('error-box')).toBeInTheDocument();
  });

  it('should render a MemberFilterTile component with excluded members', async () => {
    expect.assertions(3);

    // Rendering a MemberFilterTile requires 3 fetches
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );

    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '65+'], {
      guid: 'id-123',
      excludeMembers: true,
    }) as MembersFilter;
    render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.AgeRange}
          filter={filter}
          onChange={() => {}}
        />
      </SisenseContextProvider>,
    );

    expect(await screen.findByText(filterTitle)).toBeInTheDocument();

    await Promise.all(
      filter.members.map(async (member: string) =>
        expect(await screen.findByText(member)).toBeInTheDocument(),
      ),
    );
  });

  it('should render a MemberFilterTile component with numeric attribute', async () => {
    expect.assertions(3);

    // Rendering a MemberFilterTile requires 3 fetches
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlCategoryId)),
    );

    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.CategoryID, ['1', '2']) as MembersFilter;
    render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.CategoryID}
          filter={filter}
          onChange={() => {}}
        />
      </SisenseContextProvider>,
    );

    expect(await screen.findByText(filterTitle)).toBeInTheDocument();

    await Promise.all(
      filter.members.map(async (member: string) =>
        expect(await screen.findByText(member)).toBeInTheDocument(),
      ),
    );
  });

  it('should render a MemberFilterTile component with disabled multiSelection', async () => {
    // Rendering a MemberFilterTile requires 3 fetches
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );

    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], {
      guid: 'id-123',
      enableMultiSelection: false,
    }) as MembersFilter;
    const { container } = render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.AgeRange}
          filter={filter}
          onChange={() => {}}
        />
      </SisenseContextProvider>,
    );

    expect(await screen.findByText(filterTitle)).toBeInTheDocument();

    // open members list
    const arrow = container.querySelector('header svg');
    if (arrow) fireEvent.click(arrow);

    // With allowMissingMembers the list briefly contains only the selected member
    // before JAQL returns. Wait until all queried members are present — asserting
    // radio count too early flakes under CI load (1 instead of all members).
    await waitFor(() => {
      expect(container.querySelectorAll('input[type="radio"]').length).toBe(
        jaqlAgeRange.values.length,
      );
    });

    const radio = container.querySelectorAll('input[type="radio"]');

    // select second radio button
    if (radio[1] && radio[1].parentElement) fireEvent.click(radio[1].parentElement);
    if (arrow) fireEvent.click(arrow);

    // check that only one selected pill is rendered and it is the second one
    const pills = container.querySelectorAll('main button');
    expect(pills.length).toBe(1);
    expect(pills[0].textContent).toBe(jaqlAgeRange.values[1][0].text);
  });

  // Regression test: when the members query fails (e.g. for a
  // cascading filter level whose dimension is missing from the data model), the
  // tile must surface the error gracefully. Two `useCallback` hooks used to be
  // declared *after* an `if (isError) return` early return, so flipping into the
  // error state skipped them and React threw "Rendered fewer hooks than expected".
  // The error is now shown in a contained error box while the tile keeps its header.
  it('should surface the query error in a contained error box without crashing', async () => {
    // Set failed jaql response
    server.use(
      http.post(
        '*/api/datasources/:dataSource/jaql',
        () => new HttpResponse('Internal error', { status: 500 }),
      ),
    );

    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '65+']) as MembersFilter;
    render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.AgeRange}
          filter={filter}
          onChange={() => {}}
        />
      </SisenseContextProvider>,
    );

    // The tile renders a contained error box and keeps its header, rather than
    // crashing (a thrown hooks-order error would replace the whole tile).
    const errorBox = await screen.findByLabelText('error-box');
    expect(screen.getByText(filterTitle)).toBeInTheDocument();

    fireEvent.mouseEnter(errorBox);
    expect(errorBox.textContent ?? '').not.toMatch(/Rendered fewer hooks|early return statement/i);
  });

  it('should not have a delete button by default', async () => {
    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '65+']) as MembersFilter;
    const { queryByTestId } = render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.AgeRange}
          filter={filter}
          onChange={() => {}}
        />
      </SisenseContextProvider>,
    );
    const deleteButton = queryByTestId('filter-delete-button');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should render a MemberFilterTile with delete button', async () => {
    // Rendering a MemberFilterTile requires 3 fetches
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );
    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '65+']) as MembersFilter;
    const { findByTestId } = render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.AgeRange}
          filter={filter}
          onChange={() => {}}
          onDelete={() => {}}
        />
      </SisenseContextProvider>,
    );

    const deleteButton = await findByTestId('filter-delete-button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    // Rendering a MemberFilterTile requires 3 fetches
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );
    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '65+']) as MembersFilter;
    const onDelete = vi.fn();
    const { findByTestId } = render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.AgeRange}
          filter={filter}
          onChange={() => {}}
          onDelete={onDelete}
        />
      </SisenseContextProvider>,
    );

    const deleteButton = await findByTestId('filter-delete-button');
    if (deleteButton) fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
  });

  it('should call "onEdit" when edit button is clicked', async () => {
    // Rendering a MemberFilterTile requires 3 fetches
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );
    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '65+']) as MembersFilter;
    const onEditMock = vi.fn();
    const { findByTestId } = render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.AgeRange}
          filter={filter}
          onChange={() => {}}
          onEdit={onEditMock}
        />
      </SisenseContextProvider>,
    );

    const editButton = await findByTestId('filter-edit-button');
    if (editButton) fireEvent.click(editButton);

    expect(onEditMock).toHaveBeenCalled();
  });

  it('shows menu in tile when lock action is enabled in config', async () => {
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );
    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '65+']) as MembersFilter;
    const config = { actions: { lockFilter: { enabled: true } } };
    render(
      <SisenseContextProvider {...contextProviderProps}>
        <MemberFilterTile
          title={filterTitle}
          dataSource={'Some datasource'}
          attribute={DM.Commerce.AgeRange}
          filter={filter}
          onChange={() => {}}
          config={config}
        />
      </SisenseContextProvider>,
    );
    expect(await screen.findByLabelText('Filter tile menu')).toBeInTheDocument();
  });
});
