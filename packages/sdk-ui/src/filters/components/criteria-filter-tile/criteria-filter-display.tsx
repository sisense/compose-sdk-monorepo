/* eslint-disable security/detect-object-injection */
import { FunctionComponent } from 'react';
import {
  FilterOptionType,
  CRITERIA_FILTER_MAP,
  CriteriaFilterValueType,
} from './criteria-filter-operations.js';
import { useTranslation } from 'react-i18next';

/**
 * Props for {@link CriteriaFilterDisplay}
 */
export interface CriteriaFilterDisplayProps {
  /* Type of filter desired, e.g. BETWEEN, LESS_THAN, etc. */
  filterType: FilterOptionType;
  /* Default values for input fields */
  values?: CriteriaFilterValueType[];
}

/**
 * UI component that provides a static, uneditable display of the criteria filter values, to be shown when vertically aligned filter tiles are collapsed.
 *
 * @example
 * ```tsx
 * return (
 *  <CriteriaFilterDisplay
 *   filterType={FilterOption.BETWEEN}
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
  const filterInfo = CRITERIA_FILTER_MAP[filterType];
  const { t } = useTranslation();

  // eslint-disable-next-line sonarjs/no-unused-collection
  let text = '';
  switch (filterInfo.inputCount) {
    case 1:
      text += t(filterInfo.message, { val: values[0]?.toString() });
      break;
    case 2:
      text += t(filterInfo.message, { valA: values[0]?.toString(), valB: values[1]?.toString() });
      break;
    default:
      for (let i = 0; i < filterInfo.inputCount; i++) {
        text += `${filterInfo.symbols[i]} ${values[i]}`;
      }
  }

  return (
    <div
      className={`csdk-leading-[26px] csdk-mx-auto csdk-my-2 csdk-px-1 csdk-text-[13px] csdk-whitespace-nowrap csdk-flex csdk-flex-wrap csdk-gap-x-1 csdk-justify-center`}
    >
      {t(text)}
    </div>
  );
};
