import { createAttribute, filterFactory, type MembersFilter } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  asBackgroundFilter,
  withBackgroundFilter,
  withoutBackgroundFilter,
} from './dimension-restriction.js';

const country = createAttribute({
  name: 'Country',
  expression: '[Lead Generation.Country]',
  type: 'text',
});
const cost = createAttribute({
  name: 'Cost',
  expression: '[Lead Generation.Cost]',
  type: 'numeric',
});

const allowedCountries = filterFactory.members(country, ['England', 'France', 'Germany']);
const costOverThreshold = filterFactory.greaterThan(cost, 400);

describe('asBackgroundFilter', () => {
  it('is undefined when the widget has no dimension filters', () => {
    expect(asBackgroundFilter([], country)).toBeUndefined();
  });

  it('picks the filter on the widget’s own dimension', () => {
    expect(asBackgroundFilter([allowedCountries], country)).toBe(allowedCountries);
  });

  it('ignores a filter on another dimension, which a nested clause cannot name', () => {
    expect(asBackgroundFilter([costOverThreshold], country)).toBeUndefined();
  });

  it('picks only the own-dimension one when the widget restricts both', () => {
    expect(asBackgroundFilter([costOverThreshold, allowedCountries], country)).toBe(
      allowedCountries,
    );
  });
});

describe('withBackgroundFilter', () => {
  it('attaches the restriction, keeping the selection and the rest of the config', () => {
    const filter = filterFactory.members(country, ['France'], {
      guid: 'linked-guid',
      excludeMembers: true,
      enableMultiSelection: true,
    }) as MembersFilter;

    const result = withBackgroundFilter(allowedCountries)(filter);

    expect(result.config.backgroundFilter).toBe(allowedCountries);
    expect(result.members).toEqual(['France']);
    expect(result.config.guid).toBe('linked-guid');
    expect(result.config.excludeMembers).toBe(true);
    expect(result.config.enableMultiSelection).toBe(true);
  });

  it('makes select-all resolve to the allowed members rather than the whole dimension', () => {
    const selectAll = filterFactory.members(country, [], {
      excludeMembers: true,
    }) as MembersFilter;

    expect(withBackgroundFilter(allowedCountries)(selectAll).filterJaql()).toEqual({
      and: [{ exclude: { members: [] } }, allowedCountries.filterJaql()],
    });
  });

  it('leaves a cleared selection unqualified — nothing picked means nothing filtered', () => {
    // Regression: qualifying an empty include list filtered the whole dashboard by the widget's
    // dimension filter before the reader had picked any value.
    const cleared = filterFactory.members(country, [], { excludeMembers: false }) as MembersFilter;

    expect(withBackgroundFilter(allowedCountries)(cleared).config.backgroundFilter).toBeUndefined();
  });

  it('leaves an explicit include list unqualified — its members are already allowed', () => {
    const picked = filterFactory.members(country, ['France']) as MembersFilter;

    expect(withBackgroundFilter(allowedCountries)(picked).config.backgroundFilter).toBeUndefined();
  });

  it('qualifies exclude mode, which also means every member', () => {
    const excluding = filterFactory.members(country, ['France'], {
      excludeMembers: true,
    }) as MembersFilter;

    expect(withBackgroundFilter(allowedCountries)(excluding).config.backgroundFilter).toBe(
      allowedCountries,
    );
  });

  it('returns the filter untouched when it has no restriction and none applies', () => {
    const filter = filterFactory.members(country, ['France']) as MembersFilter;

    expect(withBackgroundFilter(undefined)(filter)).toBe(filter);
  });

  it('drops a restriction the widget no longer has, so a deleted dimension filter stops applying', () => {
    const filter = filterFactory.members(country, ['France'], {
      guid: 'linked-guid',
      excludeMembers: true,
      backgroundFilter: allowedCountries,
    }) as MembersFilter;

    const result = withBackgroundFilter(undefined)(filter);

    expect(result.config.backgroundFilter).toBeUndefined();
    expect(result.members).toEqual(['France']);
    expect(result.config.guid).toBe('linked-guid');
  });

  it('replaces a restriction that has been edited rather than keeping the old one', () => {
    const filter = filterFactory.members(country, [], {
      excludeMembers: true,
      backgroundFilter: allowedCountries,
    }) as MembersFilter;
    const narrowed = filterFactory.members(country, ['France']);

    expect(withBackgroundFilter(narrowed)(filter).config.backgroundFilter).toBe(narrowed);
  });

  it('does not rebuild the filter when it already carries the restriction', () => {
    const filter = filterFactory.members(country, ['France'], {
      excludeMembers: true,
      backgroundFilter: allowedCountries,
    }) as MembersFilter;

    expect(withBackgroundFilter(allowedCountries)(filter)).toBe(filter);
  });
});

describe('withoutBackgroundFilter', () => {
  it('strips the restriction so the member query is not narrowed by it twice', () => {
    const filter = filterFactory.members(country, ['France'], {
      guid: 'linked-guid',
      backgroundFilter: allowedCountries,
    }) as MembersFilter;

    const result = withoutBackgroundFilter(filter);

    expect(result.config.backgroundFilter).toBeUndefined();
    expect(result.members).toEqual(['France']);
    expect(result.config.guid).toBe('linked-guid');
  });

  it('returns the filter itself when it carries no restriction', () => {
    const filter = filterFactory.members(country, ['France']) as MembersFilter;

    expect(withoutBackgroundFilter(filter)).toBe(filter);
  });
});
