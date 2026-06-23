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

async function selectCondition(user: ReturnType<typeof setup>['user'], conditionLabel: string) {
  const conditionSection = await screen.findByLabelText('Datetime condition section');
  const conditionSelect = within(conditionSection).getByLabelText('Condition select');
  await user.click(conditionSelect);
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
});
