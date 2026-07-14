import { createAttribute, filterFactory } from '@sisense/sdk-data';
import type { Filter } from '@sisense/sdk-data';
import { describe, expect, it, vi } from 'vitest';

import { connectFilterWidgetToProps } from './filter-widget-connector.js';

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
    const { onChange } = connectFilterWidgetToProps({
      filters: [brandFilter, countryFilter],
      setFilters,
      link: { filterId: brandFilter.config.guid },
      setLink,
    })({ attribute: attr });

    onChange(selected);

    // The stale link must be repaired to the attribute-matching filter,
    // and the wrongly-linked brand filter must stay untouched.
    expect(setLink).toHaveBeenCalledWith({ filterId: countryFilter.config.guid });
    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters).toContain(brandFilter);
    expect(updatedFilters.find((f) => f.config.guid === countryFilter.config.guid)).toBe(selected);
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

    const { onChange } = connectFilterWidgetToProps({
      filters: [memberFilter],
      setFilters,
      link: { filterId: linkedGuid },
      setLink,
    })({ attribute: attr });

    onChange(updatedFilter);

    expect(setLink).not.toHaveBeenCalled();
    expect(setFilters).toHaveBeenCalledOnce();
    const updatedFilters = setFilters.mock.calls[0][0] as Filter[];
    expect(updatedFilters[0].config.guid).toBe(linkedGuid);
  });

  it('removes linked filter on onChange(null)', () => {
    const setFilters = vi.fn();
    const setLink = vi.fn();
    const { onChange } = connectFilterWidgetToProps({
      filters: [memberFilter],
      setFilters,
      link: { filterId: memberFilter.config.guid },
      setLink,
    })({ attribute: attr });

    onChange(null);

    expect(setFilters).toHaveBeenCalledWith([]);
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
