/* eslint-disable security/detect-object-injection */
import { CSSProperties, FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import { Attribute, FilterTypes, isLevelAttribute, Measure } from '@sisense/sdk-data';

import { getRankingMeasureDisplayName } from '@/domains/data-browser/add-measure-popover/measure-ranking-title';
import { useThemeContext } from '@/infra/contexts/theme-provider';

import { Dropdown } from '../common/dropdown.js';
import { FilterVariant, isVertical } from '../common/filter-utils.js';
import { BasicInput, RadioGroup } from '../common/index.js';
import {
  CRITERIA_FILTER_MAP,
  CriteriaFilterValueType,
  FilterOptionType,
  filterTypeToInputType,
  getRankingTypeLabel,
  translatedMsgNoVal,
} from './criteria-filter-operations.js';

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
  /* Filter attribute — used to show date level in datetime ranking filters */
  attribute?: Attribute;
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

const RankTopRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  line-height: 24px;
`;

const RankTypeLabel = styled.span`
  flex-shrink: 0;
  font-size: 13px;
`;

const RankControlsGroup = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  max-width: 140px;
  flex-shrink: 1;
`;

const RankCountInput = styled.div`
  flex-shrink: 1;
  min-width: 1px;
  margin-right: 4px;
  margin-top: -2px;
`;

const RankDateLevelLabel = styled.span`
  flex-shrink: 0;
  margin-left: 5px;
  font-size: 13px;
`;

const RankByLabel = styled.span`
  flex-shrink: 0;
  margin-left: 5px;
  font-size: 13px;
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
    attribute,
  } = props;
  const filterInfo = CRITERIA_FILTER_MAP[filterType];
  const selectedMeasure = defaultValues?.[1] as Measure;
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const dateLevelLabel =
    attribute && isLevelAttribute(attribute) ? attribute.granularity.toLowerCase() : null;
  const measureDisplayNames = useMemo(
    () => measures.map((measure) => getRankingMeasureDisplayName(measure, t)),
    [measures, t],
  );
  const selectedMeasureDisplayName = getRankingMeasureDisplayName(selectedMeasure, t);

  const radioGroup = () => {
    return (
      <RadioGroup
        className={
          'csdk-flex csdk-flex-col csdk-max-h-32 csdk-overflow-auto csdk-border-solid csdk-border-input csdk-p-px csdk-rounded-md'
        }
        items={measureDisplayNames}
        onChange={(event) => {
          const selectedIndex = measureDisplayNames.indexOf(event.target.value);
          onUpdate?.([
            Number(defaultValues?.[0]),
            measures[selectedIndex >= 0 ? selectedIndex : 0],
          ]);
        }}
        currentSelection={selectedMeasureDisplayName}
        title={t('criteriaFilter.byMeasure')}
        disabled={disabled}
      />
    );
  };

  // measures will always have findIndex as it falls back to an empty array
  const selectedIdx = measures.findIndex((m) => m.name === selectedMeasure.name);
  const dropdownItems = measures.map((m, index) => {
    return (
      <div
        key={m.name}
        onClick={() => {
          if (m.name !== selectedMeasure.name)
            onUpdate?.([Number(defaultValues?.[0]), measures[index] ?? measures[0]]);
        }}
      >
        {measureDisplayNames[index]}
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
        {selectedMeasureDisplayName}
      </RankedName>
    );
  };

  return (
    <>
      <RankTopRow>
        <RankTypeLabel>{getRankingTypeLabel(filterType, t)}</RankTypeLabel>
        <RankControlsGroup>
          <RankCountInput>
            <BasicInput
              type={filterTypeToInputType(filterInfo.type)}
              value={defaultValues?.[0]?.toString() ?? ''}
              callback={(newVal: string) => {
                if (newVal) onUpdate?.([Number(newVal), defaultValues?.[1]]);
              }}
              required={true}
              disabled={disabled}
              containerStyle={{
                gap: 0,
                width: 'auto',
              }}
              inputStyle={{
                width: 40,
              }}
            />
          </RankCountInput>
          {dateLevelLabel && <RankDateLevelLabel>{dateLevelLabel}</RankDateLevelLabel>}
          <RankByLabel>{t('criteriaFilter.by')}:</RankByLabel>
        </RankControlsGroup>
      </RankTopRow>
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
  attribute,
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
          attribute={attribute}
        />
      )}
    </div>
  );
};
