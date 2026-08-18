/** @vitest-environment jsdom */
import {
  createAttribute,
  DateLevels,
  type DimensionalLevelAttribute,
  filterFactory,
  isLevelAttribute,
  type MembersFilter,
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
// Mock the member query hook and MembersFilterSelect so the dropdown's own
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

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return { ...actual, useTranslation: () => ({ t: (key: string) => key }) };
});

vi.mock('./members-filter-select', () => ({
  MembersFilterSelect: ({
    selectedMembers,
    excludeMembers,
    enableMultiSelection,
    onSelectMember,
    onSelectAll,
    onClearAll,
    onListScroll,
    onSearchValueChange,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test stub only reads the props it renders
  any) => (
    <div>
      <div data-testid={enableMultiSelection ? 'multi-select' : 'single-select'} />
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
}));

vi.mock('@/domains/filters/components/filter-editor-popover/common/select', () => ({
  SingleSelect: ({ value, onChange }: any) => (
    <div>
      <div data-testid="granularity-select" />
      <div data-testid="granularity-value">{value ?? ''}</div>
      <button data-testid="granularity-change" onClick={() => onChange('Months')} />
    </div>
  ),
}));

const textAttribute = createAttribute({
  name: 'Country',
  expression: '[Country.Country]',
  type: 'text',
});

describe('FilterWidgetDropdown', () => {
  beforeEach(() => {
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

  it('renders the granularity + value selects for a date attribute', () => {
    const { getByTestId } = render(<FilterWidgetDropdown attribute={DM.Commerce.Date.Years} />);
    expect(getByTestId('granularity-select')).toBeInTheDocument();
  });

  it('emits the new level attribute on a granularity change', () => {
    const onDateLevelChange = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={DM.Commerce.Date.Years}
        onFilterUpdate={vi.fn()}
        onDateLevelChange={onDateLevelChange}
      />,
    );
    fireEvent.click(getByTestId('granularity-change'));
    expect(onDateLevelChange).toHaveBeenCalledTimes(1);
    expect(onDateLevelChange.mock.calls[0][0].granularity).toBe('Months');
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
