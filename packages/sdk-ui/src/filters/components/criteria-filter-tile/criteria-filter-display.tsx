/* eslint-disable security/detect-object-injection */
import { FunctionComponent } from 'react';
import {
  NumericFilterOptionType,
  NUMERIC_FILTER_MAP,
} from './criteria-filter-numeric-operations.js';

/**
 * Props for {@link CriteriaFilterDisplay}
 */
export interface CriteriaFilterDisplayProps {
  /* Type of numeric filter desired as enum, e.g. BETWEEN, LESS_THAN, etc. */
  filterType: NumericFilterOptionType;
  /* Default values for input fields */
  values?: number[];
}

/**
 * UI component that provides a static, uneditable display of the numeric filter values, to be shown when vertically aligned filter tiles are collapsed.
 *
 * @example
 * ```tsx
 * return (
 *  <CriteriaFilterDisplay
 *   filterType={NumericFilterOption.BETWEEN}
 *   values={[0, 100]}
 *   />
 * );
 * ```
 * @param props - Criteria filter menu props
 * @returns Criteria filter menu component
 */
export const CriteriaFilterDisplay: FunctionComponent<CriteriaFilterDisplayProps> = ({
  filterType,
  values = [],
}) => {
  const filterInfo = NUMERIC_FILTER_MAP[filterType];
  // eslint-disable-next-line sonarjs/no-unused-collection
  const rows: string[] = [];
  for (let i = 0; i < filterInfo.inputCount; i++) {
    rows.push(`${filterInfo.messages[i]} ${values[i]}`);
  }

  return (
    <div
      className={`csdk-leading-[26px] csdk-mx-auto csdk-my-2 csdk-px-1 csdk-text-[13px] csdk-whitespace-nowrap csdk-flex csdk-flex-wrap csdk-gap-x-1 csdk-justify-center`}
    >
      {rows.map((row, i) => {
        return <div key={i}>{row}</div>;
      })}
    </div>
  );
};
