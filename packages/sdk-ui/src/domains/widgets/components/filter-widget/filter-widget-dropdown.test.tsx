/** @vitest-environment jsdom */
import {
  createAttribute,
  DateLevels,
  type DimensionalLevelAttribute,
  filterFactory,
  isLevelAttribute,
  type MembersFilter,
  Sort,
} from '@sisense/sdk-data';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { createLevelAttribute } from '@/shared/utils/create-level-attribute';

import {
  asSingleSelectionMembers,
  FilterWidgetDropdown,
  getEffectiveMultiselect,
} from './filter-widget-dropdown.js';

describe('asSingleSelectionMembers', () => {
  it('keeps the alphabetically-first member when more than one is selected', () => {
    expect(asSingleSelectionMembers(['Italy', 'France', 'Germany'])).toEqual(['France']);
  });

  it('returns the members (as a new array) when at most one is selected', () => {
    const one = ['Italy'];
    expect(asSingleSelectionMembers(one)).toEqual(['Italy']);
    expect(asSingleSelectionMembers(one)).not.toBe(one);

    const empty: string[] = [];
    expect(asSingleSelectionMembers(empty)).toEqual([]);
    expect(asSingleSelectionMembers(empty)).not.toBe(empty);
  });

  it('returns a new array and does not mutate the input', () => {
    const members = ['Italy', 'France'];
    const result = asSingleSelectionMembers(members);
    expect(members).toEqual(['Italy', 'France']);
    expect(result).not.toBe(members);
  });
});

describe('getEffectiveMultiselect', () => {
  it('is multi when the widget is configured multiselect', () => {
    expect(getEffectiveMultiselect(true, 0, false)).toBe(true);
  });

  it('is single when widget is single, filter is single, and one member selected', () => {
    expect(getEffectiveMultiselect(false, 1, false)).toBe(false);
  });

  it('is single with zero members in a single-select widget', () => {
    expect(getEffectiveMultiselect(false, 0, false)).toBe(false);
  });

  it('reflects the filter: single-select widget shows multi when the linked filter has >1 member', () => {
    expect(getEffectiveMultiselect(false, 3, false)).toBe(true);
  });

  it('reflects the filter: single-select widget shows multi when the filter is multi-enabled', () => {
    expect(getEffectiveMultiselect(false, 0, true)).toBe(true);
  });

  it('treats undefined filter multiSelection as false', () => {
    expect(getEffectiveMultiselect(false, 1, undefined)).toBe(false);
  });
});

// ── Render tests ─────────────────────────────────────────────────────────────
// Mock the member query hook and FilterSelect so the dropdown's own
// branching (single vs multi vs date, selection handlers, scroll-load, placeholder)
// is exercised without a live query or the heavy select UI.

const mockLoadMore = vi.fn();
let mockMembersData: {
  selectedMembers: { key: string; title: string; inactive: boolean }[];
  allMembers: { key: string; title: string }[];
  excludeMembers: boolean;
  enableMultiSelection: boolean;
} | null = null;
let mockMembersLoading = false;
let mockAllItemsLoaded = true;

// Structural subset of GetFilterMembersParams covering the fields these tests assert.
// Typing the mock at its boundary lets `mock.calls` be consumed via inference (no casts).
type MembersHookParams = { filter: MembersFilter; enabled?: boolean };

const mockUseGetFilterMembers = vi.fn((_params: MembersHookParams) => ({
  data: mockMembersData,
  loadMore: mockLoadMore,
  isLoading: mockMembersLoading,
  isAllItemsLoaded: mockAllItemsLoaded,
}));

vi.mock('@/domains/filters/hooks/use-get-filter-members', () => ({
  useGetFilterMembersInternal: (params: MembersHookParams) => mockUseGetFilterMembers(params),
}));

/**
 * Returns the filters of the member queries that actually ran. The dropdown holds two — the
 * committed level's and the date panel's drafted one — and keeps the idle one disabled,
 * so the `enabled` flag is what separates a real request from a parked hook call.
 * @returns The filters of every enabled member query.
 */
function activeMemberQueries(): MembersFilter[] {
  return mockUseGetFilterMembers.mock.calls
    .filter(([{ enabled }]) => enabled === true)
    .map(([{ filter }]) => filter);
}

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    // Reports the key, and the column when it was interpolated into one — enough to see
    // whether a level attribute was named through i18n or left as a bare column name.
    useTranslation: () => ({
      t: (key: string, options?: { columnName?: string }) =>
        options?.columnName ? `${key}(${options.columnName})` : key,
    }),
  };
});

type ConditionFilterStubPayload = {
  __serializable: string;
  filterType: string;
  operatorA: string;
  valueA: string | number;
  members: undefined;
  filterJaql: () => Record<string, unknown>;
  config: unknown;
};

let conditionFilterStubPayload: ConditionFilterStubPayload | undefined;

