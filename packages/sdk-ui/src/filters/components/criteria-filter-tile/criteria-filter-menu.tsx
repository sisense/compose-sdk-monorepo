/* eslint-disable security/detect-object-injection */
import { FunctionComponent } from 'react';
import { BasicInput } from '../common';
import { NumericFilterOptionType, NUMERIC_FILTER_MAP } from './criteria-filter-numeric-operations';
import { useThemeContext } from '../../../../src/theme-provider';

/**
 * Props for {@link CriteriaFilterMenu}
 *
 * @internal
 */
export interface CriteriaFilterMenuProps {
  /* Type of numeric filter desired as enum, e.g. BETWEEN, LESS_THAN, etc. */
  filterType: NumericFilterOptionType;
  /* Default values for input fields */
  defaultValues?: number[];
  /* Callback for when input fields are updated */
  onUpdate?: (values: number[]) => void;
  /* Whether the filter is disabled */
  disabled?: boolean;
}

/**
 * @internal
 */
const CriteriaFilterMenuSingle: FunctionComponent<CriteriaFilterMenuProps> = (props) => {
  const { filterType, defaultValues = [], onUpdate, disabled } = props;
  const filterInfo = NUMERIC_FILTER_MAP[filterType];
  return (
    <BasicInput
      type="number"
      label={filterInfo.messages[0]}
      value={defaultValues?.[0]?.toString() ?? ''}
      callback={(newVal: string) => {
        onUpdate?.([Number(newVal)]);
      }}
      required={true}
      variant={'white'}
      disabled={disabled}
    />
  );
};

/**
 * UI component that provides field(s) for the user to enter values for a numeric filter.
 *
 * @internal
 */
export const CriteriaFilterMenu: FunctionComponent<CriteriaFilterMenuProps> = ({
  filterType,
  defaultValues = [],
  onUpdate,
  disabled,
}) => {
  const { themeSettings } = useThemeContext();
  const filterInfo = NUMERIC_FILTER_MAP[filterType];
  return (
    <div
      className={`csdk-w-min csdk-mx-auto csdk-my-2 csdk-px-1 csdk-text-[13px] csdk-flex csdk-gap-x-2 csdk-gap-y-0.5 csdk-flex-col'`}
      style={{ color: `${themeSettings.typography.primaryTextColor}!important` }}
    >
      {filterInfo?.inputCount === 1 && (
        <CriteriaFilterMenuSingle
          filterType={filterType}
          defaultValues={defaultValues}
          onUpdate={onUpdate}
          disabled={disabled}
        />
      )}
    </div>
  );
};
