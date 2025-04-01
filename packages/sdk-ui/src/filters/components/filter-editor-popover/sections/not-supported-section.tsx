import React from 'react';
import { SelectableSection } from '../common/selectable-section';
import { useTranslation } from 'react-i18next';

type NotSupportedSectionProps = {
  selected: boolean;
};

/** @internal */
export const NotSupportedSection = ({ selected }: NotSupportedSectionProps) => {
  const { t } = useTranslation();
  return (
    <SelectableSection
      disabled={true}
      selected={selected}
      onSelect={() => {}}
      aria-label="Not supported section"
    >
      {() => <span>{t('unsupportedFilter', { filter: '' })}</span>}
    </SelectableSection>
  );
};
