/** @vitest-environment jsdom */
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { filterFactory } from '@sisense/sdk-data';
import { setup } from '@/__test-helpers__';
import { FilterEditorNumerical } from './filter-editor-numerical';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '@/props';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import * as jaqlCategoryId from '@/__mocks__/data/mock-jaql-category-id.json';
import * as DM from '@/__test-helpers__/sample-ecommerce';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

describe('FilterEditorNumerical', () => {
  const filterChangeHandlerMock = vi.fn();
  const includeAllFilter = filterFactory.members(DM.Commerce.CategoryID, []);

  beforeEach(() => {
    filterChangeHandlerMock.mockClear();
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlCategoryId)),
    );
  });

  it('should render filter editor', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={includeAllFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const filterEditor = await screen.findByLabelText('Filter editor numerical');
    expect(filterEditor).toBeInTheDocument();
  });

  it('should display the "include all" initial filter', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={includeAllFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const includeAllSection = await screen.findByLabelText('Include all section');
    const sectionSelectButton =
      within(includeAllSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();
  });

  it('should display the "members" initial filter', async () => {
    const membersFilter = filterFactory.members(DM.Commerce.CategoryID, ['1', '2']);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={membersFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const membersSection = await screen.findByLabelText('Members section');
    const sectionSelectButton =
      within(membersSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const membersSelect = await within(membersSection).findByLabelText('Searchable multi-select');
    const selectedValue = (await within(membersSelect).findByLabelText('Value')).textContent;
    expect(selectedValue).toBe('1, 2');
  });

  it('should display the "between" initial filter', async () => {
    const betweenFilter = filterFactory.between(DM.Commerce.CategoryID, 1, 5);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={betweenFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const rangeSection = await screen.findByLabelText('Numeric range section');
    const fromInput = await within(rangeSection).findByLabelText('From');
    const toInput = await within(rangeSection).findByLabelText('To');

    expect(fromInput).toHaveValue('1');
    expect(toInput).toHaveValue('5');
  });

  it('should display the "is not" initial filter', async () => {
    const excludeFilter = filterFactory.members(DM.Commerce.CategoryID, ['1', '2'], {
      excludeMembers: true,
    });
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={excludeFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const sectionSelectButton =
      within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
    expect(selectedConditionValue).toBe('Is not');

    const excludeMembersSelect =
      within(textConditionSection).getByLabelText('Searchable multi-select');
    const excludedMembersValue = (await within(excludeMembersSelect).findByLabelText('Value'))
      .textContent;

    expect(excludedMembersValue).toBe('1, 2');
  });

  it('should display the "equals" initial filter', async () => {
    const equalsFilter = filterFactory.equals(DM.Commerce.CategoryID, 1);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={equalsFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const sectionSelectButton =
      within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
    expect(selectedConditionValue).toBe('Equals');

    const value =
      within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
    expect(value).toBe('1');
  });

  it('should display the "does not equal" initial filter', async () => {
    const doesntEqualFilter = filterFactory.doesntEqual(DM.Commerce.CategoryID, 1);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={doesntEqualFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const sectionSelectButton =
      within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
    expect(selectedConditionValue).toBe('Does not equal');

    const value =
      within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
    expect(value).toBe('1');
  });

  it('should display the "smaller than" initial filter', async () => {
    const emptyFilter = filterFactory.lessThan(DM.Commerce.CategoryID, 5);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={emptyFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const sectionSelectButton =
      within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
    expect(selectedConditionValue).toBe('Smaller than');
  });

  it('should display the "equals or smaller than" initial filter', async () => {
    const emptyFilter = filterFactory.lessThanOrEqual(DM.Commerce.CategoryID, 5);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={emptyFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const sectionSelectButton =
      within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
    expect(selectedConditionValue).toBe('Equals or smaller than');
  });

  it('should display the "greater than" initial filter', async () => {
    const emptyFilter = filterFactory.greaterThan(DM.Commerce.CategoryID, 5);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={emptyFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const sectionSelectButton =
      within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
    expect(selectedConditionValue).toBe('Greater than');
  });

  it('should display the "equals or greater than" initial filter', async () => {
    const emptyFilter = filterFactory.greaterThanOrEqual(DM.Commerce.CategoryID, 5);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={emptyFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const sectionSelectButton =
      within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
    expect(sectionSelectButton?.checked).toBeTruthy();

    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
    expect(selectedConditionValue).toBe('Equals or greater than');
  });

  it('should change filter to "include all" one', async () => {
    const initialFilter = filterFactory.members(DM.Commerce.CategoryID, ['18-24']);
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const includeAllSection = await screen.findByLabelText('Include all section');
    const selectButton =
      within(includeAllSection).getByLabelText<HTMLInputElement>('Select button');
    await user.click(selectButton);
    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.members(DM.Commerce.CategoryID, [], { guid: initialFilter.config?.guid }),
    );
  });

  it('should change filter to "members" filter with multi-select mode by default', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const membersSection = await screen.findByLabelText('Members section');
    const membersSelect = within(membersSection).getByLabelText('Searchable multi-select');
    await user.click(membersSelect);

    const membersSelectContent = await screen.findByLabelText('Searchable multi-select content');

    // select members
    await user.click(within(membersSelectContent).getByText('1'));
    await user.click(within(membersSelectContent).getByText('3'));

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.members(DM.Commerce.CategoryID, ['1', '3'], {
        ...initialFilter.config,
        enableMultiSelection: true,
      }),
    );
  });

  it('should change filter to "members" filter with single-select mode', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const multiSelectSwitch = await screen.findByLabelText('Allow multiselect for lists');
    await user.click(multiSelectSwitch);

    const membersSection = await screen.findByLabelText('Members section');
    const membersSelect = within(membersSection).getByLabelText('Searchable single-select');
    await user.click(membersSelect);

    const membersSelectContent = await screen.findByLabelText('Searchable single-select content');

    // select single member
    await user.click(within(membersSelectContent).getByText('1'));

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.members(DM.Commerce.CategoryID, ['1'], {
        ...initialFilter.config,
        enableMultiSelection: false,
      }),
    );
  });

  it('should change multi-select "members" filter to single-select one', async () => {
    const multiSelectMembersFilter = filterFactory.members(DM.Commerce.CategoryID, ['1', '2']);
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical
          filter={multiSelectMembersFilter}
          onChange={filterChangeHandlerMock}
        />
      </SisenseContextProvider>,
    );
    const multiSelectSwitch = await screen.findByLabelText('Allow multiselect for lists');
    await user.click(multiSelectSwitch);

    const membersSection = await screen.findByLabelText('Members section');
    const membersSelect = within(membersSection).getByLabelText('Searchable single-select');
    const selectedMembersValue = within(membersSelect).getByLabelText('Value').textContent;

    expect(selectedMembersValue).toBe('1');
    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.members(DM.Commerce.CategoryID, ['1'], {
        ...multiSelectMembersFilter.config,
        enableMultiSelection: false,
      }),
    );
  });

  it('should hide multi-select toggle', async () => {
    const multiSelectMembersFilter = filterFactory.members(DM.Commerce.CategoryID, ['1', '2']);
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical
          filter={multiSelectMembersFilter}
          showMultiselectToggle={false}
          onChange={filterChangeHandlerMock}
        />
      </SisenseContextProvider>,
    );
    const multiSelectSwitch = screen.queryByText('Allow multiselect for lists');
    expect(multiSelectSwitch).not.toBeInTheDocument();
  });

  it('should change filter to "between" filter', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const rangeSection = await screen.findByLabelText('Numeric range section');
    const fromInput = await within(rangeSection).findByLabelText('From');
    const toInput = await within(rangeSection).findByLabelText('To');

    await user.type(fromInput, '1');
    await user.type(toInput, '5');

    expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
      filterFactory.between(DM.Commerce.CategoryID, 1, 5, {
        ...initialFilter.config,
      }),
    );
  });

  it('should change filter to "is not" filter with multi-select mode by default', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    await user.click(conditionSelect);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');
    await user.click(within(conditionSelectContent).getByText('Is not'));

    const excludeMembersSelect = await within(textConditionSection).findByLabelText(
      'Searchable multi-select',
    );
    await user.click(excludeMembersSelect);
    const membersSelectContent = await screen.findByLabelText('Searchable multi-select content');
    await user.click(within(membersSelectContent).getByText('1'));
    await user.click(within(membersSelectContent).getByText('2'));

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.members(DM.Commerce.CategoryID, ['1', '2'], {
        ...initialFilter.config,
        excludeMembers: true,
        enableMultiSelection: true,
      }),
    );
  });

  it('should change filter to "equals" filter', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    await user.click(conditionSelect);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');
    await user.click(within(conditionSelectContent).getByText('Equals'));

    const valueInput = await within(textConditionSection).findByLabelText('Value input');
    await user.click(valueInput);
    await user.type(valueInput, '1');

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.equals(DM.Commerce.CategoryID, 1, initialFilter.config),
    );
  });

  it('should change filter to "does not equal" filter', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    await user.click(conditionSelect);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');
    await user.click(within(conditionSelectContent).getByText('Does not equal'));

    const valueInput = await within(textConditionSection).findByLabelText('Value input');
    await user.click(valueInput);
    await user.type(valueInput, '1');

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.doesntEqual(DM.Commerce.CategoryID, 1, initialFilter.config),
    );
  });

  it('should change filter to "smaller than" filter', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    await user.click(conditionSelect);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');
    await user.click(within(conditionSelectContent).getByText('Smaller than'));

    const valueInput = await within(textConditionSection).findByLabelText('Value input');
    await user.click(valueInput);
    await user.type(valueInput, '1');

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.lessThan(DM.Commerce.CategoryID, 1, initialFilter.config),
    );
  });

  it('should change filter to "equals or smaller than" filter', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    await user.click(conditionSelect);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');
    await user.click(within(conditionSelectContent).getByText('Equals or smaller than'));

    const valueInput = await within(textConditionSection).findByLabelText('Value input');
    await user.click(valueInput);
    await user.type(valueInput, '1');

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.lessThanOrEqual(DM.Commerce.CategoryID, 1, initialFilter.config),
    );
  });

  it('should change filter to "greater than" filter', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    await user.click(conditionSelect);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');
    await user.click(within(conditionSelectContent).getByText('Greater than'));

    const valueInput = await within(textConditionSection).findByLabelText('Value input');
    await user.click(valueInput);
    await user.type(valueInput, '1');

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.greaterThan(DM.Commerce.CategoryID, 1, initialFilter.config),
    );
  });

  it('should change filter to "equals or greater than" filter', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    await user.click(conditionSelect);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');
    await user.click(within(conditionSelectContent).getByText('Equals or greater than'));

    const valueInput = await within(textConditionSection).findByLabelText('Value input');
    await user.click(valueInput);
    await user.type(valueInput, '1');

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(
      filterFactory.greaterThanOrEqual(DM.Commerce.CategoryID, 1, initialFilter.config),
    );
  });

  it('should validate numeric input values in "condition" section', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const textConditionSection = await screen.findByLabelText('Numeric condition section');
    const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
    await user.click(conditionSelect);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');
    await user.click(within(conditionSelectContent).getByText('Equals or greater than'));

    const valueInput = await within(textConditionSection).findByLabelText('Value input');
    await user.click(valueInput);
    await user.type(valueInput, '1 item');

    expect(await within(textConditionSection).findByText('Numbers only')).toBeInTheDocument();
  });

  it('should validate numeric input values in "range" section', async () => {
    const initialFilter = includeAllFilter;
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorNumerical filter={initialFilter} onChange={filterChangeHandlerMock} />
      </SisenseContextProvider>,
    );
    const rangeSection = await screen.findByLabelText('Numeric range section');
    const fromInput = await within(rangeSection).findByLabelText('From');
    const toInput = await within(rangeSection).findByLabelText('To');

    // validates invalid value for "from" input
    await user.type(fromInput, '1 item');
    await user.type(toInput, '5');
    expect(within(rangeSection).getByText('Numbers only')).toBeInTheDocument();

    // validates invalid value for "to" input
    await user.clear(fromInput);
    await user.clear(toInput);
    await user.type(fromInput, '1');
    await user.type(toInput, 'text5');
    await waitFor(() => expect(within(rangeSection).getByText('Numbers only')).toBeInTheDocument());

    // validates invalid values for both "from" and "to" inputs
    await user.clear(fromInput);
    await user.clear(toInput);
    await user.type(fromInput, '5');
    await user.type(toInput, '4');
    await waitFor(() =>
      expect(
        within(rangeSection).getByText('"To" must be greater than "From"'),
      ).toBeInTheDocument(),
    );
  });
});
