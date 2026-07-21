/** @vitest-environment jsdom */
import { createAttribute, filterFactory } from '@sisense/sdk-data';
import type { MembersFilter } from '@sisense/sdk-data';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

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
    // Cross-filtering / external multi-select injected several members into the shared
    // filter; the widget must reflect the filter instead of truncating to the first.
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
// Mock the member query hook and the leaf select components so the dropdown's own
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

// Structural subset of GetFilterMembersParams covering the fields these tests assert.
// Typing the mock at its boundary lets `mock.calls` be consumed via inference (no casts).
type MembersHookParams = { filter: MembersFilter; enabled?: boolean };

const mockUseGetFilterMembers = vi.fn((_params: MembersHookParams) => ({
  data: mockMembersData,
  loadMore: mockLoadMore,
  isLoading: mockMembersLoading,
}));

vi.mock('@/domains/filters/hooks/use-get-filter-members', () => ({
  useGetFilterMembersInternal: (params: MembersHookParams) => mockUseGetFilterMembers(params),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return { ...actual, useTranslation: () => ({ t: (key: string) => key }) };
});

vi.mock(
  '@/domains/filters/components/filter-editor-popover/common/select/searchable-multi-select',
  () => ({
    SearchableMultiSelect: ({ values, onChange, onListScroll, onSearchUpdate }: any) => (
      <div>
        <div data-testid="multi-select" />
        <div data-testid="multi-values">{JSON.stringify(values)}</div>
        <button data-testid="multi-change" onClick={() => onChange(['France', 'Italy'])} />
        <button
          data-testid="multi-scroll"
          onClick={() => onListScroll({ top: 0.9, direction: 'down' })}
        />
        <button data-testid="multi-search" onClick={() => onSearchUpdate?.('fra')} />
      </div>
    ),
  }),
);

vi.mock(
  '@/domains/filters/components/filter-editor-popover/common/select/searchable-single-select',
  () => ({
    SearchableSingleSelect: ({ value, onChange }: any) => (
      <div>
        <div data-testid="single-select" />
        <div data-testid="single-value">{value ?? ''}</div>
        <button data-testid="single-change" onClick={() => onChange('France')} />
      </div>
    ),
  }),
);

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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the placeholder when the attribute has no expression', () => {
    const empty = createAttribute({ name: 'x', expression: '', type: 'text' });
    const { queryByTestId, getByText } = render(<FilterWidgetDropdown attribute={empty} />);
    expect(queryByTestId('multi-select')).toBeNull();
    expect(queryByTestId('single-select')).toBeNull();
    expect(getByText('filterWidget.selectDimensionPlaceholder')).toBeInTheDocument();
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

  it('calls onFilterUpdate with the selected members on a multi change', () => {
    const onFilterUpdate = vi.fn();
    const { getByTestId } = render(
      <FilterWidgetDropdown
        attribute={textAttribute}
        isMultiselect={true}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    fireEvent.click(getByTestId('multi-change'));
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const updated = onFilterUpdate.mock.calls[0][0];
    expect(updated.members).toEqual(['France', 'Italy']);
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
      // Flush the 300ms search debounce; the resulting state update re-renders the
      // dropdown, so the members hook is re-invoked with the new search filter.
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
    expect(getByTestId('single-value').textContent).toBe('Italy');
  });

  // ── isMultiselect toggle realigns the filter (SNS-131674) ────────────────────
  // The synchronized filter's enableMultiSelection is seeded once, so a live toggle
  // of isMultiselect (widget editor / standalone) was previously ignored. Mirrors the
  // filter editor popup's MembersSection reduce-on-toggle behavior.
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

  // ── Dimension change rebuilds the filter (SNS-131802) ────────────────────────
  // The synchronized filter is seeded once (useSynchronizedFilter useState). In the
  // widget editor the dropdown mounts BEFORE a dimension is picked (empty attribute)
  // and receives the real attribute via a prop swap — without a rebuild the member
  // query keeps targeting the stale (empty or previous) attribute forever, so the
  // dropdown stays empty with no request and no error.
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
    // Every enabled query after the swap targets the NEW attribute — a transient
    // enabled call still carrying the stale empty filter would hit the analytical
    // engine with an empty dim.
    expect(enabledCalls.length).toBeGreaterThan(0);
    enabledCalls.forEach((params) => {
      expect(params.filter.attribute.expression).toBe('[Country.Country]');
    });
  });

  it('disables the member query while no dimension is picked (empty attribute)', () => {
    // The editor mounts the dropdown before a dimension exists; querying an empty
    // dimension is rejected by the analytical engine ("Jaql element doesn't contain
    // dim") — the query must stay disabled until a real attribute arrives.
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

    // Every enabled query after the swap targets the NEW attribute — none may still
    // carry the previous dimension's filter.
    const enabledCalls = getMembersHookCalls(callsBeforeSwap).filter((params) => params.enabled);
    expect(enabledCalls.length).toBeGreaterThan(0);
    enabledCalls.forEach((params) => {
      expect(params.filter.attribute.expression).toBe('[Brand.Brand]');
    });
    // The rebuilt (empty) selection for the new dimension is propagated to the host,
    // so the editor records a cleared selection instead of the old dimension's members.
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
