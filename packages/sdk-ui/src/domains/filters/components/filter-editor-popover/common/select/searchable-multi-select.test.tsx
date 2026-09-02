/** @vitest-environment jsdom */
import { screen, within } from '@testing-library/react';

import { setup, setupI18nMock } from '@/__test-helpers__';

import { SearchableMultiSelect } from './searchable-multi-select';
import { SelectItem } from './types';

setupI18nMock();

const SELECT_ALL_TOOLTIP =
  'Not all values displayed. Scroll down the list to load remaining values. ' +
  'You can also use "Is not" condition below to exclude specific values.';

const items: SelectItem<string>[] = [{ value: 'Alpha' }, { value: 'Beta' }, { value: 'Gamma' }];

type CaseProps = {
  values?: string[];
  allItemsLoaded?: boolean;
};

/** Opens the dropdown: the toolbar only exists once the popper is mounted. */
async function setupOpened(props: CaseProps = {}) {
  const onChange = vi.fn();
  const { user } = setup(
    <SearchableMultiSelect<string> items={items} onChange={onChange} {...props} />,
  );

  await user.click(screen.getByLabelText('Searchable multi-select'));
  const content = await screen.findByLabelText('Searchable multi-select content');
  const selectAll = within(content).getByText('Select All');

  // A disabled button is inert, so the wrapping span is the hover target.
  const hoverSelectAll = async () => {
    const hoverTarget = selectAll.closest('span');
    if (!hoverTarget) {
      throw new Error('"Select All" must sit inside a span for its tooltip to receive hover');
    }
    await user.hover(hoverTarget);
  };

  return { user, onChange, content, selectAll, hoverSelectAll };
}

describe('SearchableMultiSelect', () => {
  describe('Select All while the list is still paging', () => {
    it('should disable "Select All" when not every item is loaded', async () => {
      const { selectAll } = await setupOpened({ allItemsLoaded: false });

      expect(selectAll).toBeDisabled();
    });

    it('should explain the disabled "Select All" through a tooltip', async () => {
      const { hoverSelectAll } = await setupOpened({ allItemsLoaded: false });

      await hoverSelectAll();

      // Not `role="tooltip"`: the dropdown's own MUI Popper root carries that role.
      expect(await screen.findByText(SELECT_ALL_TOOLTIP)).toBeInTheDocument();
    });

    it('should keep "Clear All" usable so a partial selection can still be undone', async () => {
      const { user, content, onChange } = await setupOpened({
        allItemsLoaded: false,
        values: ['Alpha'],
      });

      await user.click(within(content).getByText('Clear All'));

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Select All once the whole list is loaded', () => {
    it('should enable "Select All" and select every item', async () => {
      const { user, selectAll, onChange } = await setupOpened({
        allItemsLoaded: true,
        values: ['Alpha'],
      });

      expect(selectAll).toBeEnabled();
      await user.click(selectAll);

      expect(onChange).toHaveBeenCalledWith(['Alpha', 'Beta', 'Gamma']);
    });

    it('should disable "Select All" without a tooltip when everything is already selected', async () => {
      const { selectAll, hoverSelectAll } = await setupOpened({
        allItemsLoaded: true,
        values: ['Alpha', 'Beta', 'Gamma'],
      });

      expect(selectAll).toBeDisabled();

      await hoverSelectAll();
      expect(screen.queryByText(SELECT_ALL_TOOLTIP)).not.toBeInTheDocument();
    });
  });

  describe('callers that hand over a complete list', () => {
    it('should treat an omitted "allItemsLoaded" as fully loaded', async () => {
      const { selectAll } = await setupOpened();

      expect(selectAll).toBeEnabled();
    });

    it('should not show a tooltip when "allItemsLoaded" is omitted', async () => {
      const { hoverSelectAll } = await setupOpened();

      await hoverSelectAll();

      expect(screen.queryByText(SELECT_ALL_TOOLTIP)).not.toBeInTheDocument();
    });
  });
});
