import React, { useMemo } from 'react';
import { DateRangeFilter } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';

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

  return (
    <div className="csdk-leading-[26px] csdk-mx-auto csdk-my-2 csdk-px-1 csdk-text-[13px] csdk-whitespace-nowrap csdk-flex csdk-flex-wrap csdk-gap-x-1 csdk-justify-center">
      {textContent}
    </div>
  );
};
