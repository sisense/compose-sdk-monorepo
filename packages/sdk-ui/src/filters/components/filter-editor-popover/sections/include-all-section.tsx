import React, { useCallback } from 'react';
import { SelectableSection } from '../common/selectable-section';
import { Filter, filterFactory } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';

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
    <SelectableSection selected={selected} onSelect={handleSelect}>
      {(select) => (
        <span style={{ cursor: 'pointer' }} onClick={select}>
          {t('filterEditor.labels.includeAll')}
        </span>
      )}
    </SelectableSection>
  );
};
