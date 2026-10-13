/** @vitest-environment jsdom */
import type { Attribute, CascadingFilter, Filter, QueryResultData } from '@sisense/sdk-data';
import { filterFactory, isMembersFilter, parseComposeCodeToFunctionCall } from '@sisense/sdk-data';
import { render, screen, waitFor } from '@testing-library/react';

import { MockedSisenseContextProvider, setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { executeQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import type { QueryDescription } from '@/domains/query-execution/core/execute-query';

import { CascadingFilterTile } from './cascading-filter-tile.js';

vi.mock('@/domains/query-execution/core/execute-query');

const membersByAttribute = new Map<Attribute, string[]>([
  [DM.Commerce.Gender, ['Female', 'Male']],
  [DM.Commerce.AgeRange, ['0-18', '19-24', '25-34']],
  [DM.Commerce.Condition, ['New', 'Used']],
]);

const asMembersResult = (attribute: Attribute): QueryResultData => ({
  columns: [{ name: attribute.name, type: 'text' }],
  rows: (membersByAttribute.get(attribute) ?? []).map((member) => [{ data: member, text: member }]),
});

const genderFilter = filterFactory.members(DM.Commerce.Gender, ['Female'], { guid: 'gender' });
const ageRangeFilter = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: 'age' });
const conditionFilter = filterFactory.members(DM.Commerce.Condition, ['New'], {
  guid: 'condition',
});
const cascadingFilter = filterFactory.cascading([genderFilter, ageRangeFilter, conditionFilter], {
  guid: 'cascading',
});

/** Filters of the members query for the attribute, minus the level's own member search filter */
const findMembersQueryParentFilters = (attribute: Attribute): Filter[] | undefined => {
  const call = executeQueryMock.mock.calls.find(
    ([query]) => (query as QueryDescription).dimensions?.[0] === attribute,
  );
  const filters = call?.[0].filters as Filter[] | undefined;
  return filters?.filter((filter) => filter.attribute !== attribute);
};

describe('CascadingFilterTile editing', () => {
  beforeEach(() => {
    executeQueryMock.mockReset();
    executeQueryMock.mockImplementation(({ dimensions }: QueryDescription) =>
      Promise.resolve(asMembersResult(dimensions?.[0] as Attribute)),
    );
  });

  it('calls "onEdit" with the index of the level being edited', async () => {
    const onEdit = vi.fn();
    const { user } = setup(
      <MockedSisenseContextProvider>
        <CascadingFilterTile filter={cascadingFilter} onChange={vi.fn()} onEdit={onEdit} />
      </MockedSisenseContextProvider>,
    );

    const editButtons = await screen.findAllByTestId('filter-edit-button');
    expect(editButtons).toHaveLength(3);

    await user.click(editButtons[2]);
    await user.click(editButtons[0]);

    expect(onEdit.mock.calls).toEqual([[2], [0]]);
  });

  it('shows no edit button when "onEdit" is not provided', async () => {
    render(
      <MockedSisenseContextProvider>
        <CascadingFilterTile filter={cascadingFilter} onChange={vi.fn()} />
      </MockedSisenseContextProvider>,
    );

    expect(await screen.findByText(DM.Commerce.Condition.title)).toBeInTheDocument();
    expect(screen.queryByTestId('filter-edit-button')).not.toBeInTheDocument();
  });

  it('narrows the members of each level by the levels above it', async () => {
    render(
      <MockedSisenseContextProvider>
        <CascadingFilterTile filter={cascadingFilter} onChange={vi.fn()} />
      </MockedSisenseContextProvider>,
    );

    await waitFor(() => expect(findMembersQueryParentFilters(DM.Commerce.Condition)).toBeDefined());

    expect(findMembersQueryParentFilters(DM.Commerce.Gender)).toEqual([]);
    expect(findMembersQueryParentFilters(DM.Commerce.AgeRange)).toEqual([genderFilter]);
    expect(findMembersQueryParentFilters(DM.Commerce.Condition)).toEqual([
      genderFilter,
      ageRangeFilter,
    ]);
  });

  it('clears the selected members of the levels below the changed one', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <MockedSisenseContextProvider>
        <CascadingFilterTile filter={cascadingFilter} onChange={onChange} />
      </MockedSisenseContextProvider>,
    );

    // Levels render collapsed; expand the middle one to reach its members list
    const [, middleLevelExpandButton] = await screen.findAllByTestId('expand-collapse-button');
    await user.click(middleLevelExpandButton);
    await user.click(await screen.findByLabelText('19-24', { selector: 'input' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
    const newFilter = onChange.mock.calls[0][0] as CascadingFilter;
    const [top, middle, bottom] = newFilter.filters;
    expect(newFilter.config.guid).toBe('cascading');
    expect(top).toBe(genderFilter);
    expect(isMembersFilter(middle) && middle.members).toEqual(['0-18', '19-24']);
    expect(isMembersFilter(bottom) && bottom.members).toEqual([]);
  });

  it('gives the changed filter compose code built from its new levels', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <MockedSisenseContextProvider>
        <CascadingFilterTile filter={cascadingFilter} onChange={onChange} />
      </MockedSisenseContextProvider>,
    );

    const [, middleLevelExpandButton] = await screen.findAllByTestId('expand-collapse-button');
    await user.click(middleLevelExpandButton);
    await user.click(await screen.findByLabelText('19-24', { selector: 'input' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
    const newFilter = onChange.mock.calls[0][0] as CascadingFilter;
    const call = parseComposeCodeToFunctionCall(newFilter.composeCode ?? '');
    expect(call.function).toBe('filterFactory.cascading');
    expect(call.args[0]).toEqual(
      newFilter.filters.map((level) => parseComposeCodeToFunctionCall(level.composeCode ?? '')),
    );
  });
});
