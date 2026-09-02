/**
 * Condition control for FilterWidget — routes to text or numeric implementation.
 * @internal
 */
import type { Attribute, DataSource, Filter } from '@sisense/sdk-data';

import { ConditionFilterNumeric } from './condition-filter-numeric.js';
import { ConditionFilterText } from './condition-filter-text.js';
import type { FieldOwnProps } from './field';

/** @internal */
export type ConditionKind = 'text' | 'numeric';

/** @internal */
export type ConditionFilterProps = FieldOwnProps & {
  attribute: Attribute;
  /** Linked dashboard filter; unsupported shapes seed empty. */
  filter?: Filter | null;
  /** Publishes on Apply and on the closed-trigger ✕. */
  onFilterUpdate?: (filter: Filter | null) => void;
  /**
   * When false, hide `+ Add condition`. Existing chain rows still render so a
   * saved multi-condition filter stays editable. Default true.
   */
  allowChaining?: boolean;
  /** Data source for the member-hint query. Falls back to the Sisense context default. */
  dataSource?: DataSource;
  /** Cascading parent filters, same as the List members query. */
  parentFilters?: Filter[];
  /** Text (default) or numeric condition catalogue. */
  conditionKind?: ConditionKind;
  placeholder?: string;
  id?: string;
};

/**
 * @param props - Attribute, linked filter, condition kind, and publish callback
 * @returns The Condition trigger and its drill-in panel
 * @internal
 */
export function ConditionFilter({
  conditionKind = 'text',
  dataSource,
  parentFilters,
  ...props
}: ConditionFilterProps) {
  switch (conditionKind) {
    case 'numeric':
      return <ConditionFilterNumeric {...props} />;
    case 'text':
      return (
        <ConditionFilterText {...props} dataSource={dataSource} parentFilters={parentFilters} />
      );
  }
}
