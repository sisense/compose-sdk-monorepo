/** @vitest-environment jsdom */
import { screen, within } from '@testing-library/react';

import { setup, setupI18nMock } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';

import { MembersListSelect } from './members-list-select';

setupI18nMock();

const mockLoadMore = vi.fn();
let mockIsAllItemsLoaded = false;

// Mocked at the hook boundary: the behaviour under test is only that
// `isAllItemsLoaded` reaches the select as `allItemsLoaded`.
vi.mock('@/domains/filters/hooks/use-get-filter-members', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useGetFilterMembers: () => ({
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
  }),
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
});
