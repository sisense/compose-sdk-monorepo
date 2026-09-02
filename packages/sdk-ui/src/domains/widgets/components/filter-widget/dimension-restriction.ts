import { type Attribute, type Filter, filterFactory, type MembersFilter } from '@sisense/sdk-data';

import { isSameAttribute } from '@/shared/utils/filters';

/**
 * Finds the widget's own dimension filter on its own dimension, which the published filter
 * carries as a background filter — Fusion's `{ all: true, filter: <clause> }`.
 *
 * Select-all is representational (`members: []`, `excludeMembers: true`), and on its own that means
 * every member of the DIMENSION. The background filter is what qualifies it back down to the
 * members the widget's author allows, at a fixed size no matter how many members that is.
 *
 * A dimension filter on ANOTHER dimension has no place here: a nested clause is split back out at
 * query time onto its parent's dim, so it cannot name a second one. Those still narrow the dropdown
 * list, but the published filter cannot express them.
 * @param dimensionFilters - The widget's own dimension filters
 * @param attribute - The attribute the widget filters on
 * @returns The same-dimension restriction, or undefined when the widget has none
 * @internal
 */
export function asBackgroundFilter(
  dimensionFilters: readonly Filter[],
  attribute: Attribute,
): Filter | undefined {
  return dimensionFilters.find((f) => isSameAttribute(f.attribute, attribute));
}

/**
 * Returns a transformer putting exactly the restriction a selection needs on it — including none.
 *
 * Only a selection that already means EVERYTHING has anything to qualify: select-all
 * (`members: []`, excluding nothing) and exclude-mode (everything but these). Those are the
 * selections the dimension filter has to narrow back down.
 *
 * An include-mode selection must be left alone. Its members are inside the allowed set already,
 * so the restriction would be redundant — and an empty one means the reader has chosen nothing,
 * where attaching it filtered the whole dashboard by the widget's dimension filter before anyone
 * had picked a value.
 *
 * Authoritative rather than additive: anything already on the filter is an echo of an earlier
 * publish, and leaving that echo in place kept a deleted dimension filter applying forever.
 * @param backgroundFilter - Same-dimension restriction, or undefined for none
 * @returns A transformer over the filter about to be published
 * @internal
 */
export const withBackgroundFilter =
  (backgroundFilter: Filter | undefined) =>
  /* Not `Readonly<MembersFilter>`: the mapped type drops the class's private members, so the
     result no longer satisfies MembersFilter. The transformer does not mutate its input. */
  (filter: MembersFilter): MembersFilter => {
    const restriction = filter.config.excludeMembers ? backgroundFilter : undefined;
    if (filter.config.backgroundFilter === restriction) {
      return filter;
    }
    const { backgroundFilter: previous, ...restConfig } = filter.config;
    // Cast rationale: filterFactory.members returns the base Filter type but always
    // constructs a MembersFilter.
    return filterFactory.members(filter.attribute, filter.members, {
      ...restConfig,
      ...(restriction ? { backgroundFilter: restriction } : {}),
    }) as MembersFilter;
  };

/**
 * Returns `filter` with any restriction stripped from its config, for use as a query filter.
 *
 * The restriction reaches the member query through `parentFilters`, which the host keeps current.
 * Reading it off the filter as well would apply it twice, and — because the widget is what wrote it
 * there — would make the list narrow itself: the clause outlives the dimension filter that produced
 * it, comes back in on the next seed, and the list never widens again.
 * @param filter - The filter to query members with
 * @returns A new filter without a background filter; `filter` unchanged when it has none
 * @internal
 */
export function withoutBackgroundFilter(filter: MembersFilter): MembersFilter {
  if (!filter.config.backgroundFilter) {
    return filter;
  }
  return withBackgroundFilter(undefined)(filter);
}
