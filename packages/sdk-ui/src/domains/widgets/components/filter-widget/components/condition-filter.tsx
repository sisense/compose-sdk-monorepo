/**
 * Condition control for FilterWidget — routes to text, numeric, or date implementation.
 * @internal
 */
import type { Attribute, DataSource, Filter } from '@sisense/sdk-data';

import { ConditionFilterDate } from './condition-filter-date.js';
import { ConditionFilterNumeric } from './condition-filter-numeric.js';
import { ConditionFilterText } from './condition-filter-text.js';
import type { FieldOwnProps } from './field';

/** @internal */
export type ConditionKind = 'text' | 'numeric' | 'date';

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
  /** Text (default), numeric, or date condition catalogue. */
  conditionKind?: ConditionKind;
  placeholder?: string;
  id?: string;
  /** Injectable so a date-condition test renders the same on any day. */
  today?: Date;
  /** Earliest day the data covers. Greys earlier days and aims the quick chips; never blocks a pick. */
  earliestData?: Date;
  /** Latest day the data covers. Greys later days and aims the quick chips; never blocks a pick. */
  latestData?: Date;
  /**
   * Date levels another FilterWidget / dashboard filter already claims on this dim.
   * Date Condition hides them from Last/This/Next grain and, when Days is listed,
   * hides Before / After anchors that would re-level onto Days.
   */
  excludedDateLevels?: readonly string[];
};

/**
 * @param props - Attribute, linked filter, condition kind, and publish callback.
 * @returns The Condition trigger and its drill-in panel.
 * @internal
 */
export function ConditionFilter(props: ConditionFilterProps) {
  const {
    conditionKind = 'text',
    dataSource,
    parentFilters,
    today,
    earliestData,
    latestData,
    excludedDateLevels,
    ...rest
  } = props;
  switch (conditionKind) {
    case 'numeric':
      return <ConditionFilterNumeric {...rest} />;
    case 'date':
      return (
        <ConditionFilterDate
          {...rest}
          today={today}
          earliestData={earliestData}
          latestData={latestData}
          excludedDateLevels={excludedDateLevels}
        />
      );
    case 'text':
      return (
        <ConditionFilterText {...rest} dataSource={dataSource} parentFilters={parentFilters} />
      );
  }
}
