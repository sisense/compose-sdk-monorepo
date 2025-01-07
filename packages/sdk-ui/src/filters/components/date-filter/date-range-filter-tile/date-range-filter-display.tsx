import React, { useMemo } from 'react';
import { DateRangeFilter } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';
import { FilterContentDisplay } from '@/filters/components/common/filter-content-display';

type DateRangeFilterDisplayProps = {
  filter: DateRangeFilter;
};

type DisplayVariant = 'from-to' | 'only-from' | 'only-to';

export const DateRangeFilterDisplay: React.FC<DateRangeFilterDisplayProps> = ({ filter }) => {
  const { t } = useTranslation();
  const { from, to } = filter;

  const displayVariant: DisplayVariant = from && to ? 'from-to' : from ? 'only-from' : 'only-to';

  const textContent = useMemo(() => {
    switch (displayVariant) {
      case 'from-to':
        return t('dateFilter.dateRange.fromTo', { from, to });
      case 'only-from':
        return t('dateFilter.dateRange.from', { val: from });
      case 'only-to':
        return t('dateFilter.dateRange.to', { val: to });
      default:
        return '';
    }
  }, [displayVariant, from, to, t]);

  return <FilterContentDisplay>{textContent}</FilterContentDisplay>;
};
