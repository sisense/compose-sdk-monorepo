/** @vitest-environment jsdom */
import { filterFactory } from '@sisense/sdk-data';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlDateYears from '@/__mocks__/data/mock-jaql-date-years.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '@/props';

import { FilterEditorDatetime } from './filter-editor-datetime.js';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
  defaultDataSource: 'Sample ECommerce',
};

describe('FilterEditorDatetime', () => {
  const filterChangeHandlerMock = vi.fn();
  const includeAllFilter = filterFactory.members(DM.Commerce.Date.Years, []);

  beforeEach(() => {
    filterChangeHandlerMock.mockClear();
    server.use(
      http.post('*/api/datasources/Sample%20ECommerce/jaql', () =>
        HttpResponse.json(jaqlDateYears),
      ),
    );
  });

  it('should render filter editor', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorDatetime filter={includeAllFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const filterEditor = await screen.findByLabelText('Filter editor datetime');
    expect(filterEditor).toBeInTheDocument();
  });

  it('should display the "include all" initial filter', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorDatetime filter={includeAllFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const includeAllSection = await screen.findByLabelText('Include all section');
    const sectionSelectButton =
      within(includeAllSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();
  });

  it('should display the "members" initial filter', async () => {
    const membersFilter = filterFactory.members(DM.Commerce.Date.Years, [
      '2013-01-01T00:00:00',
      '2012-01-01T00:00:00',
    ]);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorDatetime filter={membersFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const membersSection = await screen.findByLabelText('Members section');
    const sectionSelectButton =
      within(membersSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const membersSelect = await within(membersSection).findByLabelText('Searchable multi-select');
    const selectedValue = (await within(membersSelect).findByLabelText('Value')).textContent;
    expect(selectedValue).toBe('2013, 2012');
  });

  it('should display the "relative" initial filter', async () => {
    const betweenFilter = filterFactory.dateRelativeTo(DM.Commerce.Date.Years, 1, 1);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorDatetime filter={betweenFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const relativeSection = await screen.findByLabelText('Datetime relative section');
    const sectionSelectButton =
      within(relativeSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const typeSelect = await within(relativeSection).findByLabelText('Type');
    const countInput = await within(relativeSection).findByLabelText('Count');
    const granularitySelect = await within(relativeSection).findByLabelText('Granularity');
    const includeCurrentCheckbox = await within(relativeSection).findByLabelText(
      'Including current',
    );

    const typeValue = (await within(typeSelect).findByLabelText('Value')).textContent;
    const granularityValue = (await within(granularitySelect).findByLabelText('Value')).textContent;

    expect(typeValue).toBe('Last');
    expect(countInput).toHaveValue(1);
    expect(granularityValue).toBe('Year');
    expect(includeCurrentCheckbox).not.toBeChecked();
  });

  it('should change filter to "include all" one', async () => {
    const initialFilter = filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']);
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorDatetime filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const includeAllSection = await screen.findByLabelText('Include all section');
    const selectButton =
      within(includeAllSection).getByLabelText<HTMLInputElement>('Select button');
    await user.click(selectButton);
    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.members(DM.Commerce.Date.Years, [], {
        guid: initialFilter.config?.guid,
        disabled: false,
        locked: false,
        excludeMembers: false,
        enableMultiSelection: true,
        deactivatedMembers: [],
      }),
    );
  });
});
