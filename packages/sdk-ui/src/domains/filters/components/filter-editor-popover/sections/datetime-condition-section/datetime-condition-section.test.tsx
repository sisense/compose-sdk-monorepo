/** @vitest-environment jsdom */
import {
  filterFactory,
  isRankingFilter,
  measureFactory,
  RankingOperators,
} from '@sisense/sdk-data';
import { screen, within } from '@testing-library/react';
import { assert, describe, expect, it, vi } from 'vitest';

import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '@/props';

import { FilterEditorContextProvider } from '../../filter-editor-context.js';
import { DatetimeConditionSection } from './datetime-condition-section.js';

const contextProviderProps: SisenseContextProviderProps = {
  url: 'http://localhost',
  token: 'token',
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

const measure = measureFactory.sum(DM.Commerce.Revenue);

async function openConditionSelect(user: ReturnType<typeof setup>['user']) {
  const conditionSection = await screen.findByLabelText('Datetime condition section');
  // The section's own select comes first; a condition form rendered beneath it, such as the exclude
  // form, contributes a second control under the same label.
  const [conditionSelect] = within(conditionSection).getAllByLabelText('Condition select');
  await user.click(conditionSelect);
}

async function selectCondition(user: ReturnType<typeof setup>['user'], conditionLabel: string) {
  await openConditionSelect(user);
  const conditionSelectContent = await screen.findByLabelText('Single-select content');
  await user.click(within(conditionSelectContent).getByText(conditionLabel));
}

describe('DatetimeConditionSection ranking', () => {
  it('emits bottom ranking filter when switching from top to bottom', async () => {
    const onChange = vi.fn();
    const rankingFilter = filterFactory.topRanking(DM.Commerce.Date.Weeks, measure, 2);

    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: DM.DataSource,
            dataSources: [DM.DataSource],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeConditionSection
            filter={rankingFilter}
            selected={true}
            multiSelectEnabled={true}
            onChange={onChange}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    await selectCondition(user, 'Bottom');

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    assert(lastCall);
    assert(isRankingFilter(lastCall));
    expect(lastCall.operator).toBe(RankingOperators.Bottom);
    expect(lastCall.count).toBe(2);
  });

  it('does not re-emit ranking filter when switching to exclude', async () => {
    const onChange = vi.fn();
    const rankingFilter = filterFactory.topRanking(DM.Commerce.Date.Weeks, measure, 2);

    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: DM.DataSource,
            dataSources: [DM.DataSource],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeConditionSection
            filter={rankingFilter}
            selected={true}
            multiSelectEnabled={true}
            onChange={onChange}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    await selectCondition(user, 'Is not');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall === null || !isRankingFilter(lastCall)).toBe(true);
  });

  it('offers no ranking conditions when ranking is not visible', async () => {
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: DM.DataSource,
            dataSources: [DM.DataSource],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: false,
          }}
        >
          <DatetimeConditionSection
            filter={filterFactory.members(DM.Commerce.Date.Weeks, ['2024-01-01T00:00:00'], {
              excludeMembers: true,
            })}
            selected={true}
            multiSelectEnabled={true}
            onChange={vi.fn()}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    await openConditionSelect(user);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');

    expect(within(conditionSelectContent).queryByText('Top')).not.toBeInTheDocument();
    expect(within(conditionSelectContent).queryByText('Bottom')).not.toBeInTheDocument();
    expect(within(conditionSelectContent).getByText('Is not')).toBeInTheDocument();
  });

  it('keeps the ranking conditions when the edited filter already ranks', async () => {
    // Otherwise the condition control would open on a value missing from its own list.
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: DM.DataSource,
            dataSources: [DM.DataSource],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: false,
          }}
        >
          <DatetimeConditionSection
            filter={filterFactory.topRanking(DM.Commerce.Date.Weeks, measure, 2)}
            selected={true}
            multiSelectEnabled={true}
            onChange={vi.fn()}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    await openConditionSelect(user);
    const conditionSelectContent = await screen.findByLabelText('Single-select content');

    expect(within(conditionSelectContent).getByText('Top')).toBeInTheDocument();
    expect(within(conditionSelectContent).getByText('Bottom')).toBeInTheDocument();
  });
});
