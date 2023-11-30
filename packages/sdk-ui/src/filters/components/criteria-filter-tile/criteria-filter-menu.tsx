/* eslint-disable security/detect-object-injection */
import { FunctionComponent } from 'react';
import { BasicInput } from '../common';
import {
  FilterOptionType,
  CRITERIA_FILTER_MAP,
  isVertical,
  FilterVariant,
  translatedMsgNoVal,
} from './criteria-filter-operations';
import { useThemeContext } from '../../../../src/theme-provider';
import { useTranslation } from 'react-i18next';

/**
 * Props for {@link CriteriaFilterMenu}
 *
 * @internal
 */
export interface CriteriaFilterMenuProps {
  /* Type of numeric filter desired as enum, e.g. BETWEEN, LESS_THAN, etc. */
  filterType: FilterOptionType;
  /* Arrangement of input fields, either vertical or horizontal */
  arrangement?: FilterVariant;
  /* Default values for input fields */
  defaultValues?: (number | string)[];
  /* Callback for when input fields are updated */
  onUpdate?: (values: (number | string)[]) => void;
  /* Whether the filter is disabled */
  disabled?: boolean;
}

/**
 * @internal
 */
const CriteriaFilterMenuSingle: FunctionComponent<CriteriaFilterMenuProps> = (props) => {
  const { filterType, defaultValues = [], onUpdate, disabled } = props;
  const filterInfo = CRITERIA_FILTER_MAP[filterType];
  const { t } = useTranslation();
  return (
    <BasicInput
      type={`${filterInfo.type}`}
      label={
        filterInfo.type === 'number'
          ? filterInfo.symbols[0]
          : `${translatedMsgNoVal(filterInfo.message, t)}`
      }
      value={defaultValues?.[0]?.toString() ?? ''}
      callback={(newVal: string) => {
        onUpdate?.([newVal]);
      }}
      required={true}
      variant={'white'}
      disabled={disabled}
    />
  );
};

/**
 * @internal
 */
const CriteriaFilterMenuDouble: FunctionComponent<CriteriaFilterMenuProps> = (props) => {
  const { filterType, defaultValues = [], onUpdate, disabled } = props;
  const filterInfo = CRITERIA_FILTER_MAP[filterType];
  return (
    <>
      <BasicInput
        type={`${filterInfo.type}`}
        label={filterInfo.symbols[0]}
        value={defaultValues?.[0]?.toString() ?? ''}
        callback={(newVal: string) => {
          onUpdate?.([newVal, defaultValues?.[1]]);
        }}
        required={true}
        variant={'white'}
        disabled={disabled}
      />
      <BasicInput
        type={`${filterInfo.type === 'text' || filterInfo.ranked ? 'text' : 'number'}`}
        label={filterInfo.symbols[1]}
        value={defaultValues?.[1]?.toString() ?? ''}
        callback={(newVal: string) => {
          onUpdate?.([defaultValues?.[0], newVal]);
        }}
        required={true}
        variant={'white'}
        disabled={disabled}
      />
    </>
  );
};

/**
 * UI component that provides field(s) for the user to enter values for a numeric filter.
 *
 * @internal
 */
export const CriteriaFilterMenu: FunctionComponent<CriteriaFilterMenuProps> = ({
  filterType,
  arrangement = 'vertical',
  defaultValues = [],
  onUpdate,
  disabled,
}) => {
  const { themeSettings } = useThemeContext();
  const filterInfo = CRITERIA_FILTER_MAP[filterType];
  return (
    <div
      className={`csdk-w-max csdk-mx-auto csdk-my-2 csdk-px-1 csdk-text-[13px] csdk-flex csdk-gap-x-2 csdk-gap-y-0.5 ${
        isVertical(arrangement) ? 'csdk-flex-col' : 'csdk-flex-row'
      }`}
      style={{ color: `${themeSettings.typography.primaryTextColor}!important` }}
    >
      {filterInfo?.inputCount === 1 && (
        <CriteriaFilterMenuSingle
          filterType={filterType}
          arrangement={arrangement}
          defaultValues={defaultValues}
          onUpdate={onUpdate}
          disabled={disabled}
        />
      )}
      {filterInfo?.inputCount === 2 && (
        <CriteriaFilterMenuDouble
          filterType={filterType}
          arrangement={arrangement}
          defaultValues={defaultValues}
          onUpdate={onUpdate}
          disabled={disabled}
        />
      )}
    </div>
  );
};
