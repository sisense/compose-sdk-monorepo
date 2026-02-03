import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TFunction } from '@sisense/sdk-common';
import { Filter, filterFactory, NumericFilter } from '@sisense/sdk-data';
import isNumber from 'lodash-es/isNumber';

import { useWasModified } from '@/shared/hooks/use-was-modified';
import { isNumericString } from '@/shared/utils/is-numeric-string';

import { Input, SelectableSection } from '../common/index.js';
import { isNumericBetweenFilter } from '../utils.js';

const NUMERIC_RANGE_INPUT_WIDTH = '136px';

function validateFromValue(from: string, to: string, t: TFunction) {
  if (!isNumericString(from)) {
    return t('filterEditor.validationErrors.invalidNumber');
  }

  if (isNumericString(to) && parseFloat(from) > parseFloat(to)) {
    return t('filterEditor.validationErrors.invalidNumericRange');
  }

  return undefined;
}

function validateToValue(to: string, t: TFunction) {
  if (!isNumericString(to)) {
    return t('filterEditor.validationErrors.invalidNumber');
  }

  return undefined;
}

type NumericRangeSectionProps = {
  filter: Filter;
  selected: boolean;
  defaultFrom?: number;
  defaultTo?: number;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const NumericRangeSection = (props: NumericRangeSectionProps) => {
  const { filter, selected, defaultFrom, defaultTo, onChange } = props;
  const { t } = useTranslation();
  const [from, setFrom] = useState<string>(
    isNumericBetweenFilter(filter) ? (filter as NumericFilter).valueA!.toString() : '',
  );
  const [to, setTo] = useState<string>(
    isNumericBetweenFilter(filter) ? (filter as NumericFilter).valueB!.toString() : '',
  );
  const isFromValueWasModified = useWasModified(from, '');
  const isToValueWasModified = useWasModified(to, '');

  useEffect(() => {
    if (isNumber(defaultFrom)) {
      setFrom((existingFrom) => {
        return existingFrom === '' ? defaultFrom.toString() : existingFrom;
      });
    }
  }, [defaultFrom]);

  useEffect(() => {
    if (isNumber(defaultTo)) {
      setTo((existingTo) => {
        return existingTo === '' ? defaultTo.toString() : existingTo;
      });
    }
  }, [defaultTo]);

  const prepareAndChangeFilter = useCallback(
    (from: string, to: string) => {
      const isValidRange = !validateFromValue(from, to, t) && !validateToValue(to, t);
      const newFilter = isValidRange
        ? filterFactory.between(filter.attribute, parseFloat(from), parseFloat(to), filter.config)
        : null;
      onChange(newFilter);
    },
    [filter, t, onChange],
  );

  const handleSectionSelect = useCallback(() => {
    prepareAndChangeFilter(from, to);
  }, [from, to, prepareAndChangeFilter]);

  const handleFromValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const from = e.target.value;
      setFrom(from);
      prepareAndChangeFilter(from, to);
    },
    [to, prepareAndChangeFilter],
  );

  const handleToValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const to = e.target.value;
      setTo(to);
      prepareAndChangeFilter(from, to);
    },
    [from, prepareAndChangeFilter],
  );

  return (
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Numeric range section"
    >
      <span id="numeric-range-from" style={{ margin: '0 8px 0 0' }}>
        {t('filterEditor.labels.from')}
      </span>
      <Input
        style={{
          width: NUMERIC_RANGE_INPUT_WIDTH,
        }}
        placeholder={t('filterEditor.placeholders.enterValue')}
        value={from}
        onChange={handleFromValueChange}
        aria-labelledby="numeric-range-from"
        error={isFromValueWasModified && validateFromValue(from, to, t)}
      />
      <span id="numeric-range-to" style={{ margin: '0 8px 0 8px' }}>
        {t('filterEditor.labels.to')}
      </span>
      <Input
        style={{
          width: NUMERIC_RANGE_INPUT_WIDTH,
        }}
        placeholder={t('filterEditor.placeholders.enterValue')}
        value={to}
        onChange={handleToValueChange}
        aria-labelledby="numeric-range-to"
        error={isToValueWasModified && validateToValue(to, t)}
      />
    </SelectableSection>
  );
};
