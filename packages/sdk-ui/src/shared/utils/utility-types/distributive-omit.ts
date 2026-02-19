/**
 * Utility type that applies `Omit` distributively over a union of types.
 *
 * In TypeScript, applying `Omit` directly to a union type causes the keys to be removed
 * from the union "as a whole", resulting in unintended behavior. This type fixes that by
 * distributing `Omit` to each member of the union individually.
 *
 * @template T The union of types to apply the omit to.
 * @template K The keys to omit from each type in the union.
 *
 * @example
 * type A = { type: 'a'; foo: string };
 * type B = { type: 'b'; bar: number };
 * type U = A | B;
 *
 * // Without distributive omit:
 * type Broken = Omit<U, 'type'>;
 * // Result: { foo?: string; bar?: number } - not a union anymore
 *
 * // With distributive omit:
 * type Fixed = DistributiveOmit<U, 'type'>;
 * // Result: { foo: string } | { bar: number } - still a union
 */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
