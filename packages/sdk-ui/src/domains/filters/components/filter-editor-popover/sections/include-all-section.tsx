import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Filter, filterFactory } from '@sisense/sdk-data';

import { SelectableSection } from '../common/selectable-section.js';

type IncludeAllSectionProps = {
  filter: Filter;
  selected: boolean;
  onChange: (newFilter: Filter) => void;
};

/** @internal */
export const IncludeAllSection = ({ filter, selected, onChange }: IncludeAllSectionProps) => {
  const { t } = useTranslation();
  const handleSelect = useCallback(() => {
    const includeAllFilter = filterFactory.members(filter.attribute, [], filter?.config);
    onChange(includeAllFilter);
  }, [onChange, filter]);

  return (
    <SelectableSection selected={selected} onSelect={handleSelect} aria-label="Include all section">
      {(select) => (
        <span style={{ cursor: 'pointer' }} onClick={select}>
          {t('filterEditor.labels.includeAll')}
        </span>
      )}
    </SelectableSection>
  );
};
