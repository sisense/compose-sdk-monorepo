import { createAttribute, filterFactory, isMembersFilter } from '@sisense/sdk-data';
import type { Filter } from '@sisense/sdk-data';
import { describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import {
  connectFilterWidgetToProps,
  resolveFilterWidgetFilter,
} from './filter-widget-connector.js';

const attr = createAttribute({ name: 'Country', expression: '[Country.Country]', type: 'text' });
const brandAttr = createAttribute({ name: 'Brand', expression: '[Brand.Brand]', type: 'text' });
const memberFilter = filterFactory.members(attr, ['France', 'Italy']);

describe('connectFilterWidgetToProps — read path', () => {
  it('returns null filter when no link and no matching filter', () => {
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const result = connectFilterWidgetToProps({
      filters: [],
      setFilters,
      link: undefined,
      setLink,
    })({ attribute: attr });
    expect(result.filter).toBeNull();
  });

  it('returns filter by guid when link is set', () => {
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const result = connectFilterWidgetToProps({
      filters: [memberFilter],
      setFilters,
      link: { filterId: memberFilter.config.guid },
      setLink,
    })({ attribute: attr });
    expect(result.filter).toBe(memberFilter);
  });

  it('falls back to attribute match when no link is set', () => {
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const result = connectFilterWidgetToProps({
      filters: [memberFilter],
      setFilters,
      link: undefined,
      setLink,
    })({ attribute: attr });
    expect(result.filter).toBe(memberFilter);
  });

  it('does NOT mutate the filter or call setters during read', () => {
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const originalGuid = memberFilter.config.guid;
    connectFilterWidgetToProps({
      filters: [memberFilter],
      setFilters,
      link: undefined,
      setLink,
    })({ attribute: attr });
    expect(memberFilter.config.guid).toBe(originalGuid);
    expect(setFilters).not.toHaveBeenCalled();
    expect(setLink).not.toHaveBeenCalled();
  });
});

describe('connectFilterWidgetToProps — stale link re-validation', () => {
  it('ignores a link whose filter no longer matches the widget attribute', () => {
    const brandFilter = filterFactory.members(brandAttr, ['Nike']);
    const result = connectFilterWidgetToProps({
      filters: [brandFilter],
      setFilters: vi.fn(),
      link: { filterId: brandFilter.config.guid },
      setLink: vi.fn(),
    })({ attribute: attr });
    expect(result.filter).toBeNull();
  });

  it('resolves by attribute match when the link is stale', () => {
    const brandFilter = filterFactory.members(brandAttr, ['Nike']);
    const countryFilter = filterFactory.members(attr, ['France']);
    const result = connectFilterWidgetToProps({
      filters: [brandFilter, countryFilter],
      setFilters: vi.fn(),
      link: { filterId: brandFilter.config.guid },
      setLink: vi.fn(),
    })({ attribute: attr });
    expect(result.filter).toBe(countryFilter);
  });

  it('re-links by attribute on selection when the link is stale', () => {
    const brandFilter = filterFactory.members(brandAttr, ['Nike']);
    const countryFilter = filterFactory.members(attr, []);
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const selected = filterFactory.members(attr, ['France']);
    const originalGuid = selected.config.guid;
    const { onChange } = connectFilterWidgetToProps({
      filters: [brandFilter, countryFilter],
      setFilters,
      link: { filterId: brandFilter.config.guid },
      setLink,
    })({ attribute: attr });

    onChange(selected);

    expect(selected.config.guid).toBe(originalGuid);
    // The stale link must be repaired to the attribute-matching filter,
    // and the wrongly-linked brand filter must stay untouched.
    expect(setLink).toHaveBeenCalledWith({ filterId: countryFilter.config.guid });
    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters).toContain(brandFilter);
    const installed = updatedFilters.find((f) => f.config.guid === countryFilter.config.guid);
    if (!installed || !isMembersFilter(installed)) {
      throw new Error('Expected installed members filter');
    }
    expect(installed.members).toEqual(isMembersFilter(selected) ? selected.members : []);
  });
});

