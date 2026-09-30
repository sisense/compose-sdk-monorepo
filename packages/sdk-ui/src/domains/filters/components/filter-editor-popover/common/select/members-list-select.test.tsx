/** @vitest-environment jsdom */
import type { Filter } from '@sisense/sdk-data';
import { filterFactory } from '@sisense/sdk-data';
import { screen, within } from '@testing-library/react';

import { setup, setupI18nMock } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';

import { FilterEditorContextProvider } from '../../filter-editor-context';
import { MembersListSelect } from './members-list-select';

setupI18nMock();

const mockLoadMore = vi.fn();
let mockIsAllItemsLoaded = false;
const { useGetFilterMembersMock } = vi.hoisted(() => ({
  useGetFilterMembersMock: vi.fn<(params: { parentFilters?: Filter[] }) => void>(),
}));

// Mocked at the hook boundary: the behaviour under test is only that
// `isAllItemsLoaded` reaches the select as `allItemsLoaded`.
vi.mock('@/domains/filters/hooks/use-get-filter-members', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useGetFilterMembers: (params: { parentFilters?: Filter[] }) => {
    useGetFilterMembersMock(params);
    return {
      data: {
        allMembers: [{ key: 'Alpha' }, { key: 'Beta' }],
        selectedMembers: [],
        excludeMembers: false,
        enableMultiSelection: true,
        hasBackgroundFilter: false,
      },
      isLoading: false,
      isError: false,
      loadMore: mockLoadMore,
      isAllItemsLoaded: mockIsAllItemsLoaded,
    };
  },
}));

async function setupOpened() {
  const { user } = setup(
    <MembersListSelect
      attribute={DM.Commerce.AgeRange}
      selectedMembers={[]}
      onChange={vi.fn()}
      multiSelect={true}
    />,
  );

  await user.click(screen.getByLabelText('Searchable multi-select'));
  const content = await screen.findByLabelText('Searchable multi-select content');

  return { user, selectAll: within(content).getByText('Select All') };
}

describe('MembersListSelect', () => {
  it('should disable "Select All" when the members query has more pages to load', async () => {
    mockIsAllItemsLoaded = false;

    const { selectAll } = await setupOpened();

    expect(selectAll).toBeDisabled();
  });

  it('should enable "Select All" when the members query has loaded every member', async () => {
    mockIsAllItemsLoaded = true;

    const { selectAll } = await setupOpened();

    expect(selectAll).toBeEnabled();
  });

  it('should narrow the members query by the parent filters from the filter editor context', () => {
    const parentFilter = filterFactory.members(DM.Commerce.Gender, ['Female']);

    setup(
      <FilterEditorContextProvider
        value={{
          defaultDataSource: null,
          dataSources: [],
          parentFilters: [parentFilter],
          membersOnlyMode: true,
          rankingVisible: true,
        }}
      >
        <MembersListSelect
          attribute={DM.Commerce.AgeRange}
          selectedMembers={[]}
          onChange={vi.fn()}
          multiSelect={true}
        />
      </FilterEditorContextProvider>,
    );

    // The member search is still applied on top of the parent filters
    expect(useGetFilterMembersMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        parentFilters: [parentFilter, expect.objectContaining({ attribute: DM.Commerce.AgeRange })],
      }),
    );
  });
});
