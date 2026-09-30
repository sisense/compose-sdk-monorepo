/** @vitest-environment jsdom */
import type { Filter } from '@sisense/sdk-data';
import { DateLevels, DateOperators, filterFactory } from '@sisense/sdk-data';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlDateYears from '@/__mocks__/data/mock-jaql-date-years.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';
import type { SisenseContextProviderProps } from '@/props';

import { FilterEditorContextProvider } from './filter-editor-context.js';
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

  const findSectionRadio = async (sectionLabel: string) =>
    within(await screen.findByLabelText(sectionLabel)).getByLabelText<HTMLInputElement>(
      'Select button',
    );

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

  describe('sections', () => {
    const renderEditor = (filter: Filter) =>
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditorDatetime filter={filter} onChange={filterChangeHandlerMock} />
        </SisenseContextProvider>,
      );

    it('should display the "range" initial filter', async () => {
      renderEditor(filterFactory.dateRange(DM.Commerce.Date.Days, '2013-01-01', '2013-12-31'));

      expect((await findSectionRadio('Datetime range section')).checked).toBeTruthy();
      expect((await findSectionRadio('Datetime relative section')).checked).toBeFalsy();
    });

    it('should display the "exclude" initial filter in the condition section', async () => {
      renderEditor(
        filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00'], {
          excludeMembers: true,
        }),
      );

      expect((await findSectionRadio('Datetime condition section')).checked).toBeTruthy();
      expect((await findSectionRadio('Members section')).checked).toBeFalsy();
    });

    it('should display an unsupported filter in the "not supported" section', async () => {
      renderEditor(filterFactory.customFilter(DM.Commerce.Date.Years, { custom: true }));

      expect((await findSectionRadio('Not supported section')).checked).toBeTruthy();
    });

    it('should not display the "not supported" section for a supported filter', async () => {
      renderEditor(includeAllFilter);

      await screen.findByLabelText('Include all section');
      expect(screen.queryByLabelText('Not supported section')).not.toBeInTheDocument();
    });

    it('should change filter to a "relative" one', async () => {
      const { user } = renderEditor(includeAllFilter);

      await user.click(await findSectionRadio('Datetime relative section'));

      expect((await findSectionRadio('Datetime relative section')).checked).toBeTruthy();
      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          operator: DateOperators.Last,
          offset: 1,
          count: 1,
          attribute: expect.objectContaining({ granularity: DateLevels.Months }),
          config: expect.objectContaining({ guid: includeAllFilter.config.guid }),
        }),
      );
    });

    it('should emit no filter when the "range" section is selected without a full range', async () => {
      const { user } = renderEditor(includeAllFilter);

      await user.click(await findSectionRadio('Datetime range section'));

      expect((await findSectionRadio('Datetime range section')).checked).toBeTruthy();
      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(null);
    });
  });

  describe('multiselect toggle visibility', () => {
    it('should hide the multiselect toggle when "showMultiselectToggle" is off', async () => {
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditorDatetime
            filter={includeAllFilter}
            onChange={filterChangeHandlerMock}
            showMultiselectToggle={false}
          />
        </SisenseContextProvider>,
      );

      await screen.findByLabelText('Filter editor datetime');
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('should start in single-select mode for a filter with multi-selection disabled', async () => {
      const singleSelectFilter = filterFactory.members(
        DM.Commerce.Date.Years,
        ['2013-01-01T00:00:00'],
        { enableMultiSelection: false },
      );
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditorDatetime filter={singleSelectFilter} onChange={filterChangeHandlerMock} />
        </SisenseContextProvider>,
      );

      const membersSection = await screen.findByLabelText('Members section');
      expect(screen.getByRole('switch')).not.toBeChecked();
      expect(within(membersSection).getByLabelText('Searchable single-select')).toBeInTheDocument();
    });
  });

  describe('date limits', () => {
    // The attribute stats query asks for the min and max dates; members queries do not.
    const statsResponse = {
      headers: ['count', 'min', 'max'],
      values: [
        { data: 11, text: '11' },
        { data: '2013-03-10T00:00:00', text: '3/10/2013' },
        { data: '2013-03-20T00:00:00', text: '3/20/2013' },
      ],
    };

    type JaqlRequestBody = { metadata: { jaql?: { agg?: string } }[] };

    const isJaqlRequestBody = (body: unknown): body is JaqlRequestBody =>
      typeof body === 'object' &&
      body !== null &&
      'metadata' in body &&
      Array.isArray(body.metadata);

    beforeEach(() => {
      server.use(
        http.post('*/api/datasources/Sample%20ECommerce/jaql', async ({ request }) => {
          const body: unknown = await request.json();
          if (!isJaqlRequestBody(body)) {
            throw new Error('Unexpected jaql request body: no "metadata" array');
          }
          const isStatsQuery = body.metadata.some(({ jaql }) => jaql?.agg === 'min');
          return HttpResponse.json(
            isStatsQuery ? { ...statsResponse, metadata: body.metadata } : jaqlDateYears,
          );
        }),
      );
    });

    it('should offer the earliest and latest dates in the data as the range ends', async () => {
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditorDatetime filter={includeAllFilter} onChange={filterChangeHandlerMock} />
        </SisenseContextProvider>,
      );

      const rangeSection = await screen.findByLabelText('Datetime range section');
      await user.click(within(rangeSection).getAllByTestId('csdk-select-field')[0]);
      // The quick-select buttons stay hidden until the attribute stats arrive.
      await waitFor(() => expect(screen.getByText('Earliest Date')).toBeVisible());
      await user.click(screen.getByText('Earliest Date'));
      await user.click(screen.getByText('Latest Date'));

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          valueA: expect.stringContaining('2013-03-10'),
          valueB: expect.stringContaining('2013-03-20'),
        }),
      );
    });
  });

  describe('multiselect toggle', () => {
    const membersFilter = filterFactory.members(DM.Commerce.Date.Years, [
      '2013-01-01T00:00:00',
      '2012-01-01T00:00:00',
    ]);

    const renderEditor = () =>
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditorDatetime filter={membersFilter} onChange={filterChangeHandlerMock} />
        </SisenseContextProvider>,
      );

    const toggleMultiselect = async (user: ReturnType<typeof setup>['user']) =>
      user.click(await screen.findByLabelText('Allow multiselect for lists'));

    it('should keep the selected section when the toggle changes', async () => {
      const { user } = renderEditor();
      expect((await findSectionRadio('Members section')).checked).toBeTruthy();

      await toggleMultiselect(user);

      expect((await findSectionRadio('Members section')).checked).toBeTruthy();
      expect((await findSectionRadio('Datetime condition section')).checked).toBeFalsy();
    });

    it('should keep editing the members filter when the toggle changes', async () => {
      const { user } = renderEditor();
      await findSectionRadio('Members section');

      await toggleMultiselect(user);

      // The unselected condition section builds an empty, and therefore null, exclude filter - it
      // must not reach the editor, which would both disable "Apply" and move the selection.
      expect(filterChangeHandlerMock).not.toHaveBeenLastCalledWith(null);
      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          members: ['2012-01-01T00:00:00'],
          config: expect.objectContaining({
            enableMultiSelection: false,
            excludeMembers: false,
          }),
        }),
      );
    });
  });

  describe('filter editor context', () => {
    const parentFilter = filterFactory.members(DM.Commerce.Gender, ['Female']);

    const renderEditor = ({
      membersOnlyMode = false,
      parentFilters = [],
    }: {
      membersOnlyMode?: boolean;
      parentFilters?: Filter[];
    }) =>
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditorContextProvider
            value={{
              defaultDataSource: null,
              dataSources: [],
              parentFilters,
              membersOnlyMode,
              rankingVisible: true,
            }}
          >
            <FilterEditorDatetime filter={includeAllFilter} onChange={filterChangeHandlerMock} />
          </FilterEditorContextProvider>
        </SisenseContextProvider>,
      );

    const getConditionOptions = async (user: ReturnType<typeof setup>['user']) => {
      const conditionSection = await screen.findByLabelText('Datetime condition section');
      // The first "Condition select" is the condition itself, the second one is the exclude form granularity
      await user.click(within(conditionSection).getAllByLabelText('Condition select')[0]);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      return Array.from(conditionSelectContent.children, (item) => item.textContent);
    };

    it('should hide the relative and range sections when members-only mode is on', async () => {
      renderEditor({ membersOnlyMode: true });

      expect(await screen.findByLabelText('Members section')).toBeInTheDocument();
      expect(screen.queryByLabelText('Datetime relative section')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Datetime range section')).not.toBeInTheDocument();
    });

    it('should show the relative and range sections when members-only mode is off', async () => {
      renderEditor({ membersOnlyMode: false });

      expect(await screen.findByLabelText('Datetime relative section')).toBeInTheDocument();
      expect(screen.getByLabelText('Datetime range section')).toBeInTheDocument();
    });

    it('should offer only the "is not" condition when members-only mode is on', async () => {
      const { user } = renderEditor({ membersOnlyMode: true });

      expect(await getConditionOptions(user)).toEqual(['Is not']);
    });

    it('should offer all conditions when members-only mode is off', async () => {
      const { user } = renderEditor({ membersOnlyMode: false });

      expect(await getConditionOptions(user)).toEqual(['Is not', 'Is within', 'Top', 'Bottom']);
    });

    it('should narrow the date limits query by the parent filters', async () => {
      const jaqlRequests: unknown[] = [];
      server.use(
        http.post('*/api/datasources/Sample%20ECommerce/jaql', async ({ request }) => {
          jaqlRequests.push(await request.json());
          return HttpResponse.json(jaqlDateYears);
        }),
      );

      renderEditor({ parentFilters: [parentFilter] });

      await waitFor(() =>
        expect(jaqlRequests).toContainEqual(
          expect.objectContaining({
            metadata: expect.arrayContaining([
              expect.objectContaining({
                jaql: expect.objectContaining({
                  dim: DM.Commerce.Date.Years.expression,
                  agg: 'min',
                }),
              }),
              expect.objectContaining({
                jaql: expect.objectContaining({
                  dim: DM.Commerce.Gender.expression,
                  filter: { members: ['Female'] },
                }),
                panel: 'scope',
              }),
            ]),
          }),
        ),
      );
    });
  });
});