describe('connectFilterWidgetToProps — write path (onChange)', () => {
  it('establishes link and adds filter on first selection (no existing filter)', () => {
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const newFilter = filterFactory.members(attr, ['France']);
    const { onChange } = connectFilterWidgetToProps({
      filters: [],
      setFilters,
      link: undefined,
      setLink,
    })({ attribute: attr });

    onChange(newFilter);

    expect(setLink).toHaveBeenCalledWith({ filterId: newFilter.config.guid });
    expect(setFilters).toHaveBeenCalledWith([newFilter]);
  });

  it('replaces filter under stable guid on subsequent selections (link already set)', () => {
    const linkedGuid = memberFilter.config.guid;
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const updatedFilter = filterFactory.members(attr, ['Germany']);
    const originalGuid = updatedFilter.config.guid;

    const { onChange } = connectFilterWidgetToProps({
      filters: [memberFilter],
      setFilters,
      link: { filterId: linkedGuid },
      setLink,
    })({ attribute: attr });

    onChange(updatedFilter);

    expect(updatedFilter.config.guid).toBe(originalGuid);
    expect(setLink).not.toHaveBeenCalled();
    expect(setFilters).toHaveBeenCalledOnce();
    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters[0].config.guid).toBe(linkedGuid);
  });

  it('resets linked filter to include-all on onChange(null)', () => {
    const linkedGuid = memberFilter.config.guid;
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const { onChange } = connectFilterWidgetToProps({
      filters: [memberFilter],
      setFilters,
      link: { filterId: linkedGuid },
      setLink,
    })({ attribute: attr });

    onChange(null);

    expect(setFilters).toHaveBeenCalledOnce();
    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters).toHaveLength(1);
    expect(updatedFilters[0].config.guid).toBe(linkedGuid);
    expect(isMembersFilter(updatedFilters[0])).toBe(true);
    if (!isMembersFilter(updatedFilters[0])) return;
    expect(updatedFilters[0].members).toEqual([]);
  });

  it('preserves disabled when resetting a MembersFilter to include-all on onChange(null)', () => {
    const disabledMemberFilter = filterFactory.members(attr, ['France', 'Italy'], {
      disabled: true,
    });
    const linkedGuid = disabledMemberFilter.config.guid;
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const { onChange } = connectFilterWidgetToProps({
      filters: [disabledMemberFilter],
      setFilters,
      link: { filterId: linkedGuid },
      setLink,
    })({ attribute: attr });

    onChange(null);

    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters[0].config.guid).toBe(linkedGuid);
    expect(updatedFilters[0].config.disabled).toBe(true);
    expect(isMembersFilter(updatedFilters[0])).toBe(true);
    if (!isMembersFilter(updatedFilters[0])) return;
    expect(updatedFilters[0].members).toEqual([]);
  });

  it('resets a text condition filter to include-all MembersFilter on onChange(null)', () => {
    const textFilter = filterFactory.contains(brandAttr, 'b');
    const linkedGuid = textFilter.config.guid;
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const { onChange } = connectFilterWidgetToProps({
      filters: [textFilter],
      setFilters,
      link: { filterId: linkedGuid },
      setLink,
    })({ attribute: brandAttr });

    onChange(null);

    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters[0].config.guid).toBe(linkedGuid);
    expect(isMembersFilter(updatedFilters[0])).toBe(true);
    if (!isMembersFilter(updatedFilters[0])) return;
    expect(updatedFilters[0].members).toEqual([]);
  });

  it('adopts guid of existing same-attribute filter on first selection', () => {
    const panelFilter = filterFactory.members(attr, []);
    const panelGuid = panelFilter.config.guid;
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const selectedFilter = filterFactory.members(attr, ['France']);

    const { onChange } = connectFilterWidgetToProps({
      filters: [panelFilter],
      setFilters,
      link: undefined,
      setLink,
    })({ attribute: attr });

    onChange(selectedFilter);

    expect(setLink).toHaveBeenCalledWith({ filterId: panelGuid });
    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters[0].config.guid).toBe(panelGuid);
  });

  it('does nothing on onChange(null) when no link is set', () => {
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const { onChange } = connectFilterWidgetToProps({
      filters: [],
      setFilters,
      link: undefined,
      setLink,
    })({ attribute: attr });

    onChange(null);

    expect(setFilters).not.toHaveBeenCalled();
  });

  it('re-adds filter under stable guid if linked filter was removed externally', () => {
    const linkedGuid = memberFilter.config.guid;
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const newFilter = filterFactory.members(attr, ['Germany']);

    // filters array is empty but link still points to the old guid
    const { onChange } = connectFilterWidgetToProps({
      filters: [],
      setFilters,
      link: { filterId: linkedGuid },
      setLink,
    })({ attribute: attr });

    onChange(newFilter);

    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters[0].config.guid).toBe(linkedGuid);
  });
});

/**
 * A widget that moves to another granularity is still the same widget filtering the same
 * dimension, so it owns the same ONE filter. The attribute-identity match cannot see that
 * — a Quarters selection matches no Years filter — so a widget whose attribute had already
 * followed the level published a second filter and left its own previous one behind, giving
 * the panel two linked tiles for one widget.
 */
