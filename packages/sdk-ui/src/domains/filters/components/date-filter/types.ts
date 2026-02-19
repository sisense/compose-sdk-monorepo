/**
 * @internal
 */
export type DateFilterRange = {
  type: 'date-range';
  filter: DateRange;
};

/**
 * @internal
 */
export type DateRange = {
  from?: string; // example string format '2023-05-02'
  to?: string;
};
