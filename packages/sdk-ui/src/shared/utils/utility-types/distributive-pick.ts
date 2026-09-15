/**
 * Utility type that applies `Pick` distributively over a union of types.
 *
 * In TypeScript, applying `Pick` directly to a union type collapses it into a single object
 * whose properties are unions, which discards the correlation between a discriminant and the
 * rest of the members. This type fixes that by distributing `Pick` to each member of the union
 * individually. Keys missing from a given member are skipped rather than erroring, so the same
 * key list can be applied across members of differing shapes.
 *
 * @template T The union of types to pick from.
 * @template K The keys to pick from each type in the union.
 *
 * @example
 * type A = { type: 'a'; value: string; extra: boolean };
 * type B = { type: 'b'; value: number; extra: boolean };
 * type U = A | B;
 *
 * // Without distributive pick:
 * type Broken = Pick<U, 'type' | 'value'>;
 * // Result: { type: 'a' | 'b'; value: string | number } - allows { type: 'a'; value: 1 }
 *
 * // With distributive pick:
 * type Fixed = DistributivePick<U, 'type' | 'value'>;
 * // Result: { type: 'a'; value: string } | { type: 'b'; value: number } - still a union
 */
export type DistributivePick<T, K extends keyof any> = T extends any
  ? Pick<T, Extract<keyof T, K>>
  : never;