describe('connectFilterWidgetToProps — the widget owns one filter per dimension', () => {
  const yearsFilter = () => filterFactory.members(DM.Commerce.Date.Years, ['2009-01-01T00:00:00']);
  const quartersSelection = () =>
    filterFactory.members(DM.Commerce.Date.Quarters, ['2009-10-01T00:00:00']);

  it('replaces the filter it owned at the old level instead of adding a second one', () => {
    const owned = yearsFilter();
    const selected = quartersSelection();
    const originalGuid = selected.config.guid;
    const setFilters = vi.fn();
    const setLink = vi.fn();

    // The widget attribute has already followed the level (the host mirrored it), so the
    // link is stale by granularity while still pointing at this widget's own filter.
    const { onChange } = connectFilterWidgetToProps({
      filters: [owned],
      setFilters,
      link: { filterId: owned.config.guid },
      setLink,
    })({ attribute: DM.Commerce.Date.Quarters });

    onChange(selected);

    expect(selected.config.guid).toBe(originalGuid);
    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters).toHaveLength(1);
    expect(isMembersFilter(updatedFilters[0])).toBe(true);
    if (!isMembersFilter(updatedFilters[0])) return;
    expect(updatedFilters[0].members).toEqual(isMembersFilter(selected) ? selected.members : []);
    // Under the same guid, so filterRelations references still point at it.
    expect(updatedFilters[0].config.guid).toBe(owned.config.guid);
  });

  /**
   * The widget must be handed its own filter even when the host's copy of the widget still
   * names another level — when the host's widget metadata lags behind the committed level.
   * Handing back nothing left the widget reading its level off the stale attribute and
   * re-publishing its members there, which walked the commit back a level: `2010` at Years
   * came out as `Q1 2010`.
   */
  it('hands the widget the filter it committed, at the level it committed', () => {
    const committed = quartersSelection();
    const { filter, ownFilterAtOtherLevel } = resolveFilterWidgetFilter(
      [committed],
      // The host still names Years — its widget metadata lags behind the commit.
      DM.Commerce.Date.Years,
      { filterId: committed.config.guid },
    );

    expect(filter).toBe(committed);
    expect(ownFilterAtOtherLevel).toBe(committed);
  });

  it('still hands back nothing when the link points at another dimension', () => {
    const foreign = filterFactory.members(brandAttr, ['Nike']);
    const { filter, ownFilterAtOtherLevel } = resolveFilterWidgetFilter(
      [foreign],
      DM.Commerce.Date.Years,
      { filterId: foreign.config.guid },
    );

    expect(filter).toBeNull();
    expect(ownFilterAtOtherLevel).toBeNull();
  });

  it('leaves another dimension alone, even when the link points at it', () => {
    const foreign = filterFactory.members(brandAttr, ['Nike']);
    const selected = quartersSelection();
    const setFilters = vi.fn();

    const { onChange } = connectFilterWidgetToProps({
      filters: [foreign],
      setFilters,
      link: { filterId: foreign.config.guid },
      setLink: vi.fn(),
    })({ attribute: DM.Commerce.Date.Quarters });

    onChange(selected);

    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters).toContain(foreign);
    expect(updatedFilters).toHaveLength(2);
  });

  /* Precedence: its own filter first. A filter that happens to sit at the level the widget moved
     TO belongs to whoever made it — claiming that one instead left the widget's own behind as a
     second linked tile. */
  it('replaces its own filter, not a stranger that sits at the level it moved to', () => {
    const own = yearsFilter();
    const stranger = filterFactory.members(DM.Commerce.Date.Quarters, ['2011-01-01T00:00:00']);
    const selected = quartersSelection();
    const originalGuid = selected.config.guid;
    const setFilters = vi.fn();
    const setLink = vi.fn();

    const { onChange } = connectFilterWidgetToProps({
      filters: [own, stranger],
      setFilters,
      // Stale by granularity: the widget's attribute has followed the level, its filter has not.
      link: { filterId: own.config.guid },
      setLink,
    })({ attribute: DM.Commerce.Date.Quarters });

    onChange(selected);

    expect(selected.config.guid).toBe(originalGuid);
    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters).toHaveLength(2);
    const installed = updatedFilters.find((f) => f.config.guid === own.config.guid);
    if (!installed || !isMembersFilter(installed)) {
      throw new Error('Expected installed members filter');
    }
    expect(installed.members).toEqual(isMembersFilter(selected) ? selected.members : []);
    expect(updatedFilters).toContain(stranger);
    expect(setLink).toHaveBeenCalledWith({ filterId: own.config.guid });
  });

  // ... and reads it back the same way. Resolving the stranger would show the widget a foreign
  // selection at the level it moved to while the write path replaced its own filter.
  it('reads its own filter back, not the stranger at the level it moved to', () => {
    const own = yearsFilter();
    const stranger = filterFactory.members(DM.Commerce.Date.Quarters, ['2011-01-01T00:00:00']);

    const { filter } = resolveFilterWidgetFilter([own, stranger], DM.Commerce.Date.Quarters, {
      filterId: own.config.guid,
    });

    expect(filter).toBe(own);
  });

  /* Another widget's filter on the same dimension is not this widget's to take: the two sit
     on different levels on purpose, which is what excludedDateLevels keeps apart. */
  it('does not claim a same-dimension filter it was never linked to', () => {
    const otherWidgetsFilter = yearsFilter();
    const selected = quartersSelection();
    const setFilters = vi.fn();

    const { onChange } = connectFilterWidgetToProps({
      filters: [otherWidgetsFilter],
      setFilters,
      link: undefined,
      setLink: vi.fn(),
    })({ attribute: DM.Commerce.Date.Quarters });

    onChange(selected);

    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters).toEqual([otherWidgetsFilter, selected]);
  });
});
