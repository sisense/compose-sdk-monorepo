/** @vitest-environment jsdom */
import type { CascadingFilter, Filter } from '@sisense/sdk-data';
import {
  createAttribute,
  filterFactory,
  isCascadingFilter,
  isMembersFilter,
} from '@sisense/sdk-data';
import { act, render, screen } from '@testing-library/react';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import type { FilterEditorConfig } from '../../filter-editor-popover/types';
import type { UseExistingFilterEditingConfig } from '../types';
import { isFilterSupportEditing, useExistingFilterEditing } from './use-existing-filter-editing';

type CapturedPopoverProps = {
  filter?: Filter | null;
  parentFilters?: Filter[];
  config?: FilterEditorConfig;
  onChange?: (filter: Filter) => void;
  onClose?: () => void;
};

let popoverProps: CapturedPopoverProps | null = null;

vi.mock('@/domains/filters/components/filter-editor-popover/filter-editor-popover', () => ({
  FilterEditorPopover: (props: CapturedPopoverProps) => {
    popoverProps = props;
    return <div data-testid="filter-editor-popover" />;
  },
}));

type HarnessApi = ReturnType<typeof useExistingFilterEditing>;

function renderHarness(config: UseExistingFilterEditingConfig = { enabled: true }) {
  const onFilterChanged = vi.fn();
  let api: HarnessApi | undefined;

  const Harness = () => {
    api = useExistingFilterEditing({ config, onFilterChanged });
    const { ExistingFilterEditor } = api;
    return <ExistingFilterEditor />;
  };

  render(<Harness />);

  const startEditing = (filter: Filter, levelIndex?: number) =>
    act(() => {
      if (!api) {
        throw new Error('Harness is not rendered');
      }
      api.startEditingFilter(document.createElement('div'), filter, levelIndex);
    });

  return { onFilterChanged, startEditing };
}

const genderFilter = filterFactory.members(DM.Commerce.Gender, ['Female'], { guid: 'gender' });
const ageRangeFilter = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: 'age' });
const conditionFilter = filterFactory.members(DM.Commerce.Condition, ['New'], {
  guid: 'condition',
});
const cascadingFilter = filterFactory.cascading([genderFilter, ageRangeFilter, conditionFilter], {
  guid: 'cascading',
});