vi.mock('./components', () => ({
  FilterSelect: ({
    selectedMembers,
    excludeMembers,
    enableMultiSelection,
    onSelectMember,
    onSelectAll,
    onClearAll,
    onListScroll,
    onSearchValueChange,
    size,
    radius,
    controlStyle,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test stub only reads the props it renders
  any) => (
    <div>
      <div data-testid={enableMultiSelection ? 'multi-select' : 'single-select'} />
      <div data-testid="select-design">{JSON.stringify({ size, radius, controlStyle })}</div>
      <div data-testid="select-value">
        {selectedMembers.length === 0
          ? excludeMembers
            ? 'includeAll'
            : ''
          : selectedMembers.map((m: { key: string }) => m.key).join(',')}
      </div>
      <button
        data-testid="multi-change"
        onClick={() => onSelectMember({ key: 'France', title: 'France' }, true)}
      />
      <button data-testid="select-all" onClick={() => onSelectAll()} />
      <button data-testid="clear-all" onClick={() => onClearAll()} />
      <button
        data-testid="single-change"
        onClick={() => onSelectMember({ key: 'France', title: 'France' }, true)}
      />
      <button
        data-testid="multi-scroll"
        onClick={() => onListScroll({ top: 0.9, direction: 'down' })}
      />
      <button data-testid="multi-search" onClick={() => onSearchValueChange?.('fra')} />
    </div>
  ),
  // The date drill-in. Stubbed to the same depth as FilterSelect: the level it is
  // showing, and buttons for each edit and each way out of the panel.
  PeriodFilter: ({
    level,
    levelItems,
    selectedMembers,
    excludeMembers,
    onLevelChange,
    onSelectMember,
    onSelectAll,
    onClearAll,
    onClearFilter,
    onListScroll,
    onSearchValueChange,
    onApply,
    onCancel,
    size,
    radius,
    controlStyle,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test stub only reads the props it renders
  any) => (
    <div>
      <div data-testid="date-select" />
      <div data-testid="date-design">{JSON.stringify({ size, radius, controlStyle })}</div>
      <div data-testid="granularity-value">{level ?? ''}</div>
      <div data-testid="granularity-options">
        {(levelItems ?? []).map((item: { id: string }) => item.id).join(',')}
      </div>
      <div data-testid="date-select-value">
        {selectedMembers.length === 0
          ? excludeMembers
            ? 'includeAll'
            : ''
          : selectedMembers.map((m: { key: string }) => m.key).join(',')}
      </div>
      <button data-testid="granularity-change" onClick={() => onLevelChange('Months')} />
      <button
        data-testid="date-change"
        onClick={() => onSelectMember({ key: '2024-01', title: '2024-01' }, true)}
      />
      <button data-testid="date-select-all" onClick={() => onSelectAll()} />
      <button data-testid="date-clear-all" onClick={() => onClearAll()} />
      <button data-testid="date-clear-filter" onClick={() => onClearFilter()} />
      <button data-testid="date-search" onClick={() => onSearchValueChange?.('2012')} />
      <button
        data-testid="date-scroll"
        onClick={() => onListScroll({ top: 0.9, direction: 'down' })}
      />
      <button data-testid="date-apply" onClick={() => onApply()} />
      <button data-testid="date-cancel" onClick={() => onCancel()} />
    </div>
  ),
  Selector: ({
    placeholder,
    dataTestId,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test stub only reads the props it renders
  any) => <div data-testid={dataTestId || 'selector-stub'}>{placeholder}</div>,
  ConditionFilter: ({
    filter,
    conditionKind,
    onFilterUpdate,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test stub only reads the props it renders
  any) => {
    conditionFilterStubPayload = {
      __serializable: conditionKind === 'numeric' ? 'NumericFilter' : 'TextFilter',
      filterType: conditionKind === 'numeric' ? 'numeric' : 'text',
      operatorA: conditionKind === 'numeric' ? 'fromNotEqual' : 'contains',
      valueA: conditionKind === 'numeric' ? 100 : 'cardio',
      members: undefined,
      filterJaql: () =>
        conditionKind === 'numeric' ? { fromNotEqual: 100 } : { contains: 'cardio' },
      config: filter?.config,
    };
    return (
      <div data-testid="condition-filter-mock" data-condition-kind={conditionKind ?? 'text'}>
        <button
          data-testid="condition-apply"
          onClick={() => onFilterUpdate(conditionFilterStubPayload)}
        />
      </div>
    );
  },
}));

const textAttribute = createAttribute({
  name: 'Country',
  expression: '[Country.Country]',
  type: 'text',
});

describe('FilterWidgetDropdown', () => {
  beforeEach(() => {
    conditionFilterStubPayload = undefined;
    mockMembersData = {
      selectedMembers: [],
      allMembers: [
        { key: 'France', title: 'France' },
        { key: 'Italy', title: 'Italy' },
      ],
      excludeMembers: false,
      enableMultiSelection: false,
    };
    mockMembersLoading = false;
    mockAllItemsLoaded = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the placeholder when the attribute has no expression', () => {
    const empty = createAttribute({ name: 'x', expression: '', type: 'text' });
    const { queryByTestId, getByText, getByTestId } = render(
      <FilterWidgetDropdown attribute={empty} />,
    );
    expect(queryByTestId('multi-select')).toBeNull();
    expect(queryByTestId('single-select')).toBeNull();
    expect(getByTestId('filter-widget-no-dimension')).toBeInTheDocument();
    expect(getByText('filterWidget.setupTitle')).toBeInTheDocument();
    expect(getByText('filterWidget.setupSubtitle')).toBeInTheDocument();
  });

  it('exposes the resolved attribute value type on the root (text / numeric / datetime)', () => {
    const { getByTestId, rerender } = render(
      <FilterWidgetDropdown attribute={textAttribute} isMultiselect={true} />,
    );
    expect(
      getByTestId('filter-widget-dropdown').getAttribute('data-filter-attribute-value-type'),
    ).toBe('text');

    rerender(<FilterWidgetDropdown attribute={DM.Commerce.Revenue} isMultiselect={true} />);
    expect(
      getByTestId('filter-widget-dropdown').getAttribute('data-filter-attribute-value-type'),
    ).toBe('numeric');

    rerender(<FilterWidgetDropdown attribute={DM.Commerce.Date.Years} isMultiselect={true} />);
    expect(
      getByTestId('filter-widget-dropdown').getAttribute('data-filter-attribute-value-type'),
    ).toBe('datetime');
  });

  it('exposes the value type on the no-dimension placeholder as well', () => {
    const empty = createAttribute({ name: 'x', expression: '', type: 'text' });
    const { getByTestId } = render(<FilterWidgetDropdown attribute={empty} />);
    expect(
      getByTestId('filter-widget-no-dimension').getAttribute('data-filter-attribute-value-type'),
    ).toBe('text');
  });

  it('renders ConditionFilter when filterType is condition on a text attribute', () => {
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} filterType="condition" />,
    );
    const root = getByTestId('filter-widget-condition');
    expect(root.getAttribute('data-filter-type')).toBe('condition');
    expect(root.getAttribute('data-filter-attribute-value-type')).toBe('text');
    expect(getByTestId('condition-filter-mock')).toHaveAttribute('data-condition-kind', 'text');
    expect(queryByTestId('multi-select')).toBeNull();
    expect(queryByTestId('filter-widget-dropdown')).toBeNull();
    expect(mockUseGetFilterMembers.mock.calls.every(([{ enabled }]) => enabled !== true)).toBe(
      true,
    );
  });

  it('renders ConditionFilter when filterType is condition on a numeric attribute', () => {
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={DM.Commerce.Revenue} filterType="condition" />,
    );
    const root = getByTestId('filter-widget-condition');
    expect(root.getAttribute('data-filter-type')).toBe('condition');
    expect(root.getAttribute('data-filter-attribute-value-type')).toBe('numeric');
    expect(getByTestId('condition-filter-mock')).toHaveAttribute('data-condition-kind', 'numeric');
    expect(queryByTestId('filter-widget-condition-unsupported')).toBeNull();
    expect(mockUseGetFilterMembers.mock.calls.every(([{ enabled }]) => enabled !== true)).toBe(
      true,
    );
  });

  it('shows unsupported copy for condition mode on a date attribute', () => {
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={DM.Commerce.Date.Years} filterType="condition" />,
    );
    expect(getByTestId('filter-widget-condition-unsupported')).toBeInTheDocument();
    expect(queryByTestId('condition-filter-mock')).toBeNull();
  });

  it('shows unsupported copy when the linked condition filter is not representable', () => {
    const nested = filterFactory.intersection([
      filterFactory.contains(textAttribute, 'a'),
      filterFactory.intersection([
        filterFactory.contains(textAttribute, 'b'),
        filterFactory.contains(textAttribute, 'c'),
      ]),
    ]);
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} filterType="condition" filter={nested} />,
    );
    expect(getByTestId('filter-widget-condition-unsupported')).toBeInTheDocument();
    expect(queryByTestId('condition-filter-mock')).toBeNull();
  });

  it('treats include-all members as an empty Condition seed, not unsupported', () => {
    const includeAll = filterFactory.members(textAttribute, []);
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} filterType="condition" filter={includeAll} />,
    );
    expect(queryByTestId('filter-widget-condition-unsupported')).toBeNull();
    expect(getByTestId('condition-filter-mock')).toHaveAttribute('data-condition-kind', 'text');
  });

  it('treats include-all members as an empty numeric Condition seed, not unsupported', () => {
    const includeAll = filterFactory.members(DM.Commerce.Revenue, []);
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Revenue}
        filterType="condition"
        filter={includeAll}
      />,
    );
    expect(queryByTestId('filter-widget-condition-unsupported')).toBeNull();
    expect(getByTestId('condition-filter-mock')).toHaveAttribute('data-condition-kind', 'numeric');
  });

  it('treats leftover List members as an empty Condition seed, not unsupported', () => {
    const listMembers = filterFactory.members(textAttribute, ['Apple', 'Sony']);
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        filterType="condition"
        filter={listMembers}
      />,
    );
    expect(queryByTestId('filter-widget-condition-unsupported')).toBeNull();
    expect(getByTestId('condition-filter-mock')).toHaveAttribute('data-condition-kind', 'text');
  });

  it('treats leftover List members as an empty numeric Condition seed, not unsupported', () => {
    const listMembers = filterFactory.members(DM.Commerce.Revenue, ['100', '200']);
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Revenue}
        filterType="condition"
        filter={listMembers}
      />,
    );
    expect(queryByTestId('filter-widget-condition-unsupported')).toBeNull();
    expect(getByTestId('condition-filter-mock')).toHaveAttribute('data-condition-kind', 'numeric');
  });

  it('shows unsupported when a numeric linked filter is not representable', () => {
    const nested = filterFactory.intersection([
      filterFactory.greaterThan(DM.Commerce.Revenue, 100),
      filterFactory.intersection([
        filterFactory.greaterThan(DM.Commerce.Revenue, 200),
        filterFactory.lessThan(DM.Commerce.Revenue, 500),
      ]),
    ]);
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Revenue}
        filterType="condition"
        filter={nested}
      />,
    );
    expect(getByTestId('filter-widget-condition-unsupported')).toBeInTheDocument();
    expect(queryByTestId('condition-filter-mock')).toBeNull();
  });

  it('wires onFilterUpdate through to ConditionFilter for numeric', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Revenue}
        filterType="condition"
        onFilterUpdate={onFilterUpdate}
      />,
    );
    fireEvent.click(getByTestId('condition-apply'));
    expect(onFilterUpdate).toHaveBeenCalledWith(conditionFilterStubPayload);
    expect(conditionFilterStubPayload?.filterJaql?.()).toEqual({ fromNotEqual: 100 });
  });

  it('wires onFilterUpdate through to ConditionFilter', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        filterType="condition"
        onFilterUpdate={onFilterUpdate}
      />,
    );
    fireEvent.click(getByTestId('condition-apply'));
    expect(onFilterUpdate).toHaveBeenCalledWith(conditionFilterStubPayload);
  });

  it('keeps the members List UI when filterType is members (default)', () => {
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} isMultiselect={true} />,
    );
    expect(getByTestId('filter-widget-dropdown').getAttribute('data-filter-type')).toBe('members');
    expect(queryByTestId('filter-widget-condition')).toBeNull();
  });

  it('renders the multi-select control for a multiselect widget', () => {
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} isMultiselect={true} />,
    );
    expect(getByTestId('multi-select')).toBeInTheDocument();
    expect(queryByTestId('single-select')).toBeNull();
  });

  it('renders the single-select control for a single-select widget with one member', () => {
    mockMembersData!.selectedMembers = [{ key: 'France', title: 'France', inactive: false }];
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} isMultiselect={false} />,
    );
    expect(getByTestId('single-select')).toBeInTheDocument();
    expect(queryByTestId('multi-select')).toBeNull();
  });

  it('reflects the filter: renders multi control even when single-select but filter has >1 member', () => {
    mockMembersData!.selectedMembers = [
      { key: 'France', title: 'France', inactive: false },
      { key: 'Italy', title: 'Italy', inactive: false },
    ];
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} isMultiselect={false} />,
    );
    expect(getByTestId('multi-select')).toBeInTheDocument();
    expect(queryByTestId('single-select')).toBeNull();
  });

  it('calls onFilterUpdate with the selected member on a multi change', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    fireEvent.click(getByTestId('multi-change'));
    expect(onFilterUpdate).toHaveBeenCalled();
    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual(['France']);
    expect(updated.config.excludeMembers).toBe(false);
  });

  it('select-all emits empty exclusions (inverted select-all)', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    fireEvent.click(getByTestId('select-all'));
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual([]);
    expect(updated.config.excludeMembers).toBe(true);
  });

  it('clear-all emits empty inclusions', () => {
    const onFilterUpdate = vi.fn();
    mockMembersData!.excludeMembers = true;
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    fireEvent.click(getByTestId('clear-all'));
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual([]);
    expect(updated.config.excludeMembers).toBe(false);
  });

  it('calls onFilterUpdate with a single member on a single change', () => {
    mockMembersData!.selectedMembers = [{ key: 'France', title: 'France', inactive: false }];
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={false}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    fireEvent.click(getByTestId('single-change'));
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate.mock.calls[0][0].members).toEqual(['France']);
  });

  it('loads more members when the list is scrolled near the bottom', () => {
    const { getByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} isMultiselect={true} />,
    );
    fireEvent.click(getByTestId('multi-scroll'));
    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('does not load more while members are loading', () => {
    mockMembersLoading = true;
    const { getByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} isMultiselect={true} />,
    );
    fireEvent.click(getByTestId('multi-scroll'));
    expect(mockLoadMore).not.toHaveBeenCalled();
  });

  it('renders one date control for a date attribute, not a separate level select', () => {
    const { getByTestId, queryByTestId } = render(
      <FilterWidgetDropdown attribute={DM.Commerce.Date.Years} />,
    );
    expect(getByTestId('date-select')).toBeInTheDocument();
    expect(queryByTestId('members-filter-select')).not.toBeInTheDocument();
  });

  /**
   * Date periods read newest-first, so the query has to say so. Inheriting the order from
   * whatever attribute the filter arrives with is not enough: a level attribute built for a
   * newly picked level carries no sort at all, and the engine then defaults to oldest-first.
   */
  it('asks for date members newest-first', () => {
    render(<FilterWidgetDropdown attribute={DM.Commerce.Date.Years} isMultiselect={true} />);

    const queries = activeMemberQueries();
    expect(queries.length).toBeGreaterThan(0);
    queries.forEach((filter) => expect(filter.attribute.getSort()).toBe(Sort.Descending));
  });

  it('asks for the drafted level members newest-first as well', () => {
    const { getByTestId } = render(
      <FilterWidgetDropdown attribute={DM.Commerce.Date.Years} isMultiselect={true} />,
    );

    mockUseGetFilterMembers.mockClear();
    fireEvent.click(getByTestId('granularity-change'));

    const drafted = activeMemberQueries().filter(
      (filter) => (filter.attribute as DimensionalLevelAttribute).granularity === 'Months',
    );
    expect(drafted.length).toBeGreaterThan(0);
    drafted.forEach((filter) => expect(filter.attribute.getSort()).toBe(Sort.Descending));
  });

  // Only dates are newest-first; reversing a text list would put Zimbabwe above Albania.
  it('leaves a text dimension member order to the engine', () => {
    render(<FilterWidgetDropdown attribute={textAttribute} isMultiselect={true} />);

    const queries = activeMemberQueries();
    expect(queries.length).toBeGreaterThan(0);
    queries.forEach((filter) => expect(filter.attribute.getSort()).toBe(Sort.None));
  });

  /**
   * The order is the widget's own way of reading the dimension, not part of the filter the
   * dashboard is filtered by — so it must not reach the host, whose linked-filter lookups
   * and persisted jaql are keyed on the attribute.
   */
  it('keeps the sort out of the filter it publishes', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('granularity-change'));
    fireEvent.click(getByTestId('date-select-all'));
    onFilterUpdate.mockClear();
    fireEvent.click(getByTestId('date-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate.mock.calls[0][0].attribute.getSort()).toBe(Sort.None);
  });

  // The date panel is a transaction: on a live dashboard every publish re-queries every
  // widget, so edits must buffer until Apply rather than landing one at a time.
  it('does not publish a date member edit until Apply', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('date-change'));
    fireEvent.click(getByTestId('date-select-all'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
  });

  it('reflects a buffered date edit in the control without publishing it', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('date-select-all'));

    expect(getByTestId('date-select-value').textContent).toBe('includeAll');
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });

  it('publishes the buffered date selection once on Apply', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('date-select-all'));
    fireEvent.click(getByTestId('date-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual([]);
    expect(updated.config.excludeMembers).toBe(true);
  });

  it('publishes nothing on Cancel and puts the members back', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('date-select-all'));
    fireEvent.click(getByTestId('date-cancel'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(getByTestId('date-select-value').textContent).toBe('');
  });

  // Rule: nothing inside the open panel may reach the dashboard before Apply — not a
  // member edit, and not a level change either.
  it('does not publish a level change made inside the open panel', () => {
    const onFilterUpdate = vi.fn();
    const onDateLevelChange = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
        onDateLevelChange={onDateLevelChange}
      />,
    );

    onFilterUpdate.mockClear();
    fireEvent.click(getByTestId('granularity-change'));

    // The panel shows the drafted level, but nothing left the widget.
    expect(getByTestId('granularity-value').textContent).toBe('Months');
    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(onDateLevelChange).not.toHaveBeenCalled();
  });

  it('restores the level on Cancel without publishing anything', () => {
    const onFilterUpdate = vi.fn();
    const onDateLevelChange = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
        onDateLevelChange={onDateLevelChange}
      />,
    );

    fireEvent.click(getByTestId('granularity-change'));
    fireEvent.click(getByTestId('date-select-all'));
    onFilterUpdate.mockClear();

    fireEvent.click(getByTestId('date-cancel'));

    expect(getByTestId('granularity-value').textContent).toBe(DateLevels.Years);
    expect(getByTestId('date-select-value').textContent).toBe('');
    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(onDateLevelChange).not.toHaveBeenCalled();
  });

  it('publishes the drafted level and its members together on Apply', () => {
    const onFilterUpdate = vi.fn();
    const onDateLevelChange = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
        onDateLevelChange={onDateLevelChange}
      />,
    );

    fireEvent.click(getByTestId('granularity-change'));
    fireEvent.click(getByTestId('date-select-all'));
    onFilterUpdate.mockClear();

    fireEvent.click(getByTestId('date-apply'));

    // One update carrying both halves, not one per half.
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const published = onFilterUpdate.mock.calls[0][0];
    expect((published.attribute as DimensionalLevelAttribute).granularity).toBe('Months');
    expect(published.members).toEqual([]);
    expect(published.config.excludeMembers).toBe(true);
    // The host hears about the level only now, when it has actually taken effect.
    expect(onDateLevelChange).toHaveBeenCalledTimes(1);
    expect(onDateLevelChange.mock.calls[0][0].granularity).toBe('Months');
  });

  /**
   * Order matters to a host that rewrites dimension granularity on level change and
   * discards any selection captured against the old level: a filter published first
   * would be deleted by the level event behind it. The host also needs the level
   * first to resolve the previous linked filter by its old dim+level key.
   */
  it('reports the level before the filter when Apply commits both', () => {
    const order: string[] = [];
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={() => order.push('filter')}
        onDateLevelChange={() => order.push('level')}
      />,
    );

    fireEvent.click(getByTestId('granularity-change'));
    fireEvent.click(getByTestId('date-select-all'));
    order.length = 0;
    fireEvent.click(getByTestId('date-apply'));

    expect(order).toEqual(['level', 'filter']);
  });

  /**
   * A host may echo its own widget metadata back a moment after a commit, and that
   * echo can still carry the level the widget just left. The widget must hold the
   * level it committed: following the stale echo re-published the members it had
   * just committed AT THE OLD LEVEL, so a Years selection of 2009 came back as
   * `Q1 2009` — the year's key read as a quarter.
   */
  it('holds the level it committed when the host echoes back the old one', () => {
    const onFilterUpdate = vi.fn();
    const seeded = filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00'], {
      guid: 'linked-guid',
      enableMultiSelection: true,
    }) as MembersFilter;
    const { getByTestId, rerender } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        filter={seeded}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    // Commit a level change: the stub drafts Months, Apply publishes it.
    fireEvent.click(getByTestId('granularity-change'));
    fireEvent.click(getByTestId('date-apply'));
    const committed = onFilterUpdate.mock.calls.at(-1)![0] as MembersFilter;
    expect((committed.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Months);

    // The host applies the filter but echoes the widget back at its previous level.
    onFilterUpdate.mockClear();
    rerender(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        filter={committed}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    expect(getByTestId('granularity-value').textContent).toBe(DateLevels.Months);
    onFilterUpdate.mock.calls.forEach(([published]) => {
      expect((published.attribute as DimensionalLevelAttribute).granularity).toBe(
        DateLevels.Months,
      );
    });
  });

  /**
   * The level the widget works at is its FILTER's, not its attribute's. A host can leave the
   * widget's own metadata behind — some bridges drop the level event entirely — and reading
   * the level from the attribute undid the commit: the widget came back at the old level and
   * re-published the new level's member keys under it, so a Years selection of 2009 turned
   * into `Q1 2009`.
   */
  it('works at the level its filter carries, not the one the host still names', () => {
    const onFilterUpdate = vi.fn();
    const committedAtYears = filterFactory.members(DM.Commerce.Date.Years, [
      '2009-01-01T00:00:00',
    ]) as MembersFilter;
    const hostStillAtQuarters = createLevelAttribute(
      DM.Commerce.Date.Years as DimensionalLevelAttribute,
      DateLevels.Quarters,
    );

    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={hostStillAtQuarters}
        isMultiselect={true}
        filter={committedAtYears}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    expect(getByTestId('granularity-value').textContent).toBe(DateLevels.Years);

    // And it keeps publishing at that level rather than dragging the filter back.
    fireEvent.click(getByTestId('date-select-all'));
    fireEvent.click(getByTestId('date-apply'));
    const published = onFilterUpdate.mock.calls.at(-1)![0] as MembersFilter;
    expect((published.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Years);
  });

  /**
   * A granularity another FilterWidget or dashboard filter already uses on the same field is
   * "busy": it must not be offered at all. The host derives the list (e.g.
   * `withExcludedDateLevels`) and the panel must honour it — the requirement the
   * two-dropdown control satisfied before this one.
   */
  it('does not offer a granularity another filter already claims', () => {
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Quarters}
        isMultiselect={true}
        onFilterUpdate={vi.fn()}
        excludedDateLevels={[DateLevels.Years, DateLevels.Months]}
      />,
    );

    const offered = getByTestId('granularity-options').textContent!.split(',');
    expect(offered).not.toContain(DateLevels.Years);
    expect(offered).not.toContain(DateLevels.Months);
    // Everything else the widget supports is still on offer, its own level included.
    expect(offered).toEqual([
      DateLevels.Quarters,
      DateLevels.Weeks,
      DateLevels.Days,
      DateLevels.AggHours,
      DateLevels.AggMinutesRoundTo15,
    ]);
  });

  it('offers every level the widget supports when nothing is claimed', () => {
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={vi.fn()}
      />,
    );

    expect(getByTestId('granularity-options').textContent!.split(',')).toEqual([
      DateLevels.Years,
      DateLevels.Quarters,
      DateLevels.Months,
      DateLevels.Weeks,
      DateLevels.Days,
      DateLevels.AggHours,
      DateLevels.AggMinutesRoundTo15,
    ]);
  });

  it('leaves the host alone on Apply when the level never moved', () => {
    const onDateLevelChange = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={vi.fn()}
        onDateLevelChange={onDateLevelChange}
      />,
    );

    fireEvent.click(getByTestId('date-select-all'));
    fireEvent.click(getByTestId('date-apply'));

    expect(onDateLevelChange).not.toHaveBeenCalled();
  });

  /**
   * The ✕ on the closed trigger is not a panel edit — no panel is open, so no Apply is
   * coming to commit it. It used to route to the draft, which blanked the box while the
   * dashboard stayed filtered by values the widget no longer showed.
   */
  it('publishes at once when the closed date trigger is cleared', () => {
    const onFilterUpdate = vi.fn();
    mockMembersData!.selectedMembers = [
      { key: '2010-04-01T00:00:00', title: 'Q2 2010', inactive: false },
    ];

    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('date-clear-filter'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const published = onFilterUpdate.mock.calls[0][0];
    expect(published.members).toEqual([]);
    expect(published.config.excludeMembers).toBe(false);
  });

  it('clears the date filter the same way the flat control does', () => {
    const dateUpdate = vi.fn();
    mockMembersData!.selectedMembers = [{ key: 'France', title: 'France', inactive: false }];

    const dateRender = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={dateUpdate}
      />,
    );
    fireEvent.click(dateRender.getByTestId('date-clear-filter'));
    const fromDate = dateUpdate.mock.calls[0][0];
    dateRender.unmount();

    const flatUpdate = vi.fn();
    const flatRender = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        onFilterUpdate={flatUpdate}
      />,
    );
    fireEvent.click(flatRender.getByTestId('clear-all'));
    const fromFlat = flatUpdate.mock.calls[0][0];

    expect(fromDate.members).toEqual(fromFlat.members);
    expect(fromDate.config.excludeMembers).toBe(fromFlat.config.excludeMembers);
  });

  it('keeps Clear inside the panel — members emptied, level kept, nothing published', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('granularity-change'));
    fireEvent.click(getByTestId('date-select-all'));
    onFilterUpdate.mockClear();

    fireEvent.click(getByTestId('date-clear-all'));

    expect(getByTestId('date-select-value').textContent).toBe('');
    // Clear resets the members only — the level the reader chose stays chosen.
    expect(getByTestId('granularity-value').textContent).toBe('Months');
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });

  it('drops a buffered date edit when the level changes, since periods belong to a level', () => {
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={vi.fn()}
      />,
    );

    fireEvent.click(getByTestId('date-select-all'));
    fireEvent.click(getByTestId('granularity-change'));

    expect(getByTestId('date-select-value').textContent).toBe('');
  });

  // A level change used to emit this immediately. It no longer can: inside the panel the
  // level is a draft, and telling the host about a level the reader may cancel would put
  // the host's dimension metadata out of step with the filter. The level reaches the host on
  // Apply — asserted by "publishes the drafted level and its members together on Apply"
  // and "leaves the host alone on Apply when the level never moved".
  it('does not emit the level to the host while it is only drafted', () => {
    const onDateLevelChange = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        onFilterUpdate={vi.fn()}
        onDateLevelChange={onDateLevelChange}
      />,
    );

    fireEvent.click(getByTestId('granularity-change'));

    expect(onDateLevelChange).not.toHaveBeenCalled();
  });

  it('re-queries members with a contains filter after a debounced search', () => {
    vi.useFakeTimers();
    try {
      const { getByTestId } = render(
        <FilterWidgetDropdown attribute={textAttribute} isMultiselect={true} />,
      );
      const callsBefore = mockUseGetFilterMembers.mock.calls.length;
      fireEvent.click(getByTestId('multi-search'));
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(mockUseGetFilterMembers.mock.calls.length).toBeGreaterThan(callsBefore);
    } finally {
      vi.useRealTimers();
    }
  });

  /**
   * The date panel offers a search box over its value list. The widget used to skip the
   * text-search filter for date dimensions — a leftover from the two-dropdown UI, which had
   * no search box — so typing there updated the input and filtered nothing.
   */
  it('re-queries members when the date panel is searched', () => {
    vi.useFakeTimers();
    try {
      const { getByTestId } = render(
        <FilterWidgetDropdown attribute={DM.Commerce.Date.Years} isMultiselect={true} />,
      );
      const callsBefore = mockUseGetFilterMembers.mock.calls.length;

      fireEvent.click(getByTestId('date-search'));
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(mockUseGetFilterMembers.mock.calls.length).toBeGreaterThan(callsBefore);
    } finally {
      vi.useRealTimers();
    }
  });

  // The date Apply path builds its filter by hand, because it has to carry a level the
  // committed filter does not have yet. That is exactly where the parts of a filter that
  // nothing on screen shows — the guid a dashboard identifies it by, the deactivated
  // members, the background filter — would be dropped without anyone noticing.
  it('preserves guid, deactivated members and background filter through a date Apply', () => {
    const onFilterUpdate = vi.fn();
    const background = filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']);
    const seeded = filterFactory.members(DM.Commerce.Date.Years, ['2010-01-01T00:00:00'], {
      guid: 'date-filter-guid',
      deactivatedMembers: ['2011-01-01T00:00:00'],
      backgroundFilter: background,
      enableMultiSelection: true,
    });

    // What the members query reports back for that seeded filter: the deactivated member
    // arrives as an inactive selection, which is how it survives a round trip.
    mockMembersData!.selectedMembers = [
      { key: '2010-01-01T00:00:00', title: '2010', inactive: false },
      { key: '2011-01-01T00:00:00', title: '2011', inactive: true },
    ];

    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        filter={seeded as MembersFilter}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    onFilterUpdate.mockClear();
    fireEvent.click(getByTestId('date-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const published = onFilterUpdate.mock.calls[0][0];
    expect(published.config.guid).toBe('date-filter-guid');
    expect(published.config.backgroundFilter).toBe(background);
    expect(published.config.enableMultiSelection).toBe(true);
    expect(published.config.deactivatedMembers).toEqual(['2011-01-01T00:00:00']);
  });

  /* The published attribute's name travels with the filter: it becomes the jaql title, so a
     host that syncs tile titles from the filter reads it as the linked filter tile's name.
     Left as the bare column name, the tile was renamed from `Years in Date` to `Date` the
     moment a value was picked. */
  it('names the level attribute it publishes the way every date level is named', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    onFilterUpdate.mockClear();
    // The stub's level change drafts Months; Apply commits it with the selection.
    fireEvent.click(getByTestId('granularity-change'));
    fireEvent.click(getByTestId('date-apply'));

    const published = onFilterUpdate.mock.calls[0][0];
    expect(published.attribute.name).toBe('attribute.datetimeName.months(Date)');
  });

  // Not a pass-through: the deactivated list is re-derived from the selection, so an
  // inactive member has to move out of `members` and into `deactivatedMembers` on its own.
  it('re-derives deactivated members from the selection on a date Apply', () => {
    const onFilterUpdate = vi.fn();
    mockMembersData!.selectedMembers = [
      { key: '2010-01-01T00:00:00', title: '2010', inactive: false },
      { key: '2011-01-01T00:00:00', title: '2011', inactive: true },
    ];

    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('date-apply'));

    const published = onFilterUpdate.mock.calls[0][0];
    expect(published.members).toEqual(['2010-01-01T00:00:00']);
    expect(published.config.deactivatedMembers).toEqual(['2011-01-01T00:00:00']);
  });

  // The date Apply must emit exactly what the flat control emits for the same selection —
  // same helper, same derivation — or the two halves of one widget would disagree about
  // what a filter is.
  it('emits the same payload as the flat control for the same selection', () => {
    const dateUpdate = vi.fn();
    mockMembersData!.selectedMembers = [
      { key: '2010-01-01T00:00:00', title: '2010', inactive: false },
    ];

    const dateRender = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        isMultiselect={true}
        onFilterUpdate={dateUpdate}
      />,
    );
    fireEvent.click(dateRender.getByTestId('date-apply'));
    const fromDate = dateUpdate.mock.calls[0][0];
    dateRender.unmount();

    const flatUpdate = vi.fn();
    // A text dimension, because that is what renders the flat control at all — the
    // comparison is of the config the two publish paths build, not of the attribute.
    const flatRender = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        onFilterUpdate={flatUpdate}
      />,
    );
    fireEvent.click(flatRender.getByTestId('multi-change'));
    const fromFlat = flatUpdate.mock.calls[0][0];

    expect(fromDate.config.enableMultiSelection).toBe(fromFlat.config.enableMultiSelection);
    expect(fromDate.config.deactivatedMembers).toEqual(fromFlat.config.deactivatedMembers);
    expect(Object.keys(fromDate.config).sort()).toEqual(Object.keys(fromFlat.config).sort());
  });

  it('seeds the dropdown from the provided filter', () => {
    const filter = filterFactory.members(textAttribute, ['Italy']);
    mockMembersData!.selectedMembers = [{ key: 'Italy', title: 'Italy', inactive: false }];
    const { getByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} isMultiselect={false} filter={filter} />,
    );
    expect(getByTestId('select-value').textContent).toBe('Italy');
  });

  it('drops the selection to a single member when switching from multi to single', () => {
    const onFilterUpdate = vi.fn();
    const multiFilter = filterFactory.members(textAttribute, ['France', 'Italy'], {
      enableMultiSelection: true,
    });
    const { rerender } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        filter={multiFilter}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    onFilterUpdate.mockClear();

    rerender(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={false}
        filter={multiFilter}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const emitted = onFilterUpdate.mock.calls[0][0];
    expect(emitted.members).toHaveLength(1);
    expect(emitted.config.enableMultiSelection).toBe(false);
  });

  const getMembersHookCalls = (fromIndex = 0): MembersHookParams[] =>
    mockUseGetFilterMembers.mock.calls.slice(fromIndex).map(([params]) => params);

  it('queries members for the new attribute after mounting with an empty one (editor flow)', () => {
    const empty = createAttribute({ name: '', expression: '', type: 'text' });
    const onFilterUpdate = vi.fn();
    const { rerender } = render(
      <FilterWidgetDropdown
        attribute={empty}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    const callsBeforeSwap = mockUseGetFilterMembers.mock.calls.length;

    rerender(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    const callsAfterSwap = getMembersHookCalls(callsBeforeSwap);
    const enabledCalls = callsAfterSwap.filter((params) => params.enabled);
    expect(enabledCalls.length).toBeGreaterThan(0);
    enabledCalls.forEach((params) => {
      expect(params.filter.attribute.expression).toBe('[Country.Country]');
    });
  });

  it('queries members at the prop granularity after mounting empty then receiving a non-Years date level', () => {
    const empty = createAttribute({ name: '', expression: '', type: 'text' });
    const quarters = createLevelAttribute(
      DM.Commerce.Date.Years as DimensionalLevelAttribute,
      DateLevels.Quarters,
    );
    const onFilterUpdate = vi.fn();
    const { rerender, getByTestId } = render(
      <FilterWidgetDropdown
        attribute={empty}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    const callsBeforeSwap = mockUseGetFilterMembers.mock.calls.length;

    rerender(
      <FilterWidgetDropdown
        attribute={quarters}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    expect(getByTestId('granularity-value').textContent).toBe(DateLevels.Quarters);

    const enabledCalls = getMembersHookCalls(callsBeforeSwap).filter((params) => params.enabled);
    expect(enabledCalls.length).toBeGreaterThan(0);
    enabledCalls.forEach((params) => {
      expect(params.filter.attribute.expression).toBe(quarters.expression);
      expect(isLevelAttribute(params.filter.attribute)).toBe(true);
      expect((params.filter.attribute as DimensionalLevelAttribute).granularity).toBe(
        DateLevels.Quarters,
      );
    });
  });

  it('queries members at the new level after a same-expression Years to Quarters prop update', () => {
    const years = DM.Commerce.Date.Years;
    const quarters = createLevelAttribute(years as DimensionalLevelAttribute, DateLevels.Quarters);
    const onFilterUpdate = vi.fn();
    const { rerender, getByTestId } = render(
      <FilterWidgetDropdown
        attribute={years}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    expect(getByTestId('granularity-value').textContent).toBe(DateLevels.Years);
    const callsBeforeSwap = mockUseGetFilterMembers.mock.calls.length;

    rerender(
      <FilterWidgetDropdown
        attribute={quarters}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    expect(getByTestId('granularity-value').textContent).toBe(DateLevels.Quarters);

    const enabledCalls = getMembersHookCalls(callsBeforeSwap).filter((params) => params.enabled);
    expect(enabledCalls.length).toBeGreaterThan(0);
    enabledCalls.forEach((params) => {
      expect(params.filter.attribute.expression).toBe(quarters.expression);
      expect(isLevelAttribute(params.filter.attribute)).toBe(true);
      expect((params.filter.attribute as DimensionalLevelAttribute).granularity).toBe(
        DateLevels.Quarters,
      );
    });
  });

  it('disables the member query while no dimension is picked (empty attribute)', () => {
    const empty = createAttribute({ name: '', expression: '', type: 'text' });
    render(<FilterWidgetDropdown attribute={empty} isMultiselect={true} />);

    getMembersHookCalls().forEach((params) => {
      expect(params.enabled).toBe(false);
    });
  });

  it('queries members for the new attribute after a dimension swap', () => {
    const onFilterUpdate = vi.fn();
    const brand = createAttribute({ name: 'Brand', expression: '[Brand.Brand]', type: 'text' });
    const { rerender } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    onFilterUpdate.mockClear();
    const callsBeforeSwap = mockUseGetFilterMembers.mock.calls.length;

    rerender(
      <FilterWidgetDropdown
        attribute={brand}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    const enabledCalls = getMembersHookCalls(callsBeforeSwap).filter((params) => params.enabled);
    expect(enabledCalls.length).toBeGreaterThan(0);
    enabledCalls.forEach((params) => {
      expect(params.filter.attribute.expression).toBe('[Brand.Brand]');
    });
    expect(onFilterUpdate).toHaveBeenCalled();
    const emitted = onFilterUpdate.mock.calls.at(-1)![0];
    expect(emitted.members).toEqual([]);
    expect(emitted.attribute.expression).toBe('[Brand.Brand]');
  });

  it('enables multiselect without dropping members when switching from single to multi', () => {
    const onFilterUpdate = vi.fn();
    const singleFilter = filterFactory.members(textAttribute, ['France'], {
      enableMultiSelection: false,
    });
    const { rerender } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={false}
        filter={singleFilter}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    onFilterUpdate.mockClear();

    rerender(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        filter={singleFilter}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const emitted = onFilterUpdate.mock.calls[0][0];
    expect(emitted.members).toEqual(['France']);
    expect(emitted.config.enableMultiSelection).toBe(true);
  });
});

// The control's styling (`styleOptions.control`) must reach the controls. Colours travel as
// the style itself — a colour it left unset must stay unset, so the control can fall through
// to the dashboard theme rather than to a default that would outrank it.
describe('FilterWidgetDropdown control styling', () => {
  beforeEach(() => {
    mockMembersData = {
      selectedMembers: [],
      allMembers: [{ key: 'France', title: 'France' }],
      excludeMembers: false,
      enableMultiSelection: false,
    };
    mockMembersLoading = false;
    mockAllItemsLoaded = true;
  });

  const control = {
    primaryText: '#101010',
    background: '#fafafa',
    accentColor: '#94f5f0',
    size: 'xl',
    cornerRadius: 'xl',
    alignHorizontal: 'center',
    alignVertical: 'bottom',
  } as const;

  it('passes size, radius and the set colour tokens to the members control', () => {
    const { getByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} controlStyleOptions={control} />,
    );

    expect(JSON.parse(getByTestId('select-design').textContent!)).toEqual({
      size: 'xl',
      radius: 'xl',
      controlStyle: control,
    });
  });

  it('passes the same tokens to the date control', () => {
    const { getByTestId } = render(
      <FilterWidgetDropdown attribute={DM.Commerce.Date.Years} controlStyleOptions={control} />,
    );

    expect(JSON.parse(getByTestId('date-design').textContent!)).toEqual({
      size: 'xl',
      radius: 'xl',
      controlStyle: control,
    });
  });

  it('leaves the control on its own defaults when no Filter Style is set', () => {
    const { getByTestId } = render(<FilterWidgetDropdown attribute={textAttribute} />);

    expect(JSON.parse(getByTestId('select-design').textContent!)).toEqual({
      size: 's',
      radius: 's',
    });
  });

  // The `--fw-*` contract is published by the control itself (see filter-select.test.tsx);
  // the tile only has to place it.
  it('aligns the control inside the tile', () => {
    const { getByTestId } = render(
      <FilterWidgetDropdown attribute={textAttribute} controlStyleOptions={control} />,
    );

    const root = getByTestId('filter-widget-dropdown');
    expect(root.style.justifyContent).toBe('center');
    expect(root.style.alignItems).toBe('flex-end');
    expect(root.style.height).toBe('100%');
  });
});

describe('FilterWidgetDropdown — the widget’s own dimension filters', () => {
  const allowedCountries = filterFactory.members(textAttribute, ['France', 'Italy']);
  const costOverThreshold = filterFactory.greaterThan(
    createAttribute({ name: 'Cost', expression: '[Commerce.Cost]', type: 'numeric' }),
    400,
  );

  beforeEach(() => {
    mockMembersData = {
      selectedMembers: [],
      allMembers: [
        { key: 'France', title: 'France' },
        { key: 'Italy', title: 'Italy' },
      ],
      excludeMembers: false,
      enableMultiSelection: true,
    };
    mockMembersLoading = false;
    mockAllItemsLoaded = true;
  });

  it('carries a same-dimension restriction on select-all, so "all" means the allowed members', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        parentFilters={[allowedCountries]}
        dimensionFilters={[allowedCountries]}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('select-all'));

    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual([]);
    expect(updated.config.excludeMembers).toBe(true);
    expect(updated.config.backgroundFilter).toBe(allowedCountries);
  });

  it('does not carry the restriction on an ordinary member pick — that member is already allowed', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        parentFilters={[allowedCountries]}
        dimensionFilters={[allowedCountries]}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('multi-change'));

    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual(['France']);
    expect(updated.config.backgroundFilter).toBeUndefined();
  });

  it('does not carry the restriction when the reader has selected nothing', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        parentFilters={[allowedCountries]}
        dimensionFilters={[allowedCountries]}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('clear-all'));

    // Qualifying an empty selection filtered the dashboard before any value was picked.
    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual([]);
    expect(updated.config.excludeMembers).toBe(false);
    expect(updated.config.backgroundFilter).toBeUndefined();
  });

  /* A nested clause is split back out onto its parent's dim at query time, so it cannot name a
     second dimension. Such a filter still narrows the dropdown list; the published filter cannot
     express it. Documented limitation — see the design doc. */
  it('cannot carry a restriction on another dimension, and does not try to', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        parentFilters={[costOverThreshold]}
        dimensionFilters={[costOverThreshold]}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('select-all'));

    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual([]);
    expect(updated.config.excludeMembers).toBe(true);
    expect(updated.config.backgroundFilter).toBeUndefined();
  });

  it('keeps the published filter a fixed size however many members the restriction allows', () => {
    const onFilterUpdate = vi.fn();
    const excludeOne = filterFactory.members(textAttribute, ['Italy'], { excludeMembers: true });
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        parentFilters={[excludeOne]}
        dimensionFilters={[excludeOne]}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('select-all'));

    // Excluding one member must not spell out every other member of the dimension.
    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual([]);
    expect(updated.config.backgroundFilter).toBe(excludeOne);
  });

  it('keeps select-all representational when nothing restricts the widget', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    fireEvent.click(getByTestId('select-all'));

    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual([]);
    expect(updated.config.excludeMembers).toBe(true);
    expect(updated.config.backgroundFilter).toBeUndefined();
  });

  it('keeps the restriction out of the member query, which the host already scopes', () => {
    const seeded = filterFactory.members(textAttribute, ['France'], {
      backgroundFilter: allowedCountries,
    }) as MembersFilter;
    mockUseGetFilterMembers.mockClear();

    render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        filter={seeded}
        parentFilters={[allowedCountries]}
        dimensionFilters={[allowedCountries]}
        onFilterUpdate={vi.fn()}
      />,
    );

    // Applying it here as well would double it, and would outlive the dimension filter itself.
    const queries = activeMemberQueries();
    expect(queries.length).toBeGreaterThan(0);
    queries.forEach((queried) => {
      expect(queried.config.backgroundFilter).toBeUndefined();
    });
  });

  it('stops applying a restriction the widget no longer has, once its dimension filter is deleted', () => {
    const onFilterUpdate = vi.fn();
    const seeded = filterFactory.members(textAttribute, ['France'], {
      backgroundFilter: allowedCountries,
    }) as MembersFilter;
    mockUseGetFilterMembers.mockClear();

    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        filter={seeded}
        parentFilters={[]}
        dimensionFilters={[]}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    // The member list must widen back out...
    const queries = activeMemberQueries();
    expect(queries.length).toBeGreaterThan(0);
    queries.forEach((queried) => {
      expect(queried.config.backgroundFilter).toBeUndefined();
    });

    // ...and the next publish must not carry the deleted restriction either.
    fireEvent.click(getByTestId('select-all'));
    expect(onFilterUpdate.mock.calls[0][0].config.backgroundFilter).toBeUndefined();
  });

  it('never narrows its own list by the restriction it published, whatever the host passes', () => {
    const seeded = filterFactory.members(textAttribute, ['France'], {
      backgroundFilter: allowedCountries,
    }) as MembersFilter;
    mockUseGetFilterMembers.mockClear();

    // No `dimensionFilters` at all: an older host, or standalone use. The nested clause on the
    // filter is still the widget's own output, so feeding it back would pin the list forever.
    render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        filter={seeded}
        onFilterUpdate={vi.fn()}
      />,
    );

    expect(activeMemberQueries()[0].config.backgroundFilter).toBeUndefined();
  });
});
