import merge from 'ts-deepmerge';

/**
 * Deep-merges a partial `update` into `base` for widget-update persistence.
 *
 * Merge semantics (shared by every merge point of the unified widget-update
 * channel — pending-update accumulator, optimistic apply, model reducer and
 * DTO patch):
 * - nested plain objects are merged recursively at any depth;
 * - arrays, primitives and non-plain objects (e.g. `Date`) are replaced
 *   wholesale (last-write-wins);
 * - keys cannot be deleted via merge — overwrite with an explicit value
 *   (e.g. `null`) instead.
 *
 * Pure: returns a new object, never mutates the inputs.
 *
 * @internal
 */
export function deepMerge<T extends object>(base: T, update: object): T {
  return merge.withOptions({ mergeArrays: false }, base, update) as T;
}