describe('useExistingFilterEditing', () => {
  beforeEach(() => {
    popoverProps = null;
  });

  it('renders nothing until editing starts', () => {
    renderHarness();

    expect(screen.queryByTestId('filter-editor-popover')).not.toBeInTheDocument();
  });

  it('renders nothing when editing is disabled', () => {
    const { startEditing } = renderHarness({ enabled: false });

    startEditing(genderFilter);

    expect(screen.queryByTestId('filter-editor-popover')).not.toBeInTheDocument();
  });

  describe('regular filter', () => {
    it('edits the whole filter without parent filters or members-only mode', () => {
      const config = { enabled: true };
      const { startEditing } = renderHarness(config);

      startEditing(genderFilter);

      expect(popoverProps?.filter).toBe(genderFilter);
      expect(popoverProps?.parentFilters).toEqual([]);
      expect(popoverProps?.config).toBe(config);
    });

    it('passes the changed filter through as is', () => {
      const { startEditing, onFilterChanged } = renderHarness();
      const changedFilter = filterFactory.members(DM.Commerce.Gender, ['Male']);

      startEditing(genderFilter);
      act(() => popoverProps?.onChange?.(changedFilter));

      expect(onFilterChanged).toHaveBeenCalledExactlyOnceWith(changedFilter);
      // The popover hides itself once it has no filter to edit
      expect(popoverProps?.filter).toBeNull();
    });
  });

  describe('background filter', () => {
    const backgroundFilter = filterFactory.members(DM.Commerce.Gender, ['Female', 'Male']);
    const filterWithBackground = filterFactory.members(DM.Commerce.Gender, ['Female'], {
      backgroundFilter,
    });

    it('uses the background filter as a parent filter and edits in members-only mode', () => {
      const { startEditing } = renderHarness({ enabled: true, multiSelect: { visible: false } });

      startEditing(filterWithBackground);

      expect(popoverProps?.filter).toBe(filterWithBackground);
      expect(popoverProps?.parentFilters).toEqual([backgroundFilter]);
      expect(popoverProps?.config).toEqual({
        enabled: true,
        multiSelect: { visible: false },
        membersOnlyMode: true,
      });
    });
  });

  describe('cascading filter', () => {
    it('edits the requested level with the levels above it as parent filters', () => {
      const { startEditing } = renderHarness();

      startEditing(cascadingFilter, 2);

      expect(popoverProps?.filter).toBe(conditionFilter);
      expect(popoverProps?.parentFilters).toEqual([genderFilter, ageRangeFilter]);
      expect(popoverProps?.config?.membersOnlyMode).toBe(true);
    });

    it('edits the top level without parent filters', () => {
      const { startEditing } = renderHarness();

      startEditing(cascadingFilter, 0);

      expect(popoverProps?.filter).toBe(genderFilter);
      expect(popoverProps?.parentFilters).toEqual([]);
      expect(popoverProps?.config?.membersOnlyMode).toBe(true);
    });

    it('adds the background filter of the edited level after the levels above it', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '19-24']);
      const levelWithBackground = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], {
        guid: 'age',
        backgroundFilter,
      });
      const filter = filterFactory.cascading([genderFilter, levelWithBackground]);
      const { startEditing } = renderHarness();

      startEditing(filter, 1);

      expect(popoverProps?.parentFilters).toEqual([genderFilter, backgroundFilter]);
    });

    it('edits the cascading filter itself when no level is given', () => {
      const { startEditing } = renderHarness();

      startEditing(cascadingFilter);

      expect(popoverProps?.filter).toBe(cascadingFilter);
      expect(popoverProps?.parentFilters).toEqual([]);
    });

    it('replaces the edited level, keeps the levels above and clears the members below', () => {
      const { startEditing, onFilterChanged } = renderHarness();
      const changedLevel = filterFactory.members(DM.Commerce.AgeRange, ['19-24'], { guid: 'age' });

      startEditing(cascadingFilter, 1);
      act(() => popoverProps?.onChange?.(changedLevel));

      expect(onFilterChanged).toHaveBeenCalledOnce();
      const newFilter = onFilterChanged.mock.calls[0][0] as Filter;
      if (!isCascadingFilter(newFilter)) {
        throw new Error('Expected cascading filter');
      }
      const [top, middle, bottom] = newFilter.filters;
      expect(newFilter.config.guid).toBe('cascading');
      expect(top).toBe(genderFilter);
      expect(middle).toBe(changedLevel);
      expect(isMembersFilter(bottom) && bottom.members).toEqual([]);
      expect(bottom.attribute).toBe(conditionFilter.attribute);
      // The original level filter must stay untouched
      expect(isMembersFilter(conditionFilter) && conditionFilter.members).toEqual(['New']);
    });

    it('keeps the configuration of the members levels below the edited one', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.Condition, ['New', 'Used']);
      const lowerLevel = filterFactory.members(DM.Commerce.Condition, ['New'], {
        guid: 'condition',
        enableMultiSelection: false,
        backgroundFilter,
      });
      const filter = filterFactory.cascading([genderFilter, lowerLevel]);
      const { startEditing, onFilterChanged } = renderHarness();

      startEditing(filter, 0);
      act(() => popoverProps?.onChange?.(filterFactory.members(DM.Commerce.Gender, ['Male'])));

      const newFilter = onFilterChanged.mock.calls[0][0] as CascadingFilter;
      const bottom = newFilter.filters[1];
      if (!isMembersFilter(bottom)) {
        throw new Error('Expected members filter');
      }
      expect(bottom.members).toEqual([]);
      expect(bottom.config).toMatchObject({
        guid: 'condition',
        enableMultiSelection: false,
        backgroundFilter,
      });
    });

    it('keeps non-members levels below the edited one', () => {
      const rangeLevel = filterFactory.greaterThan(DM.Commerce.Cost, 100);
      const filter = filterFactory.cascading([genderFilter, rangeLevel]);
      const { startEditing, onFilterChanged } = renderHarness();

      startEditing(filter, 0);
      act(() => popoverProps?.onChange?.(filterFactory.members(DM.Commerce.Gender, ['Male'])));

      const newFilter = onFilterChanged.mock.calls[0][0] as CascadingFilter;
      expect(newFilter.filters[1]).toBe(rangeLevel);
    });
  });

  it('resets the edited level on close so the next edit starts clean', () => {
    const { startEditing } = renderHarness();

    startEditing(cascadingFilter, 2);
    act(() => popoverProps?.onClose?.());
    expect(screen.queryByTestId('filter-editor-popover')).not.toBeInTheDocument();

    startEditing(genderFilter);
    expect(popoverProps?.filter).toBe(genderFilter);
    expect(popoverProps?.parentFilters).toEqual([]);
    expect(popoverProps?.config?.membersOnlyMode).toBeUndefined();
  });
});

describe('isFilterSupportEditing', () => {
  it('supports cascading filters', () => {
    expect(isFilterSupportEditing(cascadingFilter)).toBe(true);
  });

  it('supports filters on text, numeric and date attributes', () => {
    expect(isFilterSupportEditing(genderFilter)).toBe(true);
    expect(isFilterSupportEditing(filterFactory.greaterThan(DM.Commerce.Cost, 100))).toBe(true);
    expect(isFilterSupportEditing(filterFactory.members(DM.Commerce.Date.Years, ['2020']))).toBe(
      true,
    );
  });

  it('does not support filters on attributes of an unknown value type', () => {
    const attribute = createAttribute({
      name: 'Blob',
      type: 'blob',
      expression: '[Commerce.Blob]',
    });
    expect(isFilterSupportEditing(filterFactory.members(attribute, []))).toBe(false);
  });
});
