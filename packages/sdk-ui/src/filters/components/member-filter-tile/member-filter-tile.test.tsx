import type { SisenseContextProviderProps } from '@/index';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import * as jaqlAgeRange from '@/__mocks__/data/mock-jaql-age-range.json';
import * as jaqlCategoryId from '@/__mocks__/data/mock-jaql-category-id.json';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { filterFactory, type MembersFilter } from '@sisense/sdk-data';
import { fireEvent, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemberFilterTile } from './member-filter-tile';
import { expect } from 'vitest';

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

  it('should render a MemberFilterTile component with excluded members', async () => {
    expect.assertions(3);

    // Rendering a MemberFilterTile requires 3 fetches
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );

    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(
      DM.Commerce.AgeRange,
      ['0-18', '65+'],
      true,
    ) as MembersFilter;
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
    const filter = filterFactory.members(
      DM.Commerce.AgeRange,
      ['0-18'],
      undefined,
      undefined,
      undefined,
      undefined,
      false,
    ) as MembersFilter;
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

    // check that radio buttons are rendered
    const radio = container.querySelectorAll('input[type="radio"]');
    expect(radio.length).toBe(jaqlAgeRange.values.length);

    // select second radio button
    if (radio[1] && radio[1].parentElement) fireEvent.click(radio[1].parentElement);
    if (arrow) fireEvent.click(arrow);

    // check that only one selected pill is rendered and it is the second one
    const pills = container.querySelectorAll('main button');
    expect(pills.length).toBe(1);
    expect(pills[0].textContent).toBe(jaqlAgeRange.values[1][0].text);
  });

  it('should render a MemberFilterTile component with jaql error', async () => {
    expect.assertions(1);

    // Set failed jaql response
    server.use(
      http.post(
        '*/api/datasources/:dataSource/jaql',
        () => new HttpResponse('Internal error', { status: 500 }),
      ),
    );

    const filterTitle = 'Member Filter Title';
    const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '65+']) as MembersFilter;
    const { findByLabelText, findByText } = render(
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

    const errorBoxContainer = await findByLabelText('error-box');
    fireEvent.mouseEnter(errorBoxContainer);
    const errorBoxText = await findByText(/Error/);

    expect(errorBoxText).toBeTruthy();
  });
});
