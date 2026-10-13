import type { Filter } from '@sisense/sdk-data';
import {
  isCascadingFilter,
  isFilterRelations,
  parseComposeCodeToFunctionCall,
} from '@sisense/sdk-data';

import { extractDashboardFilters } from '@/domains/dashboarding/dashboard-model/translate-dashboard-utils';
import type { CascadingFilterDto, FilterDto } from '@/infra/api/types/dashboard-dto';
import { translateFiltersToJSON } from '@/modules/analytics-composer/nlq-v3-translator/constructs/filters/translate-filters-to-json';

const brandFilterDto: FilterDto = {
  jaql: {
    dim: '[Commerce.Brand]',
    table: 'Commerce',
    column: 'Brand',
    title: 'Brand',
    datatype: 'text',
    filter: { members: [] },
  },
  instanceid: 'brand-guid',
};

const cascadingFilterDto: CascadingFilterDto = {
  isCascading: true,
  instanceid: 'cascading-guid',
  levels: [
    {
      dim: '[Commerce.Country]',
      table: 'Commerce',
      column: 'Country',
      title: 'Country',
      datatype: 'text',
      filter: { members: ['Canada'], multiSelection: true },
      instanceid: 'level-country',
    },
    {
      dim: '[Commerce.Gender]',
      table: 'Commerce',
      column: 'Gender',
      title: 'Gender',
      datatype: 'text',
      filter: { all: true, multiSelection: true },
      instanceid: 'level-gender',
    },
  ],
};

describe('extractDashboardFilters — cascading filter compose code', () => {
  it('builds the filter with compose code that nests its levels', () => {
    const [filter] = extractDashboardFilters([cascadingFilterDto]) as Filter[];

    expect(isCascadingFilter(filter)).toBe(true);
    if (!isCascadingFilter(filter)) return;
    expect(filter.composeCode).toBeDefined();
    const call = parseComposeCodeToFunctionCall(filter.composeCode ?? '');
    expect(call.function).toBe('filterFactory.cascading');
    expect(call.args[0]).toEqual(
      filter.filters.map((level) => parseComposeCodeToFunctionCall(level.composeCode ?? '')),
    );
  });

  it('translates to NLQ JSON alongside the other dashboard filters', () => {
    const filters = extractDashboardFilters([brandFilterDto, cascadingFilterDto]);

    const translated = translateFiltersToJSON(filters);

    expect(translated.success).toBe(true);
    if (!translated.success) return;
    expect(translated.data.map((call) => call.function)).toEqual([
      'filterFactory.members',
      'filterFactory.cascading',
    ]);
  });

  it('keeps filter relations that include it serialized as factory calls', () => {
    const relations = extractDashboardFilters(
      [brandFilterDto, cascadingFilterDto],
      [
        {
          datasource: 'Sample ECommerce',
          filterRelations: {
            type: 'LogicalExpression',
            operator: 'OR',
            left: { type: 'Identifier', instanceId: 'brand-guid' },
            right: {
              type: 'CascadingIdentifier',
              levels: [
                { type: 'Identifier', instanceId: 'level-country' },
                { type: 'Identifier', instanceId: 'level-gender' },
              ],
            },
          },
        },
      ],
    );

    expect(isFilterRelations(relations)).toBe(true);
    if (!isFilterRelations(relations)) return;
    // The relations' compose code is stamped from its operands when it is built; an operand
    // without compose code of its own is stringified field by field instead
    expect(relations.composeCode).not.toContain('__serializable');
    const translated = translateFiltersToJSON(relations);
    expect(translated.success).toBe(true);
    if (!translated.success) return;
    expect(translated.data[0]).toMatchObject({
      function: 'filterFactory.logic.or',
      args: [{ function: 'filterFactory.members' }, { function: 'filterFactory.cascading' }],
    });
  });
});
