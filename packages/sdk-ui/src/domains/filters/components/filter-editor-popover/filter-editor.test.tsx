/** @vitest-environment jsdom */
import { filterFactory } from '@sisense/sdk-data';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlAgeRange from '@/__mocks__/data/mock-jaql-age-range.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';
import type { SisenseContextProviderProps } from '@/props';

import { FilterEditor } from './filter-editor.js';

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

  it('should render filter editor for text attribute filter', async () => {
    const filterChangeHandler = vi.fn();
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditor
          filter={filterFactory.members(DM.Commerce.AgeRange, [])}
          onChange={filterChangeHandler}
          defaultDataSource={''}
        />
      </SisenseContextProvider>,
    );
    const filterEditor = await screen.findByLabelText('Filter editor textual');
    expect(filterEditor).toBeInTheDocument();
  });

  it('should render filter editor for numeric attribute filter', async () => {
    const filterChangeHandler = vi.fn();
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditor
          filter={filterFactory.members(DM.Commerce.Quantity, [])}
          onChange={filterChangeHandler}
          defaultDataSource={''}
        />
      </SisenseContextProvider>,
    );
    const filterEditor = await screen.findByLabelText('Filter editor numerical');
    expect(filterEditor).toBeInTheDocument();
  });

  describe('editor context', () => {
    const textFilter = filterFactory.members(DM.Commerce.AgeRange, []);

    const getConditionOptions = async (user: ReturnType<typeof setup>['user']) => {
      const textConditionSection = await screen.findByLabelText('Text condition section');
      await user.click(within(textConditionSection).getByLabelText('Condition select'));
      const conditionSelectContent = await screen.findByLabelText('Single-select content');
      return Array.from(conditionSelectContent.children, (item) => item.textContent);
    };

    it('should restrict the editor to members when members-only mode is configured', async () => {
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor
            filter={textFilter}
            defaultDataSource={''}
            config={{ membersOnlyMode: true }}
          />
        </SisenseContextProvider>,
      );

      expect(await getConditionOptions(user)).toEqual(['Is not']);
    });

    it('should not restrict the editor to members by default', async () => {
      const { user } = setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor filter={textFilter} defaultDataSource={''} />
        </SisenseContextProvider>,
      );

      expect(await getConditionOptions(user)).toContain('Contains');
    });

    it('should narrow the members query by the parent filters', async () => {
      const jaqlRequests: unknown[] = [];
      server.use(
        http.post('*/api/datasources/:dataSource/jaql', async ({ request }) => {
          jaqlRequests.push(await request.json());
          return HttpResponse.json(jaqlAgeRange);
        }),
      );

      setup(
        <SisenseContextProvider {...contextProviderProps}>
          <FilterEditor
            filter={textFilter}
            defaultDataSource={''}
            parentFilters={[filterFactory.members(DM.Commerce.Gender, ['Female'])]}
          />
        </SisenseContextProvider>,
      );

      await waitFor(() =>
        expect(jaqlRequests).toContainEqual(
          expect.objectContaining({
            metadata: expect.arrayContaining([
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
