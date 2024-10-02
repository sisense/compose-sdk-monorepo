/* eslint-disable security/detect-object-injection */
import { CSSProperties, FunctionComponent } from 'react';
import { BasicInput, RadioGroup } from '../common';
import {
  FilterOptionType,
  CRITERIA_FILTER_MAP,
  translatedMsgNoVal,
  CriteriaFilterValueType,
  filterTypeToInputType,
} from './criteria-filter-operations';
import { useThemeContext } from '../../../../src/theme-provider';
import { useTranslation } from 'react-i18next';
import { FilterTypes, Measure } from '@sisense/sdk-data';
import { Dropdown } from '../common/dropdown';
import { FilterVariant, isVertical } from '../common/filter-utils';
import styled from '@emotion/styled';

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

const isValidNumericValue = (val: string) => !(isNaN(Number(val)) || val === '');

/**
 * @internal
 */
const CriteriaFilterMenuSingle: FunctionComponent<CriteriaFilterMenuProps> = (props) => {
  const { filterType, defaultValues = [], onUpdate, disabled } = props;
  const filterInfo = CRITERIA_FILTER_MAP[filterType];
  const { t } = useTranslation();

  const styleProps =
    filterInfo.type === FilterTypes.text
      ? {
          containerStyle: {
            flexDirection: 'column',
            alignItems: 'flex-start',
          } as CSSProperties,
          labelStyle: {
            margin: '0 0 8px 10px',
          } as CSSProperties,
        }
      : {};
  const value = defaultValues?.[0]?.toString() ?? '';

  return (
    <BasicInput
      type={filterTypeToInputType(filterInfo.type)}
      label={
        filterInfo.type === FilterTypes.numeric
          ? filterInfo.symbols[0]
          : `${translatedMsgNoVal(filterInfo.message, t)}`
      }
      value={value}
      callback={(newVal: string) => {
        onUpdate?.([
          filterInfo.type === FilterTypes.numeric
            ? isValidNumericValue(newVal)
              ? Number(newVal)
              : Number(value)
            : newVal,
        ]);
      }}
      required={filterInfo.type === FilterTypes.numeric}
      disabled={disabled}
      {...styleProps}
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
          onUpdate?.([
            filterInfo.type === FilterTypes.numeric
              ? isValidNumericValue(newVal)
                ? Number(newVal)
                : Number(defaultValues?.[0])
              : newVal,
            defaultValues?.[1],
          ]);
        }}
        required={true}
        disabled={disabled}
      />
      <BasicInput
        type={filterTypeToInputType(filterInfo.type)}
        label={filterInfo.symbols[1]}
        value={defaultValues?.[1]?.toString() ?? ''}
        callback={(newVal: string) => {
          onUpdate?.([
            defaultValues?.[0],
            filterInfo.type === FilterTypes.numeric
              ? isValidNumericValue(newVal)
                ? Number(newVal)
                : Number(defaultValues?.[1])
              : newVal,
          ]);
        }}
        required={true}
        disabled={disabled}
      />
    </>
  );
};

const RankedName = styled.div<{ backgroundColor: string }>`
  padding: 7px;
  border: 1px solid #e6e6e6;
  position: relative;
  margin-top: 15px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  z-index: 1;

  &:before {
    content: '';
    position: absolute;
    width: 15px;
    height: 15px;
    border-top: 1px solid #e6e6e6;
    border-right: 1px solid #e6e6e6;
    border-radius: 0 5px 0 0;
    background-color: ${({ backgroundColor }) => backgroundColor};
    transform: rotate(-45deg);
    top: -9px;
    left: 12px;
    z-index: 2;
  }
`;

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
  const { themeSettings } = useThemeContext();

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
      <RankedName
        backgroundColor={themeSettings.general.backgroundColor}
        className={isVertical(arrangement) ? '' : 'csdk-self-center'}
      >
        {selectedMeasure.name}
      </RankedName>
    );
  };

  return (
    <>
      <div className={'csdk-flex csdk-items-center'}>
        <div className={'csdk-grow'}>
          <BasicInput
            type={filterTypeToInputType(filterInfo.type)}
            label={filterInfo.symbols[0]}
            value={defaultValues?.[0]?.toString() ?? ''}
            callback={(newVal: string) => {
              if (newVal) onUpdate?.([Number(newVal), defaultValues?.[1]]);
            }}
            required={true}
            disabled={disabled}
            containerStyle={{
              justifyContent: 'space-between',
            }}
            inputStyle={{
              width: 40,
            }}
          />
        </div>
        <div className={'csdk-ml-[10px]'}>{t('criteriaFilter.by')}:</div>
      </div>
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
      className={`csdk-w-100 csdk-p-[12px] csdk-text-[13px] csdk-flex csdk-gap-x-2 csdk-gap-y-0.5 ${
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
