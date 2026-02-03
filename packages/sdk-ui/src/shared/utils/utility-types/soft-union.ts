/**
 * Gets all unique keys from a union of object types.
 *
 * @template T - The union of object types.
 * @returns A union of all keys present in the types in `T`.
 *
 * @example
 * type Type1 = { a: number; b: string };
 * type Type2 = { b: string; c?: boolean };
 * type AllKeys = KeysOfUnion<Type1 | Type2>; // Evaluates to "a" | "b" | "c"
 */
type KeysOfUnion<T> = T extends unknown ? keyof T : never;

/**
 * Creates a "soft union" type from a union of object types. A soft union
 * combines the properties of all types in the union, making properties
 * optional with `undefined` if they are not present in a specific type
 * within the union.
 *
 * @template T - The union of object types.
 * @returns A type that represents the soft union of the types in `T`.
 * Each constituent type in the union `T` is augmented with the missing
 * properties from other types in `T`, typed as optional `undefined`.
 *
 * @example
 * type Type1 = { bar: string };
 * type Type2 = { agg: number };
 * type SoftUnionType = SoftUnion<Type1 | Type2>;
 * // Evaluates to:
 * // | { bar: string; agg?: undefined }
 * // | { bar?: undefined; agg: number; }
 *
 * @internal
 */
export type SoftUnion<T, K extends PropertyKey = KeysOfUnion<T>> = T extends unknown
  ? T & Partial<Record<Exclude<K, keyof T>, undefined>>
  : never;
