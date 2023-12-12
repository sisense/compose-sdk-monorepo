/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable security/detect-object-injection */
import { FunctionComponent } from 'react';
import { BasicInput, RadioGroup } from '../common';
import {
  FilterOptionType,
  CRITERIA_FILTER_MAP,
  isVertical,
  FilterVariant,
  translatedMsgNoVal,
  CriteriaFilterValueType,
  filterTypeToInputType,
} from './criteria-filter-operations';
import { useThemeContext } from '../../../../src/theme-provider';
import { useTranslation } from 'react-i18next';
import { FilterTypes, Measure } from '@sisense/sdk-data';
import { Dropdown } from '../common/dropdown';

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
  defaultValues?: CriteriaFilterValueType[];
  /* Callback for when input fields are updated */
  onUpdate?: (values: CriteriaFilterValueType[]) => void;
  /* Whether the filter is disabled */
  disabled?: boolean;
  /* List of available measures for ranking filters */
  measures?: Measure[];
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
      type={filterTypeToInputType(filterInfo.type)}
      label={
        filterInfo.type === FilterTypes.numeric
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
        type={filterTypeToInputType(filterInfo.type)}
        label={filterInfo.symbols[0]}
        value={(defaultValues?.[0] as string | number) ?? ''}
        callback={(newVal: string) => {
          onUpdate?.([newVal, defaultValues?.[1]]);
        }}
        required={true}
        variant={'white'}
        disabled={disabled}
      />
      <BasicInput
        type={filterTypeToInputType(filterInfo.type)}
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
 * @internal
 */
const CriteriaFilterMenuRanked: FunctionComponent<CriteriaFilterMenuProps> = (props) => {
  const {
    filterType,
    defaultValues = [],
    onUpdate,
    arrangement = 'vertical',
    disabled,
    measures = [],
  } = props;
  const filterInfo = CRITERIA_FILTER_MAP[filterType];
  const selectedMeasure = defaultValues?.[1] as Measure;
  const { t } = useTranslation();

  const radioGroup = () => {
    return (
      <RadioGroup
        className={
          'csdk-flex csdk-flex-col csdk-max-h-32 csdk-overflow-auto csdk-border-solid csdk-border-input csdk-p-px csdk-rounded-md'
        }
        items={measures.map((m) => m.name)}
        onChange={(event) => {
          onUpdate?.([
            Number(defaultValues?.[0]),
            measures.find((m) => m.name === event.target.value) ?? measures[0],
          ]);
        }}
        currentSelection={selectedMeasure.name}
        title={t('criteriaFilter.byMeasure')}
        disabled={disabled}
      />
    );
  };

  const selectedIdx = measures.findIndex((m) => m.name === selectedMeasure.name);
  const dropdownItems = measures.map((m) => {
    return (
      <div
        key={m.name}
        onClick={() => {
          if (m.name !== selectedMeasure.name)
            onUpdate?.([
              Number(defaultValues?.[0]),
              measures.find((meas) => meas.name === m.name) ?? measures[0],
            ]);
        }}
      >
        {m.name}
      </div>
    );
  });

  const dropdown = () => {
    return (
      <div className="csdk-flex csdk-h-6 csdk-items-center">
        {t('criteriaFilter.by')}
        <Dropdown elements={dropdownItems} selectedIdx={selectedIdx} />
      </div>
    );
  };

  const displayName = () => {
    return (
      <div className={isVertical(arrangement) ? '' : 'csdk-self-center'}>{`${t(
        'criteriaFilter.by',
      )} ${selectedMeasure.name}`}</div>
    );
  };

  return (
    <>
      <BasicInput
        type={filterTypeToInputType(filterInfo.type)}
        label={filterInfo.symbols[0]}
        value={defaultValues?.[0]?.toString() ?? ''}
        callback={(newVal: string) => {
          if (newVal) onUpdate?.([Number(newVal), defaultValues?.[1]]);
        }}
        required={true}
        variant={'white'}
        disabled={disabled}
      />
      {measures && measures.length > 0
        ? isVertical(arrangement)
          ? radioGroup()
          : dropdown()
        : displayName()}
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
  measures,
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
      {filterInfo?.inputCount === 2 && !filterInfo.ranked && (
        <CriteriaFilterMenuDouble
          filterType={filterType}
          arrangement={arrangement}
          defaultValues={defaultValues}
          onUpdate={onUpdate}
          disabled={disabled}
        />
      )}
      {filterInfo?.inputCount === 2 && filterInfo.ranked && (
        <CriteriaFilterMenuRanked
          filterType={filterType}
          arrangement={arrangement}
          defaultValues={defaultValues}
          onUpdate={onUpdate}
          disabled={disabled}
          measures={measures}
        />
      )}
    </div>
  );
};
