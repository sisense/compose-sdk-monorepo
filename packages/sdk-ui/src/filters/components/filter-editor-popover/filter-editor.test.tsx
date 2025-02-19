/** @vitest-environment jsdom */
import { screen, within } from '@testing-library/react';
import { filterFactory } from '@sisense/sdk-data';
import { http, HttpResponse } from 'msw';
import { setup } from '@/__test-helpers__';
import { FilterEditor } from './filter-editor';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '@/props';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import * as jaqlAgeRange from '@/__mocks__/data/mock-jaql-age-range.json';
import * as DM from '@/__test-helpers__/sample-ecommerce';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

describe('FilterEditor', () => {
  beforeEach(() => {
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlAgeRange)),
    );
  });

  it('should render filter editor', async () => {
    const filterChangeHandler = vi.fn();
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditor
          filter={filterFactory.members(DM.Commerce.AgeRange, [])}
          onChange={filterChangeHandler}
        />
      </SisenseContextProvider>,
    );
    const filterEditor = await screen.findByLabelText('Filter editor');
    expect(filterEditor).toBeInTheDocument();
  });

  describe('text filters', () => {
    it('should display the "include all" initial filter', async () => {
      const includeAllFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={includeAllFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const includeAllSection = await screen.findByLabelText('Include all section');
      const sectionSelectButton =
        within(includeAllSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();
    });

    it('should display the "members" initial filter', async () => {
      const membersFilter = filterFactory.members(DM.Commerce.AgeRange, ['19-24', '65+']);
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={membersFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const membersSection = await screen.findByLabelText('Members section');
      const sectionSelectButton =
        within(membersSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const membersSelect = await within(membersSection).findByLabelText('Searchable multi-select');
      const selectedValue = (await within(membersSelect).findByLabelText('Value')).textContent;
      expect(selectedValue).toBe('19-24, 65+');
    });

    it('should display the "is not" initial filter', async () => {
      const excludeFilter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '19-24'], {
        excludeMembers: true,
      });
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={excludeFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
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
      expect(excludedMembersValue).toBe('0-18, 19-24');
    });

    it('should display the "contains" initial filter', async () => {
      const containFilter = filterFactory.contains(DM.Commerce.AgeRange, '0-18');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={containFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Contains');

      const value =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
      expect(value).toBe('0-18');
    });

    it('should display the "does not contain" initial filter', async () => {
      const doesntContainFilter = filterFactory.doesntContain(DM.Commerce.AgeRange, '18');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={doesntContainFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Does not contain');

      const value =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
      expect(value).toBe('18');
    });

    it('should display the "starts with" initial filter', async () => {
      const startsWithFilter = filterFactory.startsWith(DM.Commerce.AgeRange, '0');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={startsWithFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Starts with');

      const value =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
      expect(value).toBe('0');
    });

    it('should display the "does not start with" initial filter', async () => {
      const doesntStartWithFilter = filterFactory.doesntStartWith(DM.Commerce.AgeRange, '0');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={doesntStartWithFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Does not start with');

      const value =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
      expect(value).toBe('0');
    });

    it('should display the "ends with" initial filter', async () => {
      const endsWithFilter = filterFactory.endsWith(DM.Commerce.AgeRange, '18');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={endsWithFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Ends with');

      const value =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
      expect(value).toBe('18');
    });

    it('should display the "does not end with" initial filter', async () => {
      const doesntEndWithFilter = filterFactory.doesntEndWith(DM.Commerce.AgeRange, '18');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={doesntEndWithFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Does not end with');

      const value =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
      expect(value).toBe('18');
    });

    it('should display the "equals" initial filter', async () => {
      const equalsFilter = filterFactory.equals(DM.Commerce.AgeRange, '0-18');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={equalsFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Equals');

      const value =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
      expect(value).toBe('0-18');
    });

    it('should display the "does not equal" initial filter', async () => {
      const doesntEqualFilter = filterFactory.doesntEqual(DM.Commerce.AgeRange, '0-18');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={doesntEqualFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Does not equal');

      const value =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Value input')?.value;
      expect(value).toBe('0-18');
    });

    it('should display the "is empty" initial filter', async () => {
      const emptyFilter = filterFactory.equals(DM.Commerce.AgeRange, '');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={emptyFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Is empty');
    });

    it('should display the "is not empty" initial filter', async () => {
      const notEmptyFilter = filterFactory.doesntEqual(DM.Commerce.AgeRange, '');
      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={notEmptyFilter} onChange={vi.fn()} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const sectionSelectButton =
        within(textConditionSection).getByLabelText<HTMLInputElement>('Select button');
      expect(sectionSelectButton?.checked).toBeTruthy();

      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      const selectedConditionValue = within(conditionSelect).getByLabelText('Value').textContent;
      expect(selectedConditionValue).toBe('Is not empty');
    });

    it('should change filter to "include all" one', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, ['18-24']);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const includeAllSection = await screen.findByLabelText('Include all section');
      const selectButton =
        within(includeAllSection).getByLabelText<HTMLInputElement>('Select button');
      await user.click(selectButton);
      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.members(DM.Commerce.AgeRange, [], { guid: initialFilter.config?.guid }),
      );
    });

    it('should change filter to "members" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const membersSection = await screen.findByLabelText('Members section');
      const membersSelect = within(membersSection).getByLabelText('Searchable multi-select');
      await user.click(membersSelect);

      const membersSelectContent = await screen.findByLabelText('Searchable multi-select content');

      // select members
      await user.click(within(membersSelectContent).getByText('0-18'));
      await user.click(within(membersSelectContent).getByText('19-24'));

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.members(DM.Commerce.AgeRange, ['0-18', '19-24'], {
          ...initialFilter.config,
          enableMultiSelection: true,
        }),
      );
    });

    it('should change filter to "members" filter with single-select mode', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const multiSelectSwitch = await screen.findByLabelText('Allow multiselect for lists');
      await user.click(multiSelectSwitch);

      const membersSection = await screen.findByLabelText('Members section');
      const membersSelect = within(membersSection).getByLabelText('Searchable single-select');
      await user.click(membersSelect);

      const membersSelectContent = await screen.findByLabelText('Searchable single-select content');

      // select single member
      await user.click(within(membersSelectContent).getByText('19-24'));

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.members(DM.Commerce.AgeRange, ['19-24'], {
          ...initialFilter.config,
          enableMultiSelection: false,
        }),
      );
    });

    it('should change multi-select "members" filter to single-select one', async () => {
      const multiSelectMembersFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
      ]);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={multiSelectMembersFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const multiSelectSwitch = await screen.findByLabelText('Allow multiselect for lists');
      await user.click(multiSelectSwitch);

      const membersSection = await screen.findByLabelText('Members section');
      const membersSelect = within(membersSection).getByLabelText('Searchable single-select');
      const selectedMembersValue = within(membersSelect).getByLabelText('Value').textContent;

      expect(selectedMembersValue).toBe('0-18');
      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], {
          ...multiSelectMembersFilter.config,
          enableMultiSelection: false,
        }),
      );
    });

    it('should change filter to "is not" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Is not'));

      const excludeMembersSelect = await within(textConditionSection).findByLabelText(
        'Searchable multi-select',
      );
      await user.click(excludeMembersSelect);
      const membersSelectContent = await screen.findByLabelText('Searchable multi-select content');
      await user.click(within(membersSelectContent).getByText('0-18'));
      await user.click(within(membersSelectContent).getByText('19-24'));

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.members(DM.Commerce.AgeRange, ['0-18', '19-24'], {
          ...initialFilter.config,
          excludeMembers: true,
          enableMultiSelection: true,
        }),
      );
    });

    it('should change filter to "contains" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Contains'));

      const valueInput = await within(textConditionSection).findByLabelText('Value input');
      await user.click(valueInput);
      await user.type(valueInput, '0-18');

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.contains(DM.Commerce.AgeRange, '0-18', initialFilter.config),
      );
    });

    it('should change filter to "does not contain" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Does not contain'));

      const valueInput = await within(textConditionSection).findByLabelText('Value input');
      await user.click(valueInput);
      await user.type(valueInput, '0-18');

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.doesntContain(DM.Commerce.AgeRange, '0-18', initialFilter.config),
      );
    });

    it('should change filter to "starts with" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Starts with'));

      const valueInput = await within(textConditionSection).findByLabelText('Value input');
      await user.click(valueInput);
      await user.type(valueInput, '0-18');

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.startsWith(DM.Commerce.AgeRange, '0-18', initialFilter.config),
      );
    });

    it('should change filter to "does not start with" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Does not start with'));

      const valueInput = await within(textConditionSection).findByLabelText('Value input');
      await user.click(valueInput);
      await user.type(valueInput, '0-18');

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.doesntStartWith(DM.Commerce.AgeRange, '0-18', initialFilter.config),
      );
    });

    it('should change filter to "ends with" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Ends with'));

      const valueInput = await within(textConditionSection).findByLabelText('Value input');
      await user.click(valueInput);
      await user.type(valueInput, '0-18');

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.endsWith(DM.Commerce.AgeRange, '0-18', initialFilter.config),
      );
    });

    it('should change filter to "does not end with" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Does not end with'));

      const valueInput = await within(textConditionSection).findByLabelText('Value input');
      await user.click(valueInput);
      await user.type(valueInput, '0-18');

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.doesntEndWith(DM.Commerce.AgeRange, '0-18', initialFilter.config),
      );
    });

    it('should change filter to "equals" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Equals'));

      const valueInput = await within(textConditionSection).findByLabelText('Value input');
      await user.click(valueInput);
      await user.type(valueInput, '0-18');

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.equals(DM.Commerce.AgeRange, '0-18', initialFilter.config),
      );
    });

    it('should change filter to "does not equal" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Does not equal'));

      const valueInput = await within(textConditionSection).findByLabelText('Value input');
      await user.click(valueInput);
      await user.type(valueInput, '0-18');

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.doesntEqual(DM.Commerce.AgeRange, '0-18', initialFilter.config),
      );
    });

    it('should change filter to "is empty" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Is empty'));

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.equals(DM.Commerce.AgeRange, '', initialFilter.config),
      );
    });

    it('should change filter to "is not empty" filter with multi-select mode by default', async () => {
      const initialFilter = filterFactory.members(DM.Commerce.AgeRange, []);
      const filterChangeHandler = vi.fn();
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={initialFilter} onChange={filterChangeHandler} />
        </SisenseContextProvider>,
      );
      const textConditionSection = await screen.findByLabelText('Text condition section');
      const conditionSelect = within(textConditionSection).getByLabelText('Condition select');
      await user.click(conditionSelect);
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      await user.click(within(conditionSelectContent).getByText('Is not empty'));

      expect(filterChangeHandler).toHaveBeenCalledWith(
        filterFactory.doesntEqual(DM.Commerce.AgeRange, '', initialFilter.config),
      );
    });
  });
});
