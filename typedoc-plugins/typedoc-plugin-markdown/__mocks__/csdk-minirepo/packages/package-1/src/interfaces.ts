export interface CallableInterface {
  (): string;
}

export interface IndexableInterface {
  [index: number]: string;
}

export interface Animal {
  name?: string;
}

/**
 * Description of Dog
 *
 * @beta
 */
export interface Dog extends Animal {
  /**
   * Breed of dog
   *
   * @beta
   */
  breed: string;

  /**
   * @category Old Stuff (Deprecated)
   * @deprecated Use {@link Dog.breed} instead.
   */
  nickName: string;
}

/** Sorting direction, either in Ascending order, Descending order, or None */
export type SortDirection = 'sortAsc' | 'sortDesc' | 'sortNone';

/**
 * Sorting configuration for pivot "rows".
 *
 * This configuration allows sorting pivot "rows" either by their data or by data in a specific "values" column.
 *
 * @example
 * Examples of sorting configurations for various scenarios:
 *
 * (1) Row sorted in ascending order by its data:
 * ```ts
 * { direction: 'sortAsc' }
 * ```
 *
 * (2) Row sorted in descending order by data in the first "values" column (index 0):
 * ```ts
 * {
 *    direction: 'sortDesc',
 *    by: {
 *      valuesIndex: 0,
 *    }
 * }
 * ```
 *
 * (3) Row sorted in ascending order by data in the second "values" column (index 1) under the "columns" values of "Female" (for Gender) and "0-18" (for AgeRange):
 * ```ts
 * {
 *    direction: 'sortAsc',
 *    by: {
 *      valuesIndex: 1,
 *      columnsMembersPath: ['Female', '0-18']
 *    }
 * }
 * ```
 */
export type PivotRowsSort = {
  /** {@inheritDoc SortDirection} */
  direction: SortDirection;
  /** Sorting target configuration, allowing sorting "rows" by the data in a specific "values" column */
  by?: {
    /** Index of the target "values" item (measure) */
    valuesIndex?: number;
    /** Path to the target column if selected "columns" items (dimensions) are involved */
    columnsMembersPath?: (string | number)[];
  };
};

/**
 * Some props
 *
 * @group Group 1
 */
export interface SomeProps {
  readonly prop1: string;
  prop2: string;
  prop3: string;
  /**
   * Sorting configuration that represents either {@link SortDirection} or {@link PivotRowsSort} for the pivot table
   */
  sortType?: PivotRowsSort | SortDirection;
}

export type Type1 = 'type1';
export type Type2 = { prop1: string; prop2: boolean };

/**
 * Some Interface
 */
export interface SomeInterface {
  someUnionType: Type1 | Type2;
}

/**
 * Some config
 *
 * @default []
 */
export interface SomeConfig extends SomeProps {
  /**
   * Comments
   */
  callbacks?: SomeProps & {
    authorized?: (params: { request: boolean; auth: string }) => string;
  };
}
